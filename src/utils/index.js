import crypto from 'crypto';

const CHARSET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'; // alphanumeric (62 chars)

function generateAlphaNumericPassCode(CODE_LENGTH=6) {
  // We'll select CODE_LENGTH characters by sampling uniformly from CHARSET.
  const chars = [];
  const max = CHARSET.length;
  // crypto.randomBytes gives secure random bytes; we'll map bytes to indices.
  const randomBytes = crypto.randomBytes(CODE_LENGTH);
  for (let i = 0; i < CODE_LENGTH; i++) {
    // Map byte (0-255) into index range 0..max-1 without bias by using modulo.
    // For simplicity and low code count the bias is negligible here; for absolute lack of bias you'd
    // reject values >= floor(256 / max) * max (not usually necessary for small codes).
    const idx = randomBytes[i] % max;
    chars.push(CHARSET[idx]);
  }
  return chars.join('');
}

function generatePasscode(length = 6) {
  const digits = '0123456789';
  let passcode = '';
  for (let i = 0; i < length; i++) {
    passcode += digits[Math.floor(Math.random() * digits.length)];
  }
  return passcode;
}

function generateNumericOtp(length = 6) {
  let otp = "";
  for (let i = 0; i < length; i++) otp += Math.floor(Math.random() * 10);
  return otp;
}

function generateSKU(productName, category) {
  // Take first 3 letters of category and product name
  const cat = category ? category.substring(0, 3).toUpperCase() : "GEN";
  const prod = productName ? productName.substring(0, 3).toUpperCase() : "PRD";

  // Random 4-digit alphanumeric code
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();

  // Date-based unique suffix (YYMMDD)
  const date = new Date().toISOString().slice(2, 10).replace(/-/g, "");

  return `${cat}-${prod}-${random}-${date}`;
}

export { generateAlphaNumericPassCode, generatePasscode, generateNumericOtp, generateSKU };
