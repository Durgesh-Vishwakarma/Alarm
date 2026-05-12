export const buildPrompt = ({ challengeTitle, targets = [] }) => {
  const targetText = targets.length > 0 ? targets.join(", ") : challengeTitle;

  return `
You are verifying a wake-up alarm challenge.

Your task:
Determine whether this image CLEARLY contains or shows:

"${targetText}"

Rules:
- Object/scene must be real
- Ignore drawings if possible
- Ignore screenshots if possible
- Target should be clearly visible
- Be strict but reasonable

Reply ONLY with:
YES
or
NO
`;
};
