// theme/theme.ts - Modern Hotel Management Theme
import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  // 🎨 Global Styles
  styles: {
    global: {
      body: {
        bg: "gray.50",
        color: "gray.800",
        fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      },
    },
  },

  // 🎨 Color Palette - Yumuşak ve Modern Renkler
  colors: {
    brand: {
      50: "#f0f4ff",
      100: "#e0e9ff",
      200: "#c7d7fe",
      300: "#a5b8fc",
      400: "#8b92f8",
      500: "#7c6ef2",
      600: "#6b5ce6",
      700: "#5a4acb",
      800: "#4a3da3",
      900: "#3d3481",
    },
    primary: {
      50: "#f5f3ff",
      100: "#ede9fe",
      200: "#ddd6fe",
      300: "#c4b5fd",
      400: "#a78bfa",
      500: "#8b5cf6",
      600: "#7c3aed",
      700: "#6d28d9",
      800: "#5b21b6",
      900: "#4c1d95",
    },
    secondary: {
      50: "#fef3c7",
      100: "#fde68a",
      200: "#fcd34d",
      300: "#fbbf24",
      400: "#f59e0b",
      500: "#d97706",
      600: "#b45309",
      700: "#92400e",
      800: "#78350f",
      900: "#451a03",
    },
    accent: {
      50: "#ecfdf5",
      100: "#d1fae5",
      200: "#a7f3d0",
      300: "#6ee7b7",
      400: "#34d399",
      500: "#10b981",
      600: "#059669",
      700: "#047857",
      800: "#065f46",
      900: "#064e3b",
    },
    neutral: {
      50: "#fafafa",
      100: "#f4f4f5",
      200: "#e4e4e7",
      300: "#d4d4d8",
      400: "#a1a1aa",
      500: "#71717a",
      600: "#52525b",
      700: "#3f3f46",
      800: "#27272a",
      900: "#18181b",
    },
  },

  // 📐 Spacing & Sizing
  space: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
    "2xl": "3rem",
    "3xl": "4rem",
  },

  // 🔲 Border Radius
  radii: {
    sm: "0.375rem",
    md: "0.5rem",
    lg: "0.75rem",
    xl: "1rem",
    "2xl": "1.5rem",
    "3xl": "2rem",
    full: "9999px",
  },

  // 🌑 Shadows
  shadows: {
    xs: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    sm: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
    soft: "0 2px 8px rgba(124, 110, 242, 0.15)",
    glow: "0 0 20px rgba(124, 110, 242, 0.3)",
  },

  // 🎯 Component Styles
  components: {
    // Button Component
    Button: {
      baseStyle: {
        fontWeight: "500",
        borderRadius: "lg",
        transition: "all 0.2s ease-in-out",
        _focus: {
          boxShadow: "0 0 0 3px rgba(124, 110, 242, 0.2)",
        },
      },
      variants: {
        solid: {
          bg: "brand.500",
          color: "white",
          _hover: {
            bg: "brand.600",
            transform: "translateY(-1px)",
            boxShadow: "md",
          },
          _active: {
            bg: "brand.700",
            transform: "translateY(0)",
          },
        },
        outline: {
          borderColor: "brand.500",
          color: "brand.500",
          _hover: {
            bg: "brand.50",
            borderColor: "brand.600",
          },
        },
        ghost: {
          color: "brand.500",
          _hover: {
            bg: "brand.50",
          },
        },
      },
      defaultProps: {
        variant: "solid",
      },
    },

    // Input Component
    Input: {
      baseStyle: {
        field: {
          borderRadius: "lg",
          transition: "all 0.2s ease-in-out",
        },
      },
      variants: {
        outline: {
          field: {
            borderColor: "neutral.200",
            _hover: {
              borderColor: "brand.300",
            },
            _focus: {
              borderColor: "brand.500",
              boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)",
            },
          },
        },
      },
      defaultProps: {
        variant: "outline",
      },
    },

    // Select Component
    Select: {
      baseStyle: {
        field: {
          borderRadius: "lg",
          transition: "all 0.2s ease-in-out",
        },
      },
      variants: {
        outline: {
          field: {
            borderColor: "neutral.200",
            _hover: {
              borderColor: "brand.300",
            },
            _focus: {
              borderColor: "brand.500",
              boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)",
            },
          },
        },
      },
    },

    // Card Component
    Card: {
      baseStyle: {
        container: {
          borderRadius: "xl",
          boxShadow: "sm",
          transition: "all 0.3s ease-in-out",
          bg: "white",
          _hover: {
            boxShadow: "md",
            transform: "translateY(-2px)",
          },
        },
      },
    },

    // Table Component
    Table: {
      baseStyle: {
        th: {
          fontFamily: "Inter, sans-serif",
          fontWeight: "600",
          textTransform: "none",
          letterSpacing: "normal",
          fontSize: "12px",
          color: "neutral.900",
        },
        td: {
          fontFamily: "Inter, sans-serif",
          fontSize: "12px",
          color: "neutral.600",
        },
      },
      variants: {
        simple: {
          th: {
            borderBottom: "2px solid",
            borderColor: "neutral.100",
            py: 3,
          },
          td: {
            borderBottom: "1px solid",
            borderColor: "neutral.100",
            py: 3,
          },
        },
      },
    },

    // Modal Component
    Modal: {
      baseStyle: {
        dialog: {
          borderRadius: "2xl",
          boxShadow: "2xl",
        },
        header: {
          fontWeight: "600",
          fontSize: "lg",
          color: "neutral.800",
          borderBottom: "1px solid",
          borderColor: "neutral.100",
          pb: 4,
        },
        body: {
          py: 6,
        },
        footer: {
          borderTop: "1px solid",
          borderColor: "neutral.100",
          pt: 4,
        },
      },
    },

    // Badge Component
    Badge: {
      baseStyle: {
        borderRadius: "md",
        px: 2,
        py: 1,
        fontWeight: "500",
        fontSize: "xs",
      },
    },

    // Tabs Component
    Tabs: {
      variants: {
        "soft-rounded": {
          tab: {
            borderRadius: "lg",
            fontWeight: "500",
            transition: "all 0.2s ease-in-out",
            _selected: {
              bg: "brand.500",
              color: "white",
              boxShadow: "soft",
            },
            _hover: {
              bg: "brand.50",
            },
          },
        },
      },
    },

    // Divider Component
    Divider: {
      baseStyle: {
        borderColor: "neutral.200",
        opacity: 1,
      },
    },
  },

  // 📝 Typography
  fonts: {
    heading: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    body: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },

  fontSizes: {
    xs: "0.75rem",
    sm: "0.875rem",
    md: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
  },

  fontWeights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  // 🎬 Transitions
  transition: {
    duration: {
      fast: "150ms",
      normal: "200ms",
      slow: "300ms",
    },
    easing: {
      easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
      easeOut: "cubic-bezier(0.0, 0, 0.2, 1)",
      easeIn: "cubic-bezier(0.4, 0, 1, 1)",
    },
  },
});

export default theme;
