const VERIFICATION_SUCCESS_REDIRECT_MS = 10_000;

function getVerificationHomeRedirectDelay(success) {
  return success ? VERIFICATION_SUCCESS_REDIRECT_MS : null;
}

module.exports = {
  VERIFICATION_SUCCESS_REDIRECT_MS,
  getVerificationHomeRedirectDelay,
};
