const assert = require('node:assert/strict');

const {
  VERIFICATION_SUCCESS_REDIRECT_MS,
  getVerificationHomeRedirectDelay,
} = require('./verificationResult');

assert.equal(VERIFICATION_SUCCESS_REDIRECT_MS, 10_000);
assert.equal(getVerificationHomeRedirectDelay(true), 10_000);
assert.equal(getVerificationHomeRedirectDelay(false), null);

console.log('verification result redirect rules passed');
