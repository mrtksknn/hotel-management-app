"use client";

import { useEffect, useState } from "react";
import {
    Box, Text, Spinner, Flex, Icon, SimpleGrid,
    VStack, HStack, Input, Button, useToast
} from "@chakra-ui/react";
import { getCheckInsForDate, getCheckOutsForDate, CheckInOutData, updateCheckInStatus, updateCheckOutStatus } from "@/services/checkInOutService";
import { useAuth } from "@/hooks/useAuth";
import { LogIn, LogOut, Calendar, Users, DoorOpen, DoorClosed } from "lucide-react";
import StatCard from "@/components/common/StatCard";
import { ReservationCard, calculateGuestStats } from "./utils";

export default function CheckInOutPage() {
    if (typeof window === "undefined") return null;

    const { user } = useAuth();
    const toast = useToast();
    const [selectedDate, setSelectedDate] = useState<Date>(new Date(2018, 6, 12)); // 12 Temmuz 2018
    const [checkIns, setCheckIns] = useState<CheckInOutData[]>([]);
    const [checkOuts, setCheckOuts] = useState<CheckInOutData[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const hotelToFilter = user?.hotel;
            const [checkInsData, checkOutsData] = await Promise.all([
                getCheckInsForDate(selectedDate, hotelToFilter),
                getCheckOutsForDate(selectedDate, hotelToFilter)
            ]);
            setCheckIns(checkInsData);
            setCheckOuts(checkOutsData);
        } catch (error) {
            console.error("Giriş-Çıkış verileri yüklenirken hata:", error);
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

    // İstatistikleri hesapla
    const checkInStats = calculateGuestStats(checkIns);
    const checkOutStats = calculateGuestStats(checkOuts);

    const handleCheckIn = async (docId: string, currentStatus: boolean) => {
        try {
            await updateCheckInStatus(docId, !currentStatus);
            toast({
                title: !currentStatus ? "Giriş yapıldı olarak işaretlendi" : "Giriş işareti kaldırıldı",
                status: "success",
                duration: 2000,
                isClosable: true,
                position: "top-right"
            });
            fetchData(); // Verileri yenile
        } catch (error) {
            toast({
                title: "Hata",
                description: "Giriş durumu güncellenirken bir hata oluştu",
                status: "error",
                duration: 3000,
                isClosable: true,
                position: "top-right"
            });
        }
    };

    const handleCheckOut = async (docId: string, currentStatus: boolean) => {
        try {
            await updateCheckOutStatus(docId, !currentStatus);
            toast({
                title: !currentStatus ? "Çıkış yapıldı olarak işaretlendi" : "Çıkış işareti kaldırıldı",
                status: "success",
                duration: 2000,
                isClosable: true,
                position: "top-right"
            });
            fetchData(); // Verileri yenile
        } catch (error) {
            toast({
                title: "Hata",
                description: "Çıkış durumu güncellenirken bir hata oluştu",
                status: "error",
                duration: 3000,
                isClosable: true,
                position: "top-right"
            });
        }
    };


    return (
        <Box h="100vh" display="flex" flexDirection="column" p={6} bg="gray.50" overflow="hidden">
            {/* Header */}
            <Box flex="0 0 auto" mb={6}>
                <Flex justify="space-between" align="center" mb={4}>
                    <Box>
                        <Text fontSize="2xl" fontWeight="semibold" color="neutral.800">
                            Giriş-Çıkış Yönetimi
                        </Text>
                        <Text fontSize="md" color="neutral.500" mt={2}>
                            Günlük giriş ve çıkış yapacak misafirleri görüntüleyin
                        </Text>
                    </Box>
                    <HStack spacing={3}>
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


                {/* Stats */}
                <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
                    <StatCard
                        title="Giriş Yapacak"
                        value={checkIns.length.toString()}
                        subValue={`${checkInStats.pax} P / ${checkInStats.children} Ç / ${checkInStats.babies} B`}
                        icon={LogIn}
                        colorScheme="green"
                    />
                    <StatCard
                        title="Çıkış Yapacak"
                        value={checkOuts.length.toString()}
                        subValue={`${checkOutStats.pax} P / ${checkOutStats.children} Ç / ${checkOutStats.babies} B`}
                        icon={LogOut}
                        colorScheme="orange"
                    />
                    <StatCard
                        title="Toplam İşlem"
                        value={(checkIns.length + checkOuts.length).toString()}
                        subValue={`${checkInStats.pax + checkOutStats.pax} P / ${checkInStats.children + checkOutStats.children} Ç / ${checkInStats.babies + checkOutStats.babies} B`}
                        icon={Users}
                        colorScheme="purple"
                    />
                    <StatCard
                        title="Doluluk Değişimi"
                        value={`${checkIns.length > checkOuts.length ? '+' : ''}${checkIns.length - checkOuts.length}`}
                        subValue="Oda Farkı"
                        icon={DoorOpen}
                        colorScheme="blue"
                    />
                </SimpleGrid>
            </Box>

            {/* Content */}
            <Box flex="1" minH={0} display="flex" gap={4}>
                {loading ? (
                    <Box flex="1" display="flex" alignItems="center" justifyContent="center">
                        <VStack spacing={4}>
                            <Spinner size="xl" color="brand.500" thickness="3px" />
                            <Text color="neutral.500" fontWeight="medium">Veriler yükleniyor...</Text>
                        </VStack>
                    </Box>
                ) : (
                    <>
                        {/* Check-Ins */}
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
                                bg="linear-gradient(135deg, #10b981 0%, #059669 100%)"
                                p={4}
                                borderBottom="1px solid"
                                borderColor="neutral.100"
                            >
                                <Flex align="center" gap={3}>
                                    <Icon as={LogIn} boxSize={6} color="white" />
                                    <Box>
                                        <Text fontSize="lg" fontWeight="bold" color="white">
                                            Giriş Yapacaklar
                                        </Text>
                                        <Text fontSize="sm" color="whiteAlpha.800">
                                            {checkIns.length} Rezervasyon
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
                                {checkIns.length === 0 ? (
                                    <Box textAlign="center" py={10}>
                                        <Icon as={DoorOpen} boxSize={12} color="neutral.300" mb={3} />
                                        <Text color="neutral.500" fontWeight="medium">
                                            Bu tarihte giriş yapacak misafir bulunmuyor
                                        </Text>
                                    </Box>
                                ) : (
                                    <VStack spacing={3} align="stretch">
                                        {checkIns.map((reservation) => (
                                            <ReservationCard
                                                key={reservation.docId}
                                                reservation={reservation}
                                                type="checkin"
                                                onCheckIn={handleCheckIn}
                                                onCheckOut={handleCheckOut}
                                            />
                                        ))}
                                    </VStack>
                                )}
                            </Box>
                        </Box>

                        {/* Check-Outs */}
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
                                bg="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
                                p={4}
                                borderBottom="1px solid"
                                borderColor="neutral.100"
                            >
                                <Flex align="center" gap={3}>
                                    <Icon as={LogOut} boxSize={6} color="white" />
                                    <Box>
                                        <Text fontSize="lg" fontWeight="bold" color="white">
                                            Çıkış Yapacaklar
                                        </Text>
                                        <Text fontSize="sm" color="whiteAlpha.800">
                                            {checkOuts.length} Rezervasyon
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
                                {checkOuts.length === 0 ? (
                                    <Box textAlign="center" py={10}>
                                        <Icon as={DoorClosed} boxSize={12} color="neutral.300" mb={3} />
                                        <Text color="neutral.500" fontWeight="medium">
                                            Bu tarihte çıkış yapacak misafir bulunmuyor
                                        </Text>
                                    </Box>
                                ) : (
                                    <VStack spacing={3} align="stretch">
                                        {checkOuts.map((reservation) => (
                                            <ReservationCard
                                                key={reservation.docId}
                                                reservation={reservation}
                                                type="checkout"
                                                onCheckIn={handleCheckIn}
                                                onCheckOut={handleCheckOut}
                                            />
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
