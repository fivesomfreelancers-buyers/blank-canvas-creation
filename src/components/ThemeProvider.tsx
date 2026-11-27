import React, { createContext, useContext, useEffect, useRef, useState } from "react";

type Theme = "light" | "dark";

export type ThemePreference = "system" | "light" | "dark";
interface ThemeContextValue {
  theme: Theme;
  preference: ThemePreference;
  setPreference: (p: ThemePreference) => void;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const applyThemeClass = (theme: Theme) => {
  const root = window.document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  localStorage.setItem("theme", theme);
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preference, setPrefState] = useState<ThemePreference>(() => {
    const v = typeof window !== "undefined" ? localStorage.getItem("theme-preference") : null;
    return v === "system" || v === "dark" ? v : "light";
  });
  const resolve = (p: ThemePreference): Theme =>
    p === "system" ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : p;
  const [theme, setThemeState] = useState<Theme>(() => (typeof window !== "undefined" ? resolve(preference) : "light"));
  useEffect(() => {
    if (preference !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const on = () => setThemeState(mq.matches ? "dark" : "light");
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [preference]);
  const animating = useRef(false);

  // Keep the DOM in sync (also covers the very first render).
  useEffect(() => {
    applyThemeClass(theme);
  }, [theme]);

  const changeTheme = (next: Theme) => {
    if (typeof document === "undefined" || next === theme) {
      setThemeState(next);
      return;
    }

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const supported = typeof (document as any).startViewTransition === "function";

    if (!supported || prefersReduced || animating.current) {
      setThemeState(next);
      return;
    }

    // Dark -> Light sweeps in from the right; Light -> Dark sweeps in from the left.
    const fromRight = next === "light";
    const root = document.documentElement;
    root.dataset.themeSweep = fromRight ? "right" : "left";
    animating.current = true;

    const transition = (document as any).startViewTransition(() => {
      applyThemeClass(next);
      setThemeState(next);
    });

    transition.ready
      .then(() => {
        const { innerWidth: w, innerHeight: h } = window;
        const originX = fromRight ? w : 0;
        const originY = h / 2;
        const radius = Math.hypot(Math.max(originX, w - originX), Math.max(originY, h - originY));

        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${originX}px ${originY}px)`,
              `circle(${radius}px at ${originX}px ${originY}px)`,
            ],
          },
          {
            duration: 620,
            easing: "cubic-bezier(0.65, 0, 0.35, 1)",
            pseudoElement: "::view-transition-new(root)",
          }
        );
      })
      .catch(() => {});

    transition.finished
      .then(() => {
        animating.current = false;
        delete root.dataset.themeSweep;
      })
      .catch(() => {
        animating.current = false;
      });
  };

  const setPreference = (p: ThemePreference) => {
    localStorage.setItem("theme-preference", p);
    setPrefState(p);
    changeTheme(resolve(p));
  };
  const setTheme = (t: Theme) => setPreference(t);
  const toggleTheme = () => setPreference(theme === "dark" ? "light" : "dark");

  return (
    <ThemeContext.Provider value={{ theme, preference, setPreference, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
