import { Box, Grid, Tooltip, Text } from "@chakra-ui/react";
import React from "react";
import { Room } from "./types";
import { ReservationData } from "@/services/reservationsService";

interface MonthGridProps {
    dayCount: number;
    startDay?: number;
    rooms: Room[];
    highlightDay?: number;
    reservations?: ReservationData[];
    monthIndex?: number;
    year?: number;
}

export default function MonthGrid({
    dayCount,
    startDay = 1,
    rooms,
    highlightDay,
    reservations = [],
    monthIndex = 0,
    year = new Date().getFullYear(),
}: MonthGridProps) {
    const days = Array.from({ length: dayCount }, (_, i) => i + startDay);

    const getReservationsForRoom = (roomNo: number) => {
        return reservations.filter(res => {
            if (!res.room_code || res.room_code !== String(roomNo)) return false;

            const start = new Date(res.baslangic_tarihi);
            const end = new Date(res.bitis_tarihi);
            const monthStart = new Date(year, monthIndex, startDay);
            const monthEnd = new Date(year, monthIndex, startDay + dayCount - 1);

            return start <= monthEnd && end >= monthStart;
        });
    };

    const getReservationStatusColor = (reservation: ReservationData) => {
        const today = new Date(year, 6, 12);
        today.setHours(0, 0, 0, 0);

        const start = new Date(reservation.baslangic_tarihi);
        start.setHours(0, 0, 0, 0);

        const end = new Date(reservation.bitis_tarihi);
        end.setHours(0, 0, 0, 0);

        if (end < today) return "red";
        if (start > today) return "blue";
        if (start.getTime() === today.getTime()) return "yellow";
        return "green";
    };

    const getReservationPosition = (reservation: ReservationData) => {
        const start = new Date(reservation.baslangic_tarihi);
        start.setHours(0, 0, 0, 0);

        const end = new Date(reservation.bitis_tarihi);
        end.setHours(0, 0, 0, 0);

        const monthStart = new Date(year, monthIndex, startDay);
        monthStart.setHours(0, 0, 0, 0);

        const startDayOfMonth = start < monthStart ? startDay : start.getDate();
        const lastDayOfMonth = startDay + dayCount - 1;
        const endDayOfMonth = end.getDate() > lastDayOfMonth ? lastDayOfMonth : end.getDate();

        const startIndex = startDayOfMonth - startDay;
        const fullDays = endDayOfMonth - startDayOfMonth;
        const width = fullDays;

        return {
            startIndex: startIndex,
            width: width,
        };
    };

    const calculateStats = () => {
        const today = new Date(year, 6, 12);
        today.setHours(0, 0, 0, 0);

        let totalNights = 0;
        let todayNights = 0;
        let totalPax = 0;
        let totalChildren = 0;
        let totalBabies = 0;
        let todayPax = 0;
        let todayChildren = 0;
        let todayBabies = 0;

        reservations.forEach(res => {
            const start = new Date(res.baslangic_tarihi);
            start.setHours(0, 0, 0, 0);

            const end = new Date(res.bitis_tarihi);
            end.setHours(0, 0, 0, 0);

            const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
            totalNights += nights;

            // Toplam misafir sayıları
            totalPax += res.pax || 0;
            totalChildren += res.cocuk_sayisi || 0;
            totalBabies += res.bebek_sayisi || 0;

            if (today >= start && today < end) {
                todayNights += 1;
                todayPax += res.pax || 0;
                todayChildren += res.cocuk_sayisi || 0;
                todayBabies += res.bebek_sayisi || 0;
            }
        });

        // Geceleme değerleri hesaplama (yetişkin=1, çocuk=0.5, bebek=0)
        const totalOvernightValue = totalPax + (totalChildren * 0.5);
        const todayOvernightValue = todayPax + (todayChildren * 0.5);

        return {
            totalNights,
            todayNights,
            totalPax,
            totalChildren,
            totalBabies,
            todayPax,
            todayChildren,
            todayBabies,
            totalOvernightValue,
            todayOvernightValue,
        };
    };

    const stats = calculateStats();

    return (
        <Box>
            {/* İstatistikler */}
            <Box
                mb={6}
                display="grid"
                gridTemplateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }}
                gap={4}
            >
                {/* Toplam Geceleme */}
                <Box
                    p={4}
                    borderRadius="2xl"
                    bg="blue.50"
                    border="1px solid"
                    borderColor="blue.100"
                    transition="all 0.2s"
                    _hover={{ transform: "translateY(-2px)", boxShadow: "md", borderColor: "blue.300" }}
                    display="flex"
                    flexDirection="column"
                    justifyContent="space-between"
                >
                    <Text fontSize="xs" fontWeight="bold" color="blue.600" letterSpacing="wider" textTransform="uppercase" mb={3}>
                        Toplam Geceleme
                    </Text>
                    <Box display="flex" gap={3} justifyContent="space-between" mb={2}>
                        <Box>
                            <Text fontSize="lg" fontWeight="bold" color="blue.700">
                                {stats.totalPax}
                            </Text>
                            <Text fontSize="xs" color="blue.600">Yetişkin</Text>
                        </Box>
                        <Box>
                            <Text fontSize="lg" fontWeight="bold" color="blue.700">
                                {stats.totalChildren}
                            </Text>
                            <Text fontSize="xs" color="blue.600">Çocuk</Text>
                        </Box>
                        <Box>
                            <Text fontSize="lg" fontWeight="bold" color="blue.700">
                                {stats.totalBabies}
                            </Text>
                            <Text fontSize="xs" color="blue.600">Bebek</Text>
                        </Box>
                    </Box>
                    <Box borderTop="1px solid" borderColor="blue.200" pt={2}>
                        <Text fontSize="xs" color="blue.600" mb={1}>Geceleme Değeri</Text>
                        <Text fontSize="2xl" fontWeight="bold" color="blue.700">
                            {stats.totalOvernightValue.toFixed(1)}
                        </Text>
                    </Box>
                </Box>

                {/* Bugünkü Geceleme */}
                <Box
                    p={4}
                    borderRadius="2xl"
                    bg="green.50"
                    border="1px solid"
                    borderColor="green.100"
                    transition="all 0.2s"
                    _hover={{ transform: "translateY(-2px)", boxShadow: "md", borderColor: "green.300" }}
                    display="flex"
                    flexDirection="column"
                    justifyContent="space-between"
                >
                    <Text fontSize="xs" fontWeight="bold" color="green.600" letterSpacing="wider" textTransform="uppercase" mb={3}>
                        Bugünkü Geceleme
                    </Text>
                    <Box display="flex" gap={3} justifyContent="space-between" mb={2}>
                        <Box>
                            <Text fontSize="lg" fontWeight="bold" color="green.700">
                                {stats.todayPax}
                            </Text>
                            <Text fontSize="xs" color="green.600">Yetişkin</Text>
                        </Box>
                        <Box>
                            <Text fontSize="lg" fontWeight="bold" color="green.700">
                                {stats.todayChildren}
                            </Text>
                            <Text fontSize="xs" color="green.600">Çocuk</Text>
                        </Box>
                        <Box>
                            <Text fontSize="lg" fontWeight="bold" color="green.700">
                                {stats.todayBabies}
                            </Text>
                            <Text fontSize="xs" color="green.600">Bebek</Text>
                        </Box>
                    </Box>
                    <Box borderTop="1px solid" borderColor="green.200" pt={2}>
                        <Text fontSize="xs" color="green.600" mb={1}>Geceleme Değeri</Text>
                        <Text fontSize="2xl" fontWeight="bold" color="green.700">
                            {stats.todayOvernightValue.toFixed(1)}
                        </Text>
                    </Box>
                </Box>

                {/* Bugünkü Misafirler */}
                <Box
                    p={4}
                    borderRadius="2xl"
                    bg="purple.50"
                    border="1px solid"
                    borderColor="purple.100"
                    transition="all 0.2s"
                    _hover={{ transform: "translateY(-2px)", boxShadow: "md", borderColor: "purple.300" }}
                    display="flex"
                    flexDirection="column"
                    justifyContent="space-between"
                >
                    <Text fontSize="xs" fontWeight="bold" color="purple.600" letterSpacing="wider" textTransform="uppercase" mb={3}>
                        Bugünkü Misafirler
                    </Text>
                    <Box display="flex" gap={4} justifyContent="space-between">
                        <Box>
                            <Text fontSize="2xl" fontWeight="bold" color="purple.700">
                                {stats.todayPax}
                            </Text>
                            <Text fontSize="xs" color="purple.600" mt={1}>Yetişkin</Text>
                        </Box>
                        <Box>
                            <Text fontSize="2xl" fontWeight="bold" color="purple.700">
                                {stats.todayChildren}
                            </Text>
                            <Text fontSize="xs" color="purple.600" mt={1}>Çocuk</Text>
                        </Box>
                        <Box>
                            <Text fontSize="2xl" fontWeight="bold" color="purple.700">
                                {stats.todayBabies}
                            </Text>
                            <Text fontSize="xs" color="purple.600" mt={1}>Bebek</Text>
                        </Box>
                    </Box>
                </Box>
            </Box>

            {/* Grid */}
            <Box
                bg="white"
                borderRadius="xl"
                boxShadow="md"
                overflow="hidden"
                border="1px solid"
                borderColor="gray.200"
            >
                <Box
                    maxH="calc(100vh - 400px)"
                    overflowX="auto"
                    overflowY="auto"
                    sx={{
                        '&::-webkit-scrollbar': {
                            width: '8px',
                            height: '8px',
                        },
                        '&::-webkit-scrollbar-track': {
                            bg: 'gray.100',
                        },
                        '&::-webkit-scrollbar-thumb': {
                            bg: 'gray.400',
                            borderRadius: 'full',
                        },
                        '&::-webkit-scrollbar-thumb:hover': {
                            bg: 'gray.500',
                        },
                    }}
                >
                    <Grid
                        templateColumns={`60px 100px repeat(${days.length}, 1fr)`}
                        bg="#f8f9fa"
                        fontSize="sm"
                        fontWeight="medium"
                        position="relative"
                        minWidth="fit-content"
                    >
                        <Box borderRight="1px solid #dee2e6" textAlign="center" bg="gray.100" position="sticky" top={0} zIndex={2} p={2}>No</Box>
                        <Box borderRight="1px solid #dee2e6" textAlign="center" bg="gray.100" position="sticky" top={0} zIndex={2} p={2}>Kod</Box>

                        {days.map((day) => (
                            <Box key={day} p={1.5} borderRight="1px solid #dee2e6" textAlign="center" bg={day === highlightDay ? "blue.100" : "gray.100"} position="sticky" top={0} zIndex={2}>
                                {day}
                            </Box>
                        ))}

                        {rooms.map((room) => {
                            const roomReservations = getReservationsForRoom(room.no);

                            return (
                                <React.Fragment key={`room-row-${room.no}`}>
                                    <Box p={2} borderTop="1px solid #dee2e6" borderRight="1px solid #dee2e6" bg="#3182ce" color="white" textAlign="center" fontWeight="medium">{room.no}</Box>
                                    <Box p={2} borderTop="1px solid #dee2e6" borderRight="1px solid #dee2e6" bg="#fff" textAlign="center">{room.code || "-"}</Box>

                                    <Box
                                        gridColumn={`3 / ${3 + days.length}`}
                                        borderTop="1px solid #dee2e6"
                                        position="relative"
                                        height="38px"
                                        display="grid"
                                        gridTemplateColumns={`repeat(${days.length}, 1fr)`}
                                    >
                                        {days.map((day, idx) => (
                                            <Box
                                                key={`bg-${day}`}
                                                borderRight={idx < days.length - 1 ? "1px solid #dee2e6" : "none"}
                                                bg={day === highlightDay ? "blue.50" : "#fafafa"}
                                            />
                                        ))}

                                        {roomReservations.map((reservation, resIdx) => {
                                            const pos = getReservationPosition(reservation);
                                            const colorScheme = getReservationStatusColor(reservation);

                                            const cellWidth = 100 / days.length;
                                            const leftPercent = pos.startIndex * cellWidth + (cellWidth / 2);
                                            const widthPercent = pos.width * cellWidth;

                                            return (
                                                <Tooltip
                                                    key={`res-${resIdx}`}
                                                    label={`${reservation.isim} (${reservation.tur}) - ${new Date(reservation.baslangic_tarihi).toLocaleDateString('tr-TR')} / ${new Date(reservation.bitis_tarihi).toLocaleDateString('tr-TR')}`}
                                                    aria-label="Rezervasyon"
                                                >
                                                    <Box
                                                        position="absolute"
                                                        left={`${leftPercent}%`}
                                                        width={`${widthPercent}%`}
                                                        height="100%"
                                                        bg={`${colorScheme}.300`}
                                                        borderLeft="1px solid"
                                                        borderRight="1px solid"
                                                        borderColor={`${colorScheme}.400`}
                                                        display="flex"
                                                        alignItems="center"
                                                        justifyContent="center"
                                                        cursor="pointer"
                                                        overflow="hidden"
                                                        px={1}
                                                        zIndex={1}
                                                        _hover={{
                                                            bg: `${colorScheme}.400`,
                                                        }}
                                                    >
                                                        <Text
                                                            fontSize="xs"
                                                            fontWeight="bold"
                                                            color="white"
                                                            whiteSpace="nowrap"
                                                            overflow="hidden"
                                                            textOverflow="ellipsis"
                                                        >
                                                            {reservation.isim}
                                                        </Text>
                                                    </Box>
                                                </Tooltip>
                                            );
                                        })}
                                    </Box>
                                </React.Fragment>
                            );
                        })}
                    </Grid>
                </Box>
            </Box>
        </Box>
    );
}
