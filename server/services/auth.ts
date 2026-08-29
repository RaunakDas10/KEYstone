import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { OAuth2Client } from 'google-auth-library';

const HASH_ITERATIONS = 100000;
const KEY_LENGTH = 64;
const DIGEST = 'sha512';

export const generateOtp = (): string => crypto.randomInt(100000, 1000000).toString();

/**
 * OTPs are intentionally stored as an HMAC, rather than as the code that was
 * emailed to the user. SMTP_PASS is a safe fallback for existing deployments,
 * but AUTH_OTP_SECRET should be set independently in production.
 */
const getOtpSecret = (): string => process.env.AUTH_OTP_SECRET || process.env.SMTP_PASS || 'keystone-development-otp-secret';

export const hashOtp = (otp: string): string =>
  crypto.createHmac('sha256', getOtpSecret()).update(otp).digest('hex');

export const verifyOtp = (otp: string, storedHash: string): boolean => {
  const candidate = hashOtp(otp);
  const stored = Buffer.from(storedHash, 'hex');
  const supplied = Buffer.from(candidate, 'hex');
  return stored.length === supplied.length && crypto.timingSafeEqual(stored, supplied);
};

export const hashPassword = async (password: string): Promise<string> => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, HASH_ITERATIONS, KEY_LENGTH, DIGEST).toString('hex');
  return `${salt}:${hash}`;
};

export const verifyPassword = async (password: string, storedHash: string): Promise<boolean> => {
  if (!storedHash || !storedHash.includes(':')) {
    return false;
  }

  const [salt, originalHash] = storedHash.split(':');
  if (!salt || !originalHash) {
    return false;
  }

  try {
    const candidate = crypto.pbkdf2Sync(password, salt, HASH_ITERATIONS, KEY_LENGTH, DIGEST).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(originalHash, 'hex'), Buffer.from(candidate, 'hex'));
  } catch {
    return false;
  }
};

export const sendOtpEmail = async (email: string, otp: string): Promise<void> => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || user;

  if (!host || !user || !pass) {
    throw new Error('SMTP is not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASS in your environment.');
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from,
    to: email,
    subject: 'KEYStone email verification code',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 24px; background: #020817; color: #e2e8f0;">
        <h2 style="margin-bottom: 12px;">KEYStone Verification</h2>
        <p>Your OTP code is:</p>
        <div style="margin: 16px 0; font-size: 30px; font-weight: 700; letter-spacing: 4px; color: #60a5fa;">${otp}</div>
        <p>This code expires in 10 minutes.</p>
      </div>
    `,
  });
};

export const verifyGoogleToken = async (token: string) => {
  if (!process.env.GOOGLE_CLIENT_ID) {
    throw new Error('GOOGLE_CLIENT_ID is not configured.');
  }

  const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  const ticket = await googleClient.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload || !payload.email || payload.email_verified !== true) {
    throw new Error('Google account email could not be verified.');
  }

  return payload;
};
