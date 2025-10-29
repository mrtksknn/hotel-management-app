// src/theme/theme.ts
import { createSystem, defaultConfig } from "@chakra-ui/react";

const theme = createSystem(defaultConfig, {
  theme: {
    tokens: {
      colors: {
        primary: { value: "#ffffff1a" },
        secondary: { value: "#d4af37" },
        white: { value: "#fff" },
        gray: { value: "#ffffffb7" },
        black: { value: "#000" },
        red: { value: "#000" },
        green: { value: "#000" },
        orange: { value: "#000" },
        blue: { value: "#000" },
        hoverColor: { value: "#2c3e50" },
      },
      radii: {
        lg: { value: "12px" },
        xl: { value: "16px" },
      },
    },
  },
});

export default theme;
