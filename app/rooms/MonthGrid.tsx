import { Box, Grid, Tooltip, Text, Flex, Icon } from "@chakra-ui/react";
import React from "react";
import { Room } from "./types";
import { ReservationData } from "@/services/reservationsService";
import { Users, Baby, Moon } from "lucide-react";
import StatCard from "@/components/common/StatCard";
import {
    getReservationsForRoom,
    getReservationStatusColor,
    getReservationPosition,
    calculateStats
} from "./utils";

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
    const stats = calculateStats(reservations, year);

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
                    colorScheme="blue"
                />
                <StatCard
                    title="Bugünkü Doluluk"
                    value={stats.todayOvernightValue.toFixed(1)}
                    subValue="Geceleme Değeri"
                    icon={Users}
                    colorScheme="green"
                />
                <StatCard
                    title="Bugünkü Misafir"
                    value={(stats.todayPax + stats.todayChildren).toString()}
                    subValue={`+${stats.todayBabies} Bebek`}
                    icon={Baby}
                    colorScheme="purple"
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
                            const roomReservations = getReservationsForRoom(reservations, room.no, year, monthIndex, startDay, dayCount);
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
                                            const pos = getReservationPosition(reservation, year, monthIndex, startDay, dayCount);
                                            const colorScheme = getReservationStatusColor(reservation, year);

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
