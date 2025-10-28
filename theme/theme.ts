// src/theme/theme.ts
import { createSystem, defaultConfig } from "@chakra-ui/react";

const theme = createSystem(defaultConfig, {
  theme: {
    tokens: {
      colors: {
        primary: { value: "#2B6CB0" }, // mavi ton
        secondary: { value: "#68D391" }, // yeşil ton
        background: { value: "#F7FAFC" }, // açık gri
      },
      radii: {
        lg: { value: "12px" },
        xl: { value: "16px" },
      },
    },
  },
});

export default theme;
