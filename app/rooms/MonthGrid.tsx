import { Box, Grid, Tooltip, Text, Flex, Icon } from "@chakra-ui/react";
import React from "react";
import { Room } from "./types";
import { ReservationData } from "@/services/reservationsService";
import { Users, Baby, Moon } from "lucide-react";

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
        const today = new Date(year, 6, 12); // Demo tarihi
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

        const totalOvernightValue = totalPax + (totalChildren * 0.5);
        const todayOvernightValue = todayPax + (todayChildren * 0.5);

        return {
            totalNights, todayNights,
            totalPax, totalChildren, totalBabies,
            todayPax, todayChildren, todayBabies,
            totalOvernightValue, todayOvernightValue,
        };
    };

    const stats = calculateStats();

    // Minimal İstatistik Kartı Bileşeni
    const StatCard = ({ title, value, subValue, icon, color }: any) => (
        <Box
            p={5}
            borderRadius="xl"
            bg="white"
            border="1px solid"
            borderColor="neutral.100"
            boxShadow="sm"
            transition="all 0.2s"
            _hover={{ transform: "translateY(-2px)", boxShadow: "soft" }}
            display="flex"
            alignItems="center"
            gap={4}
        >
            <Box
                p={3}
                borderRadius="lg"
                bg={`${color}.50`}
                color={`${color}.500`}
                display="flex"
                alignItems="center"
                justifyContent="center"
            >
                <Icon as={icon} boxSize={6} />
            </Box>
            <Box>
                <Text fontSize="xs" fontWeight="medium" color="neutral.500" textTransform="uppercase" letterSpacing="wide">
                    {title}
                </Text>
                <Flex alignItems="baseline" gap={2}>
                    <Text fontSize="2xl" fontWeight="bold" color="neutral.800">
                        {value}
                    </Text>
                    {subValue && (
                        <Text fontSize="sm" color="neutral.400">
                            {subValue}
                        </Text>
                    )}
                </Flex>
            </Box>
        </Box>
    );

    return (
        <Box>
            {/* İstatistikler - Minimal Grid */}
            <Box
                mb={8}
                display="grid"
                gridTemplateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }}
                gap={6}
            >
                <StatCard
                    title="Toplam Geceleme"
                    value={stats.totalOvernightValue.toFixed(1)}
                    subValue={`${stats.totalPax} Yetişkin`}
                    icon={Moon}
                    color="blue"
                />
                <StatCard
                    title="Bugünkü Doluluk"
                    value={stats.todayOvernightValue.toFixed(1)}
                    subValue="Geceleme Değeri"
                    icon={Users}
                    color="green"
                />
                <StatCard
                    title="Bugünkü Misafir"
                    value={stats.todayPax + stats.todayChildren}
                    subValue={`+${stats.todayBabies} Bebek`}
                    icon={Baby}
                    color="purple"
                />
            </Box>

            {/* Takvim Grid */}
            <Box
                bg="white"
                borderRadius="2xl"
                boxShadow="soft"
                overflow="hidden"
                border="1px solid"
                borderColor="neutral.100"
            >
                <Box
                    maxH="calc(100vh - 350px)"
                    overflowX="auto"
                    overflowY="auto"
                    sx={{
                        '&::-webkit-scrollbar': { width: '6px', height: '6px' },
                        '&::-webkit-scrollbar-track': { bg: 'transparent' },
                        '&::-webkit-scrollbar-thumb': { bg: 'neutral.200', borderRadius: 'full' },
                        '&::-webkit-scrollbar-thumb:hover': { bg: 'neutral.300' },
                    }}
                >
                    <Grid
                        templateColumns={`60px 80px repeat(${days.length}, minmax(40px, 1fr))`}
                        fontSize="sm"
                        position="relative"
                        minWidth="fit-content"
                    >
                        {/* Header Row */}
                        <Box position="sticky" top={0} zIndex={10} bg="white" borderBottom="1px solid" borderColor="neutral.100">
                            <Flex h="full" align="center" justify="center" fontWeight="semibold" color="neutral.500" fontSize="xs">NO</Flex>
                        </Box>
                        <Box position="sticky" top={0} zIndex={10} bg="white" borderBottom="1px solid" borderColor="neutral.100" borderRight="1px solid" borderRightColor="neutral.100">
                            <Flex h="full" align="center" justify="center" fontWeight="semibold" color="neutral.500" fontSize="xs">KOD</Flex>
                        </Box>

                        {days.map((day) => (
                            <Box
                                key={day}
                                position="sticky"
                                top={0}
                                zIndex={10}
                                bg={day === highlightDay ? "blue.50" : "white"}
                                borderBottom="1px solid"
                                borderColor={day === highlightDay ? "blue.200" : "neutral.100"}
                                borderRight="1px solid"
                                borderRightColor="neutral.50"
                                py={3}
                            >
                                <Flex direction="column" align="center" justify="center">
                                    <Text
                                        fontSize="sm"
                                        fontWeight={day === highlightDay ? "bold" : "medium"}
                                        color={day === highlightDay ? "blue.600" : "neutral.600"}
                                    >
                                        {day}
                                    </Text>
                                </Flex>
                            </Box>
                        ))}

                        {/* Room Rows */}
                        {rooms.map((room, index) => {
                            const roomReservations = getReservationsForRoom(room.no);
                            const isEven = index % 2 === 0;

                            return (
                                <React.Fragment key={`room-row-${room.no}`}>
                                    {/* Room No */}
                                    <Box
                                        bg={isEven ? "white" : "neutral.50"}
                                        borderBottom="1px solid"
                                        borderColor="neutral.100"
                                        py={3}
                                    >
                                        <Flex h="full" align="center" justify="center" fontWeight="bold" color="neutral.700">
                                            {room.no}
                                        </Flex>
                                    </Box>

                                    {/* Room Code */}
                                    <Box
                                        bg={isEven ? "white" : "neutral.50"}
                                        borderBottom="1px solid"
                                        borderColor="neutral.100"
                                        borderRight="1px solid"
                                        borderRightColor="neutral.100"
                                        py={3}
                                    >
                                        <Flex h="full" align="center" justify="center" color="neutral.500" fontSize="xs">
                                            {room.code || "-"}
                                        </Flex>
                                    </Box>

                                    {/* Days Grid for Room */}
                                    <Box
                                        gridColumn={`3 / ${3 + days.length}`}
                                        position="relative"
                                        height="50px"
                                        display="grid"
                                        gridTemplateColumns={`repeat(${days.length}, 1fr)`}
                                        bg={isEven ? "white" : "neutral.50"}
                                        borderBottom="1px solid"
                                        borderColor="neutral.100"
                                    >
                                        {/* Grid Lines */}
                                        {days.map((day, idx) => (
                                            <Box
                                                key={`bg-${day}`}
                                                borderRight="1px solid"
                                                borderColor="neutral.50"
                                                bg={day === highlightDay ? "blue.50" : "transparent"}
                                                opacity={day === highlightDay ? 0.3 : 1}
                                            />
                                        ))}

                                        {/* Reservations */}
                                        {roomReservations.map((reservation, resIdx) => {
                                            const pos = getReservationPosition(reservation);
                                            const colorScheme = getReservationStatusColor(reservation);

                                            const cellWidth = 100 / days.length;
                                            const leftPercent = pos.startIndex * cellWidth + (cellWidth / 2);
                                            const widthPercent = pos.width * cellWidth;

                                            return (
                                                <Tooltip
                                                    key={`res-${resIdx}`}
                                                    label={`${reservation.isim} (${reservation.tur})`}
                                                    hasArrow
                                                    bg="neutral.800"
                                                    color="white"
                                                    fontSize="xs"
                                                    borderRadius="md"
                                                    p={2}
                                                >
                                                    <Box
                                                        position="absolute"
                                                        top="50%"
                                                        transform="translateY(-50%)"
                                                        left={`${leftPercent}%`}
                                                        width={`${widthPercent}%`}
                                                        height="32px"
                                                        bg={`${colorScheme}.300`}
                                                        border="1px solid"
                                                        borderColor={`${colorScheme}.400`}
                                                        color={colorScheme === 'yellow' ? 'black' : 'white'}
                                                        borderRadius="full"
                                                        display="flex"
                                                        alignItems="center"
                                                        justifyContent="center"
                                                        cursor="pointer"
                                                        px={3}
                                                        zIndex={5}
                                                        boxShadow="sm"
                                                        transition="all 0.2s"
                                                        _hover={{
                                                            bg: `${colorScheme}.400`,
                                                            transform: "translateY(-50%) scale(1.02)",
                                                            boxShadow: "md",
                                                            zIndex: 10
                                                        }}
                                                    >
                                                        <Text
                                                            fontSize="xs"
                                                            fontWeight="semibold"
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
            </Box >
        </Box >
    );
}
