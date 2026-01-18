"use client";

import { useEffect, useState } from "react";
import {
    Box, Text, Spinner, Flex, Icon, SimpleGrid,
    VStack, HStack, Input, Button, Badge, Divider, useToast
} from "@chakra-ui/react";
import { getCleaningPlanForDate, CleaningTask, getCleaningDescription, getCleaningColorScheme } from "@/services/cleaningService";
import { useAuth } from "@/hooks/useAuth";
import { Sparkles, Calendar, CheckCircle2, Users, Clock, Download } from "lucide-react";
import StatCard from "@/components/common/StatCard";
import { getTurColor } from "../reservations/utils";
import { generateCleaningPlanPDF } from "./pdfUtils";

export default function CleaningPlanPage() {
    if (typeof window === "undefined") return null;

    const { user } = useAuth();
    const toast = useToast();
    const [selectedDate, setSelectedDate] = useState<Date>(new Date(2018, 6, 12)); // 12 Temmuz 2018
    const [cleaningTasks, setCleaningTasks] = useState<CleaningTask[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const hotelToFilter = user?.hotel;
            const tasks = await getCleaningPlanForDate(selectedDate, hotelToFilter);
            setCleaningTasks(tasks);
        } catch (error) {
            console.error("Temizlik planı yüklenirken hata:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user, selectedDate]);

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDate = new Date(e.target.value);
        if (!isNaN(newDate.getTime())) {
            setSelectedDate(newDate);
        }
    };

    const handleDownloadPDF = () => {
        try {
            generateCleaningPlanPDF(cleaningTasks, selectedDate, user?.hotel);
            toast({
                title: "PDF İndirildi",
                description: "Temizlik planı başarıyla PDF olarak indirildi",
                status: "success",
                duration: 3000,
                isClosable: true,
                position: "top-right"
            });
        } catch (error) {
            toast({
                title: "Hata",
                description: "PDF oluşturulurken bir hata oluştu",
                status: "error",
                duration: 3000,
                isClosable: true,
                position: "top-right"
            });
        }
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat("tr-TR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
            weekday: "long"
        }).format(date);
    };

    const checkoutTasks = cleaningTasks.filter(t => t.cleaningType === 'checkout');
    const dailyTasks = cleaningTasks.filter(t => t.cleaningType === 'daily');

    const CleaningCard = ({ task }: { task: CleaningTask }) => {
        const isCheckout = task.cleaningType === 'checkout';
        const colorScheme = getCleaningColorScheme(task.cleaningType);

        return (
            <Box
                bg="white"
                borderRadius="xl"
                p={5}
                boxShadow="soft"
                border="2px solid"
                borderColor={isCheckout ? "red.200" : "blue.200"}
                transition="all 0.2s ease-in-out"
                _hover={{
                    boxShadow: "md",
                    transform: "translateY(-2px)",
                    borderColor: isCheckout ? "red.300" : "blue.300"
                }}
            >
                <Flex justify="space-between" align="flex-start" mb={3}>
                    <VStack align="flex-start" spacing={1} flex={1}>
                        <Flex align="center" gap={2}>
                            <Badge
                                colorScheme="purple"
                                variant="solid"
                                borderRadius="md"
                                fontSize="lg"
                                px={3}
                                py={1}
                            >
                                ODA {task.room_code}
                            </Badge>
                            <Badge
                                colorScheme={colorScheme}
                                variant="subtle"
                                borderRadius="md"
                                fontSize="xs"
                                px={2}
                                py={1}
                            >
                                {isCheckout ? 'TAM TEMİZLİK' : 'GÜNLÜK TEMİZLİK'}
                            </Badge>
                        </Flex>
                        <Text fontSize="md" fontWeight="semibold" color="neutral.700" textTransform="capitalize">
                            {task.guestName}
                        </Text>
                        {task.reservation && (
                            <Badge colorScheme={getTurColor(task.reservation.tur)} variant="subtle" borderRadius="md" fontSize="xs">
                                {task.reservation.tur}
                            </Badge>
                        )}
                    </VStack>
                    <Icon
                        as={isCheckout ? CheckCircle2 : Sparkles}
                        boxSize={7}
                        color={isCheckout ? "red.500" : "blue.500"}
                    />
                </Flex>

                <Divider my={3} borderColor="neutral.100" />

                <VStack align="stretch" spacing={2} fontSize="sm">
                    <Box
                        bg={isCheckout ? "red.50" : "blue.50"}
                        p={3}
                        borderRadius="lg"
                        border="1px solid"
                        borderColor={isCheckout ? "red.100" : "blue.100"}
                    >
                        <Text fontSize="xs" fontWeight="bold" color="neutral.700" mb={1}>
                            TEMİZLİK DETAYLARI:
                        </Text>
                        <Text fontSize="xs" color="neutral.600">
                            {getCleaningDescription(task.cleaningType)}
                        </Text>
                    </Box>

                    {task.reservation && (
                        <Flex justify="space-between" align="center">
                            <HStack spacing={2} color="neutral.600">
                                <Icon as={Users} boxSize={4} />
                                <Text fontWeight="medium" fontSize="xs">Misafir</Text>
                            </HStack>
                            <HStack spacing={2} fontSize="xs">
                                <Badge colorScheme="green" variant="subtle" borderRadius="md">
                                    {task.reservation.pax} Yetişkin
                                </Badge>
                                {task.reservation.cocuk_sayisi > 0 && (
                                    <Badge colorScheme="blue" variant="subtle" borderRadius="md">
                                        {task.reservation.cocuk_sayisi} Çocuk
                                    </Badge>
                                )}
                                {task.reservation.bebek_sayisi > 0 && (
                                    <Badge colorScheme="gray" variant="subtle" borderRadius="md">
                                        {task.reservation.bebek_sayisi} Bebek
                                    </Badge>
                                )}
                            </HStack>
                        </Flex>
                    )}

                    {isCheckout && task.checkOutDate && (
                        <Flex justify="space-between" align="center">
                            <HStack spacing={2} color="neutral.600">
                                <Icon as={Clock} boxSize={4} />
                                <Text fontWeight="medium" fontSize="xs">Çıkış Saati</Text>
                            </HStack>
                            <Badge colorScheme="red" variant="outline" borderRadius="md" fontSize="xs">
                                Bugün Çıkış
                            </Badge>
                        </Flex>
                    )}
                </VStack>
            </Box>
        );
    };

    return (
        <Box h="100vh" display="flex" flexDirection="column" p={6} bg="gray.50" overflow="hidden">
            {/* Header */}
            <Box flex="0 0 auto" mb={6}>
                <Flex justify="space-between" align="center" mb={4}>
                    <Box>
                        <Text fontSize="2xl" fontWeight="semibold" color="neutral.800">
                            Günlük Temizlik Planı
                        </Text>
                        <Text fontSize="md" color="neutral.500" mt={2}>
                            Günlük temizlik görevlerini ve çıkış yapacak odaları görüntüleyin
                        </Text>
                    </Box>
                    <HStack spacing={3}>
                        <Button
                            onClick={handleDownloadPDF}
                            colorScheme="green"
                            borderRadius="xl"
                            size="md"
                            leftIcon={<Icon as={Download} />}
                            isDisabled={cleaningTasks.length === 0}
                        >
                            PDF İndir
                        </Button>
                        <Input
                            type="date"
                            value={selectedDate.toISOString().split('T')[0]}
                            onChange={handleDateChange}
                            width="200px"
                            bg="white"
                            borderRadius="xl"
                            fontWeight="semibold"
                            color="neutral.700"
                            borderColor="neutral.200"
                            _hover={{ borderColor: "brand.300" }}
                            _focus={{ borderColor: "brand.500", boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)" }}
                        />
                        <Button
                            onClick={() => setSelectedDate(new Date(2018, 6, 12))}
                            variant="outline"
                            colorScheme="brand"
                            borderRadius="xl"
                            size="md"
                        >
                            Bugüne Dön
                        </Button>
                    </HStack>
                </Flex>

                {/* Date Display */}
                <Box
                    bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                    borderRadius="2xl"
                    p={6}
                    boxShadow="lg"
                    mb={6}
                >
                    <Flex align="center" gap={3}>
                        <Icon as={Calendar} boxSize={8} color="white" />
                        <Box>
                            <Text fontSize="sm" color="whiteAlpha.800" fontWeight="medium">
                                Temizlik Planı
                            </Text>
                            <Text fontSize="2xl" fontWeight="bold" color="white">
                                {formatDate(selectedDate)}
                            </Text>
                        </Box>
                    </Flex>
                </Box>

                {/* Stats */}
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                    <StatCard
                        title="Tam Temizlik"
                        value={checkoutTasks.length.toString()}
                        subValue="Çıkış Yapacak Odalar"
                        icon={CheckCircle2}
                        colorScheme="red"
                    />
                    <StatCard
                        title="Günlük Temizlik"
                        value={dailyTasks.length.toString()}
                        subValue="2 Günde Bir"
                        icon={Sparkles}
                        colorScheme="blue"
                    />
                    <StatCard
                        title="Toplam Görev"
                        value={cleaningTasks.length.toString()}
                        subValue={`${checkoutTasks.length + dailyTasks.length} Oda`}
                        icon={Calendar}
                        colorScheme="purple"
                    />
                </SimpleGrid>
            </Box>

            {/* Content */}
            <Box flex="1" minH={0} display="flex" gap={4}>
                {loading ? (
                    <Box flex="1" display="flex" alignItems="center" justifyContent="center">
                        <VStack spacing={4}>
                            <Spinner size="xl" color="brand.500" thickness="3px" />
                            <Text color="neutral.500" fontWeight="medium">Temizlik planı yükleniyor...</Text>
                        </VStack>
                    </Box>
                ) : (
                    <>
                        {/* Checkout Cleanings */}
                        <Box
                            flex="1"
                            display="flex"
                            flexDirection="column"
                            bg="white"
                            borderRadius="2xl"
                            border="1px solid"
                            borderColor="neutral.100"
                            boxShadow="soft"
                            overflow="hidden"
                        >
                            <Box
                                bg="linear-gradient(135deg, #f56565 0%, #c53030 100%)"
                                p={4}
                                borderBottom="1px solid"
                                borderColor="neutral.100"
                            >
                                <Flex align="center" gap={3}>
                                    <Icon as={CheckCircle2} boxSize={6} color="white" />
                                    <Box>
                                        <Text fontSize="lg" fontWeight="bold" color="white">
                                            Tam Temizlik (Çıkış)
                                        </Text>
                                        <Text fontSize="sm" color="whiteAlpha.800">
                                            {checkoutTasks.length} Oda
                                        </Text>
                                    </Box>
                                </Flex>
                            </Box>
                            <Box
                                flex="1"
                                overflowY="auto"
                                p={4}
                                css={{
                                    "&::-webkit-scrollbar": { width: "6px" },
                                    "&::-webkit-scrollbar-track": { background: "transparent" },
                                    "&::-webkit-scrollbar-thumb": { background: "#CBD5E0", borderRadius: "4px" },
                                    "&::-webkit-scrollbar-thumb:hover": { background: "#A0AEC0" },
                                }}
                            >
                                {checkoutTasks.length === 0 ? (
                                    <Box textAlign="center" py={10}>
                                        <Icon as={CheckCircle2} boxSize={12} color="neutral.300" mb={3} />
                                        <Text color="neutral.500" fontWeight="medium">
                                            Bugün çıkış yapacak oda bulunmuyor
                                        </Text>
                                    </Box>
                                ) : (
                                    <VStack spacing={3} align="stretch">
                                        {checkoutTasks.map((task, idx) => (
                                            <CleaningCard key={`checkout-${task.room_code}-${idx}`} task={task} />
                                        ))}
                                    </VStack>
                                )}
                            </Box>
                        </Box>

                        {/* Daily Cleanings */}
                        <Box
                            flex="1"
                            display="flex"
                            flexDirection="column"
                            bg="white"
                            borderRadius="2xl"
                            border="1px solid"
                            borderColor="neutral.100"
                            boxShadow="soft"
                            overflow="hidden"
                        >
                            <Box
                                bg="linear-gradient(135deg, #4299e1 0%, #2b6cb0 100%)"
                                p={4}
                                borderBottom="1px solid"
                                borderColor="neutral.100"
                            >
                                <Flex align="center" gap={3}>
                                    <Icon as={Sparkles} boxSize={6} color="white" />
                                    <Box>
                                        <Text fontSize="lg" fontWeight="bold" color="white">
                                            Günlük Temizlik
                                        </Text>
                                        <Text fontSize="sm" color="whiteAlpha.800">
                                            {dailyTasks.length} Oda
                                        </Text>
                                    </Box>
                                </Flex>
                            </Box>
                            <Box
                                flex="1"
                                overflowY="auto"
                                p={4}
                                css={{
                                    "&::-webkit-scrollbar": { width: "6px" },
                                    "&::-webkit-scrollbar-track": { background: "transparent" },
                                    "&::-webkit-scrollbar-thumb": { background: "#CBD5E0", borderRadius: "4px" },
                                    "&::-webkit-scrollbar-thumb:hover": { background: "#A0AEC0" },
                                }}
                            >
                                {dailyTasks.length === 0 ? (
                                    <Box textAlign="center" py={10}>
                                        <Icon as={Sparkles} boxSize={12} color="neutral.300" mb={3} />
                                        <Text color="neutral.500" fontWeight="medium">
                                            Bugün günlük temizlik yapılacak oda bulunmuyor
                                        </Text>
                                    </Box>
                                ) : (
                                    <VStack spacing={3} align="stretch">
                                        {dailyTasks.map((task, idx) => (
                                            <CleaningCard key={`daily-${task.room_code}-${idx}`} task={task} />
                                        ))}
                                    </VStack>
                                )}
                            </Box>
                        </Box>
                    </>
                )}
            </Box>
        </Box>
    );
}
