"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import {
    Box, Heading, Text, VStack, Flex, Button, HStack, Icon, Badge, Spinner, Container
} from "@chakra-ui/react";
import { ArrowLeft, History, User as UserIcon, Building, Trash2, Settings, Calendar } from "lucide-react";
import { getActivityLogs, ActivityLog } from "@/services/activityService";
import { motion } from "framer-motion";

const MotionBox = motion(Box as any);

const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, delay, ease: "easeOut" },
});

export default function ActivitiesPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            router.push("/login");
            return;
        }

        const fetchLogs = async () => {
            if (user.hotelIds && user.hotelIds.length > 0) {
                const hotelId = user.hotelIds[0];
                const allLogs = await getActivityLogs(hotelId, 50); // Get more logs for the full page
                setLogs(allLogs);
            }
            setLoading(false);
        };

        fetchLogs();
    }, [user, router]);

    if (!user) return null;

    return (
        <Container maxW="container.lg" py={8}>
            {/* Header */}
            <Flex justify="space-between" align="center" mb={8}>
                <HStack spacing={4}>
                    <Box>
                        <Heading size="lg" color="gray.800">Tüm Aktiviteler</Heading>
                        <Text color="gray.500" fontSize="sm">Otelin tüm işlem ve kayıt geçmişi.</Text>
                    </Box>
                </HStack>
                <Button
                    leftIcon={<ArrowLeft size={18} />}
                    variant="ghost"
                    onClick={() => router.push("/dashboard")}
                    borderRadius="full"
                >
                    Geri Dön
                </Button>
            </Flex>

            {loading ? (
                <Flex justify="center" py={20}>
                    <Spinner size="xl" color="brand.500" thickness="4px" />
                </Flex>
            ) : (
                <VStack align="stretch" spacing={4}>
                    {logs.length === 0 ? (
                        <Box bg="white" p={10} borderRadius="2xl" textAlign="center" border="1px solid" borderColor="gray.100">
                            <Text color="gray.500">Henüz kaydedilmiş bir aktivite bulunmuyor.</Text>
                        </Box>
                    ) : (
                        logs.map((log, index) => (
                            <MotionBox key={log.id} {...fadeUp(index * 0.05)}>
                                <Box
                                    bg="white"
                                    p={5}
                                    borderRadius="2xl"
                                    boxShadow="sm"
                                    border="1px solid"
                                    borderColor="gray.100"
                                    _hover={{ borderColor: "brand.200", transform: "translateY(-2px)" }}
                                    transition="all 0.2s"
                                >
                                    <Flex align="center" justify="space-between">
                                        <HStack spacing={4}>
                                            <Box
                                                bg={
                                                    log.action.includes('USER') ? "blue.50" :
                                                        log.action.includes('HOTEL') ? "orange.50" : "gray.50"
                                                }
                                                p={3}
                                                borderRadius="xl"
                                            >
                                                <Icon
                                                    as={
                                                        log.action === 'CREATE_USER' ? UserIcon :
                                                            log.action === 'DELETE_USER' ? Trash2 :
                                                                log.action === 'UPDATE_USER' ? Settings :
                                                                    log.action.includes('HOTEL') ? Building : History
                                                    }
                                                    color={
                                                        log.action.includes('USER') ? "blue.500" :
                                                            log.action.includes('HOTEL') ? "orange.500" : "gray.500"
                                                    }
                                                    boxSize={5}
                                                />
                                            </Box>
                                            <Box>
                                                <HStack mb={1}>
                                                    <Badge colorScheme="gray" variant="subtle" fontSize="10px">{log.action}</Badge>
                                                    <Text fontSize="xs" color="gray.400" fontWeight="medium">{log.userName}</Text>
                                                </HStack>
                                                <Text fontWeight="semibold" color="gray.700" fontSize="md">{log.description}</Text>
                                            </Box>
                                        </HStack>
                                        <VStack align="flex-end" spacing={0}>
                                            <HStack spacing={1} color="gray.400">
                                                <Icon as={Calendar} boxSize={3} />
                                                <Text fontSize="xs">
                                                    {log.timestamp ? new Date(log.timestamp.toDate()).toLocaleDateString("tr-TR") : "-"}
                                                </Text>
                                            </HStack>
                                            <Text fontSize="xs" color="gray.400" fontWeight="bold">
                                                {log.timestamp ? new Date(log.timestamp.toDate()).toLocaleTimeString("tr-TR", { hour: '2-digit', minute: '2-digit' }) : "-"}
                                            </Text>
                                        </VStack>
                                    </Flex>
                                </Box>
                            </MotionBox>
                        ))
                    )}
                </VStack>
            )}
        </Container>
    );
}
