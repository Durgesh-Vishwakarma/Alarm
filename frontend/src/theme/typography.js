import { tokens } from "./tokens";

/** Plus Jakarta stack + legacy aliases used across screens */
export const typography = {
  family: {
    ...tokens.typography.fontFamily,
    bold: "Plus-Bold",
    medium: "Plus-Medium",
    regular: "Plus-Regular",
  },
  size: tokens.typography.size,
  lineHeight: tokens.typography.lineHeight,
  
  // Backward compatibility aliases if needed
  hierarchy: {
    hero: {
      fontFamily: tokens.typography.fontFamily.hero,
      fontSize: tokens.typography.size.hero,
    },
    section: {
      fontFamily: tokens.typography.fontFamily.section,
      fontSize: tokens.typography.size.section,
    },
    card: {
      fontFamily: tokens.typography.fontFamily.card,
      fontSize: tokens.typography.size.card,
    },
    metadata: {
      fontFamily: tokens.typography.fontFamily.metadata,
      fontSize: tokens.typography.size.metadata,
    },
    caption: {
      fontFamily: tokens.typography.fontFamily.caption,
      fontSize: tokens.typography.size.caption,
    },
  }
};
