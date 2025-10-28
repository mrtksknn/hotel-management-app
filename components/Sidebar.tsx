"use client";

import { useAuth } from "@/hooks/useAuth";
import { Stack, Text, Box, StackSeparator, Button } from "@chakra-ui/react";
import { useRouter } from "next/navigation";

export default function Sidebar() {
    const router = useRouter();
    const { logout } = useAuth();

    return (
        <Box display="flex" flexDirection="column" justifyContent="space-between" height="100vh">
            <Stack separator={<StackSeparator style={{ borderColor: '#ffffff1a', margin: 0, padding: 0 }} />}>
                <Box px={4} py={3}>
                    <Text fontSize="md" fontWeight="medium">
                        Grand Hotel
                    </Text>
                    <Text textStyle="xs">Management System</Text>
                </Box>

                <Box px={4} py={3}>
                    <Stack>
                        <a onClick={() => router.push("/dashboard")}>
                            Dashboard
                        </a>
                        <a onClick={() => router.push("/settings")}>
                            Rooms
                        </a>
                    </Stack>
                </Box>

            </Stack>

            <Box px={4} py={3} style={{ borderTop: '1px solid #ffffff1a' }}>
                <Button colorScheme="red" w="full" onClick={logout}>
                    Çıkış Yap
                </Button>
            </Box>
        </Box>
    );
}
