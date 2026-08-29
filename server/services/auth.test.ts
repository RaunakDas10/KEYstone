import assert from 'node:assert/strict';
import test from 'node:test';

import { generateOtp, hashOtp, hashPassword, verifyOtp, verifyPassword } from './auth';

test('generateOtp returns a 6 digit code', () => {
  const otp = generateOtp();
  assert.equal(typeof otp, 'string');
  assert.match(otp, /^\d{6}$/);
});

test('hashPassword and verifyPassword work together', async () => {
  const password = 'SecurePass123!';
  const hashed = await hashPassword(password);
  assert.notEqual(hashed, password);
  assert.equal(await verifyPassword(password, hashed), true);
  assert.equal(await verifyPassword('wrong', hashed), false);
});

test('OTP hashes can be verified without retaining the OTP itself', () => {
  const otp = generateOtp();
  const hashed = hashOtp(otp);
  assert.notEqual(hashed, otp);
  assert.equal(verifyOtp(otp, hashed), true);
  assert.equal(verifyOtp('000000', hashed), false);
});
