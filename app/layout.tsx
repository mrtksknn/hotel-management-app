"use client";

import { usePathname } from "next/navigation";
import { Box, Flex, Container } from "@chakra-ui/react";
import Sidebar from "@/components/Sidebar";
import { Providers } from "./providers";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Login ve Register sayfalarında Sidebar gizli olacak
  const isAuthPage = pathname === "/login" || pathname === "/register";

  return (
    <html lang="tr">
      <body className={inter.className}>
        <Providers>
          {isAuthPage ? (
            // 🔹 Login/Register sayfaları: Tam sayfa görünüm
            <Box minH="100vh">
              {children}
            </Box>
          ) : (
            // 🔹 Diğer sayfalar: Sidebar + Content layout
            <Flex minH="100vh" bg="gray.50">
              {/* Sidebar */}
              <Box
                w="260px"
                position="fixed"
                left={0}
                top={0}
                bottom={0}
                zIndex={10}
              >
                <Sidebar />
              </Box>

              {/* Content */}
              <Box
                ml="260px"
                flex="1"
                minH="100vh"
                display="flex"
                justifyContent="center"
                alignItems="flex-start"
              >
                <Container
                  maxW="1200px"
                  w="100%"
                  py={0}
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
