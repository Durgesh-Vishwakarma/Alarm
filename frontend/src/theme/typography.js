import { tokens } from "./tokens";

/** Outfit stack + premium hierarchy aliases used across screens */
export const typography = {
  family: {
    ...tokens.typography.fontFamily,
    regular: "Outfit-Regular",
    medium: "Outfit-Medium",
    semiBold: "Outfit-SemiBold",
    bold: "Outfit-Bold",
    extraBold: "Outfit-ExtraBold",
  },
  size: tokens.typography.size,
  lineHeight: tokens.typography.lineHeight,
  styles: tokens.typography.styles,
  
  // Backward compatibility aliases if needed
  hierarchy: {
    hero: {
      fontFamily: tokens.typography.fontFamily.hero,
      fontSize: tokens.typography.size.hero,
      lineHeight: tokens.typography.styles.displayLarge.lineHeight,
      letterSpacing: tokens.typography.styles.displayLarge.letterSpacing,
    },
    section: {
      fontFamily: tokens.typography.fontFamily.section,
      fontSize: tokens.typography.size.section,
      lineHeight: tokens.typography.styles.titleLarge.lineHeight,
      letterSpacing: tokens.typography.styles.titleLarge.letterSpacing,
    },
    card: {
      fontFamily: tokens.typography.fontFamily.card,
      fontSize: tokens.typography.size.card,
      lineHeight: tokens.typography.styles.titleMedium.lineHeight,
      letterSpacing: tokens.typography.styles.titleMedium.letterSpacing,
    },
    metadata: {
      fontFamily: tokens.typography.fontFamily.metadata,
      fontSize: tokens.typography.size.metadata,
      lineHeight: tokens.typography.styles.caption.lineHeight,
      letterSpacing: tokens.typography.styles.caption.letterSpacing,
    },
    caption: {
      fontFamily: tokens.typography.fontFamily.caption,
      fontSize: tokens.typography.size.caption,
      lineHeight: tokens.typography.styles.caption.lineHeight,
      letterSpacing: tokens.typography.styles.caption.letterSpacing,
    },
  }
};
