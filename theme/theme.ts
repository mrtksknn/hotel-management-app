// src/theme/theme.ts
import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
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
  components: {
    Table: {
      baseStyle: {
        th: {
          fontFamily: "Inter, sans-serif",
          fontWeight: "600",
          textTransform: "none",
          letterSpacing: "normal",
          fontSize: "14px",
          color: "gray.600",
        },
        td: {
          fontFamily: "Inter, sans-serif",
          fontSize: "14px",
          color: "gray.800",
        },
      },
      variants: {
        simple: {
          th: {
            borderBottom: "1px solid",
            borderColor: "gray.200",
            bg: "gray.50",
          },
          td: {
            borderBottom: "1px solid",
            borderColor: "gray.100",
          },
        },
      },
    },
  },
});

export default theme;
