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
        <Box minH="90vh" display="flex" flexDirection="column">
            {/* Header */}
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
                <Box>
                    <Text fontSize="lg" fontWeight="medium">Oda Takvimi</Text>
                    <Text fontSize="sm" color="#6c757d" mb={6}>
                        Rezervasyonları görüntüleyin ve yönetin
                    </Text>
                </Box>
                <Select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    width="120px"
                >
                    {years.map(year => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                </Select>
            </Box>

            {/* Tabs */}
            <Tabs variant="soft-rounded" colorScheme="blue">
                <TabList mb={6} gap={2} flexWrap="wrap">
                    {months.map((month) => (
                        <Tab
                            key={month.name}
                            _selected={{
                                bg: "blue.500",
                                color: "white",
                                boxShadow: "md"
                            }}
                            _hover={{
                                bg: "blue.50"
                            }}
                            fontWeight="semibold"
                            px={6}
                            py={2}
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
