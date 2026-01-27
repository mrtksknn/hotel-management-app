"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Box, Text, VStack } from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";

const MotionBox = motion(Box);

export default function GlobalLoader({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Sayfa değiştiğinde veya ilk yüklemede loading'i true yap
        setIsLoading(true);

        // En az 3 saniye bekle
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 3000);

        return () => clearTimeout(timer);
    }, [pathname, searchParams]);

    return (
        <>
            <AnimatePresence mode="wait">
                {isLoading && (
                    <MotionBox
                        key="global-loader"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
                        position="fixed"
                        top="0"
                        left="0"
                        width="100vw"
                        height="100vh"
                        zIndex="9999"
                        bg="white"
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                    >
                        <VStack spacing={8}>
                            {/* Modern Spinner Animation */}
                            <Box position="relative" w="100px" h="100px">
                                <MotionBox
                                    position="absolute"
                                    top="0"
                                    left="0"
                                    w="100%"
                                    h="100%"
                                    border="4px solid"
                                    borderColor="blue.100"
                                    borderRadius="full"
                                />
                                <MotionBox
                                    position="absolute"
                                    top="0"
                                    left="0"
                                    w="100%"
                                    h="100%"
                                    border="4px solid"
                                    borderColor="blue.500"
                                    borderTopColor="transparent"
                                    borderRightColor="transparent"
                                    borderRadius="full"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                />
                                <MotionBox
                                    position="absolute"
                                    top="50%"
                                    left="50%"
                                    transform="translate(-50%, -50%)"
                                    w="12px"
                                    h="12px"
                                    bg="blue.500"
                                    borderRadius="full"
                                    animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                />
                            </Box>

                            {/* Loading Text with Typing Effect */}
                            <VStack spacing={2}>
                                <Text fontSize="xl" fontWeight="bold" color="gray.700" letterSpacing="wider">
                                    HOTEL MANAGEMENT
                                </Text>
                                <Text fontSize="sm" color="gray.500" fontWeight="medium">
                                    Yükleniyor...
                                </Text>
                            </VStack>
                        </VStack>
                    </MotionBox>
                )}
            </AnimatePresence>

            {/* 
        Content is rendered but hidden or visible underneath. 
        If we want to strictly hide content until loaded:
        display: isLoading ? "none" : "block"
        But keeping it rendered allows data fetching to happen in background.
      */}
            <Box opacity={isLoading ? 0 : 1} transition="opacity 0.5s ease-in-out">
                {children}
            </Box>
        </>
    );
}
