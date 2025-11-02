"use client";

import { usePathname } from "next/navigation";
import { Box, Flex, Container } from "@chakra-ui/react";
import Sidebar from "@/components/Sidebar";
import { Providers } from "./providers";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Login ve Register sayfalarında Sidebar gizli olacak
  const isAuthPage = pathname === "/login" || pathname === "/register";

  return (
    <html lang="tr">
      <body>
        <Providers>
          {isAuthPage ? (
            // 🔹 Login/Register sayfaları: Tam sayfa görünüm
            <Box minH="100vh" bg="gray.50">
              {children}
            </Box>
          ) : (
            // 🔹 Diğer sayfalar: Sidebar + Content layout
            <Flex minH="100vh">
              {/* Sidebar */}
              <Box
                w="225px"
                bg="#1e2532"
                color="white"
                position="fixed"
                left={0}
                top={0}
                bottom={0}
              >
                <Sidebar />
              </Box>

              {/* Content */}
              <Box
                ml="225px"
                flex="1"
                bg="white"
                minH="100vh"
                display="flex"
                justifyContent="center"
                alignItems="flex-start"
              >
                <Container
                  maxW="1080px"
                  w="100%"
                  bg="white"
                  borderRadius="lg"
                  py={3}
                >
                  {children}
                </Container>
              </Box>
            </Flex>
          )}
        </Providers>
      </body>
    </html>
  );
}
