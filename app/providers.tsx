"use client";

import { ChakraProvider } from "@chakra-ui/react";
import { ReactNode } from "react";
import { AuthProvider } from "@/hooks/useAuth";
import theme from "../theme/theme";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ChakraProvider value={theme}>
      <AuthProvider>{children}</AuthProvider>
    </ChakraProvider>
  );
}
