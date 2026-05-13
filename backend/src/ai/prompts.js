export const buildPrompt = ({ challengeTitle, targets = [] }) => {
  const targetText = targets.length > 0 ? targets.join(", ") : challengeTitle;

  return `You are verifying a wake-up alarm challenge.
Determine if the image CLEARLY shows: "${targetText}"

Reply ONLY:
YES
or
NO
`;
};
