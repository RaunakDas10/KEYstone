import crypto from 'crypto';
import { Router, type Request, type Response } from 'express';
import { UserModel } from '../models/User';
import { generateOtp, hashOtp, hashPassword, sendOtpEmail, verifyGoogleToken, verifyOtp, verifyPassword } from '../services/auth';
import { recalculateTrustScore } from '../services/trustScore';

const router = Router();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OTP_EXPIRY_MS = 10 * 60 * 1000;
const OTP_RESEND_COOLDOWN_MS = 60 * 1000;
const FREELANCER_ROLES = new Set([
  'Frontend Developer', 'Backend Developer', 'Full-stack Developer', 'Mobile Developer',
  'UI/UX Designer', 'Product Designer', 'Graphic Designer', 'Data Analyst',
  'Data Scientist', 'AI/ML Engineer', 'DevOps Engineer', 'QA Engineer',
  'Content Writer', 'Digital Marketer', 'Project Manager',
]);

const sanitizeUser = (user: any) => ({
  ...user.toObject(),
  passwordHash: undefined,
  otpCode: undefined,
  otpExpiresAt: undefined,
});

const issueVerificationOtp = async (user: any): Promise<string> => {
  if (user.otpLastSentAt && Date.now() - new Date(user.otpLastSentAt).getTime() < OTP_RESEND_COOLDOWN_MS) {
    throw new Error('Please wait one minute before requesting another verification code.');
  }

  const otp = generateOtp();
  user.otpCode = hashOtp(otp);
  user.otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MS);
  user.otpLastSentAt = new Date();
  await user.save();
  return otp;
};

router.get('/google-client-id', (_req: Request, res: Response): void => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    res.status(503).json({ error: 'Google Sign-In is not configured.' });
    return;
  }

  // OAuth client IDs are public identifiers. Keeping this endpoint avoids a
  // second, easily-missed VITE_ environment variable for the browser.
  res.json({ clientId });
});

