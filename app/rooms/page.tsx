"use client";

import { Box, Text, Tabs, TabList, TabPanels, Tab, TabPanel, Select } from "@chakra-ui/react";
import MonthGrid from "./MonthGrid";
import { useEffect, useState } from "react";
import { Room } from "./types";
import { getReservationsByYear, ReservationData } from "@/services/reservationsService";
import { getRooms } from "@/services/roomsService";

interface MonthInfo {
    name: string;
    startDay: number;
    dayCount: number;
    monthIndex: number;
}

const months: MonthInfo[] = [
    { name: "Haziran", startDay: 15, dayCount: 16, monthIndex: 5 },
    { name: "Temmuz", startDay: 1, dayCount: 31, monthIndex: 6 },
    { name: "Ağustos", startDay: 1, dayCount: 31, monthIndex: 7 },
    { name: "Eylül", startDay: 1, dayCount: 15, monthIndex: 8 },
];

export default function RoomsPage() {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [reservations, setReservations] = useState<ReservationData[]>([]);
    const [loading, setLoading] = useState(true);

    const currentYear = new Date().getFullYear();
    const [selectedYear, setSelectedYear] = useState(currentYear);

    const years = [];
    for (let y = 2018; y <= currentYear; y++) {
        years.push(y);
    }

    const today = { day: 12, month: "Temmuz" };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const [roomsData, reservationsData] = await Promise.all([
                getRooms(),
                getReservationsByYear(selectedYear)
            ]);
            setRooms(roomsData);
            setReservations(reservationsData);
            setLoading(false);
        };

        fetchData();
    }, [selectedYear]);

    if (loading) {
        return (
            <Box minH="90vh" display="flex" alignItems="center" justifyContent="center">
                <Text fontSize="xl" color="gray.600">Yükleniyor...</Text>
            </Box>
        );
    }

    return (
        <Box minH="90vh" display="flex" flexDirection="column" p={8} bg="gray.50">
            {/* Header */}
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={8}>
                <Box>
                    <Text fontSize="3xl" fontWeight="bold" color="neutral.900" letterSpacing="tight">Oda Takvimi</Text>
                    <Text fontSize="md" color="neutral.500" mt={2}>
                        Oda doluluk oranlarını ve rezervasyonları takip edin
                    </Text>
                </Box>
                <Select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    width="120px"
                    variant="filled"
                    bg="white"
                    borderRadius="xl"
                    fontWeight="semibold"
                    color="neutral.700"
                    _hover={{ bg: "white", shadow: "sm" }}
                    _focus={{ bg: "white", shadow: "md", borderColor: "brand.500" }}
                >
                    {years.map(year => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                </Select>
            </Box>

            {/* Tabs */}
            <Tabs variant="unstyled" colorScheme="brand">
                <TabList
                    mb={8}
                    bg="white"
                    p={1.5}
                    borderRadius="2xl"
                    width="fit-content"
                    boxShadow="sm"
                    border="1px solid"
                    borderColor="neutral.100"
                >
                    {months.map((month) => (
                        <Tab
                            key={month.name}
                            _selected={{
                                bg: "brand.500",
                                color: "white",
                                shadow: "md"
                            }}
                            _hover={{
                                color: "brand.600"
                            }}
                            color="neutral.500"
                            fontWeight="semibold"
                            fontSize="sm"
                            px={6}
                            py={2.5}
                            borderRadius="xl"
                            transition="all 0.2s ease-in-out"
                        >
                            {month.name}
                        </Tab>
                    ))}
                </TabList>

                <TabPanels>
                    {months.map((month) => (
                        <TabPanel key={month.name} p={0}>
                            <MonthGrid
                                dayCount={month.dayCount}
                                startDay={month.startDay}
                                rooms={rooms}
                                highlightDay={month.name === today.month ? today.day : undefined}
                                reservations={reservations}
                                monthIndex={month.monthIndex}
                                year={selectedYear}
                            />
                        </TabPanel>
                    ))}
                </TabPanels>
            </Tabs>
        </Box>
    );
}
