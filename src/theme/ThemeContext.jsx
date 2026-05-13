import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { DEFAULT_THEME_ID, THEMES } from "./themes";

const STORAGE_KEY_THEME = "@snapwake_theme_id";
const STORAGE_KEY_DARK  = "@snapwake_dark_mode";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [themeId, setThemeId]   = useState(DEFAULT_THEME_ID);
  const [isDark,  setIsDark]    = useState(false);

  // Load persisted preferences on mount
  useEffect(() => {
    (async () => {
      try {
        const [savedTheme, savedDark] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY_THEME),
          AsyncStorage.getItem(STORAGE_KEY_DARK),
        ]);
        if (savedTheme && THEMES[savedTheme]) setThemeId(savedTheme);
        if (savedDark !== null) setIsDark(savedDark === "true");
      } catch (_) {}
    })();
  }, []);

  const selectTheme = useCallback(async (id) => {
    if (!THEMES[id]) return;
    setThemeId(id);
    try { await AsyncStorage.setItem(STORAGE_KEY_THEME, id); } catch (_) {}
  }, []);

  const toggleDark = useCallback(async () => {
    setIsDark((prev) => {
      const next = !prev;
      AsyncStorage.setItem(STORAGE_KEY_DARK, String(next)).catch(() => {});
      return next;
    });
  }, []);

  const theme = THEMES[themeId][isDark ? "dark" : "light"];

  return (
    <ThemeContext.Provider value={{ themeId, isDark, theme, selectTheme, toggleDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

/** Hook — use anywhere in the app */
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}