router.get('/users', async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await UserModel.find().sort({ joinedDate: -1 });
    res.json(users.map((user) => sanitizeUser(user)));
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/users/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await UserModel.findOne({ id: req.params.id });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json(sanitizeUser(user));
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.put('/users/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await UserModel.findOne({ id: req.params.id });
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    const editableFields = [
      'name', 'avatar', 'title', 'bio', 'pronouns', 'company', 'location',
      'website', 'linkedin', 'github', 'instagram', 'xHandle', 'showLocalTime', 'skills', 'freelancerRoles',
    ];
    for (const field of editableFields) {
      if (field in (req.body || {})) {
        (user as any)[field] = req.body[field];
      }
    }

    if ('freelancerRoles' in (req.body || {})) {
      if (user.role !== 'freelancer') {
        res.status(403).json({ error: 'Freelancer roles can only be selected by freelancer accounts.' });
        return;
      }
      const requestedRoles: unknown[] = Array.isArray(req.body.freelancerRoles) ? req.body.freelancerRoles : [];
      if (requestedRoles.some((role) => typeof role !== 'string' || !FREELANCER_ROLES.has(role))) {
        res.status(400).json({ error: 'One or more selected freelancer roles are invalid.' });
        return;
      }
      user.freelancerRoles = [...new Set(requestedRoles as string[])];
    }

    user.profileCompleted = true;
    await user.save();
    const updatedUser = await recalculateTrustScore(user.id);
    res.json(sanitizeUser(updatedUser || user));
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body || {};
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const normalizedName = String(name || '').trim();

    if (!normalizedName || !normalizedEmail || !password) {
      res.status(400).json({ error: 'Name, email, and password are required.' });
      return;
    }

    if (!emailPattern.test(normalizedEmail)) {
      res.status(400).json({ error: 'Please enter a valid email address.' });
      return;
    }

    if (String(password).length < 8) {
      res.status(400).json({ error: 'Password must be at least 8 characters long.' });
      return;
    }

    let user = await UserModel.findOne({ email: normalizedEmail });
    const isNewUser = !user;
    if (user?.emailVerified || user?.verified || user?.authProvider === 'google') {
      res.status(409).json({ error: 'An account with this email already exists.' });
      return;
    }

    if (!user) {
      const passwordHash = await hashPassword(String(password));
      user = await UserModel.create({
        id: crypto.randomUUID(),
        name: normalizedName,
        email: normalizedEmail,
        role: role === 'freelancer' ? 'freelancer' : 'client',
        passwordHash,
        emailVerified: false,
        authProvider: 'email',
        verified: false,
        profileCompleted: false,
        trustScore: 0,
        onTimeRate: 0,
        completionRate: 0,
        joinedDate: new Date().toISOString().split('T')[0],
      });
    }

    const otp = await issueVerificationOtp(user);
    await sendOtpEmail(normalizedEmail, otp);
    res.status(isNewUser ? 201 : 200).json({
      message: 'OTP sent to your email. Verify your email to complete registration.',
      email: normalizedEmail,
      userId: user.id,
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post('/send-otp', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body || {};
    const normalizedEmail = String(email || '').trim().toLowerCase();

    if (!normalizedEmail || !emailPattern.test(normalizedEmail)) {
      res.status(400).json({ error: 'A valid email is required.' });
      return;
    }

    const user = await UserModel.findOne({ email: normalizedEmail });
    if (!user) {
      res.status(404).json({ error: 'No account found for this email.' });
      return;
    }

    if (user.emailVerified || user.verified) {
      res.status(400).json({ error: 'This email is already verified.' });
      return;
    }

    const otp = await issueVerificationOtp(user);
    await sendOtpEmail(normalizedEmail, otp);
    res.json({ message: 'OTP resent successfully.', email: normalizedEmail });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post('/verify-otp', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp } = req.body || {};
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const otpCode = String(otp || '').trim();

    if (!normalizedEmail || !otpCode) {
      res.status(400).json({ error: 'Email and OTP are required.' });
      return;
    }

    const user = await UserModel.findOne({ email: normalizedEmail });
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    if (!user.otpCode || !user.otpExpiresAt || new Date() > new Date(user.otpExpiresAt)) {
      res.status(400).json({ error: 'OTP expired or invalid. Request a new one.' });
      return;
    }

    if (!verifyOtp(otpCode, user.otpCode)) {
      res.status(400).json({ error: 'Incorrect OTP.' });
      return;
    }

    user.emailVerified = true;
    user.verified = true;
    user.otpCode = undefined;
    user.otpExpiresAt = undefined;
    user.otpLastSentAt = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully.', user: sanitizeUser(user) });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body || {};
    const normalizedEmail = String(email || '').trim().toLowerCase();

    if (!normalizedEmail || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const user = await UserModel.findOne({ email: normalizedEmail });
    if (!user) {
      res.status(401).json({ error: 'No account found for this email.' });
      return;
    }

    if (!user.passwordHash) {
      res.status(401).json({ error: 'This account was created using Google Sign-In. Use Google to sign in.' });
      return;
    }

    if (!user.emailVerified && !user.verified) {
      res.status(401).json({ error: 'Please verify your email before logging in.' });
      return;
    }

    const isValid = await verifyPassword(String(password), user.passwordHash);
    if (!isValid) {
      res.status(401).json({ error: 'Incorrect password.' });
      return;
    }

    res.json({ user: sanitizeUser(user), message: 'Login successful.' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post('/google', async (req: Request, res: Response): Promise<void> => {
  try {
    const { credential, role } = req.body || {};
    if (!credential) {
      res.status(400).json({ error: 'Google credential is required.' });
      return;
    }

    const payload = await verifyGoogleToken(String(credential));
    const email = payload.email?.toLowerCase();

    if (!email) {
      res.status(400).json({ error: 'Google email could not be verified.' });
      return;
    }

    let user = await UserModel.findOne({ email });
    if (!user) {
      user = await UserModel.create({
        id: crypto.randomUUID(),
        name: payload.name || 'Google User',
        email,
        role: role === 'freelancer' ? 'freelancer' : 'client',
        avatar: payload.picture,
        authProvider: 'google',
        googleId: payload.sub,
        emailVerified: true,
        verified: true,
        profileCompleted: false,
        trustScore: 0,
        onTimeRate: 0,
        completionRate: 0,
        joinedDate: new Date().toISOString().split('T')[0],
      });
    } else {
      if (user.googleId && user.googleId !== payload.sub) {
        res.status(409).json({ error: 'This email is linked to a different Google account.' });
        return;
      }

      if (!user.googleId) user.googleId = payload.sub;
      user.emailVerified = true;
      user.verified = true;
      if (!user.avatar && payload.picture) user.avatar = payload.picture;
      await user.save();
    }

    res.json({ message: 'Google sign-in successful.', user: sanitizeUser(user) });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
