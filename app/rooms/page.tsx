"use client";

import { Box, Text, Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import MonthGrid from "./MonthGrid";
import { useEffect, useState } from "react";
import { Room } from "./types";
import { getRooms } from "@/services/roomsService";

interface MonthInfo {
    name: string;
    startDay: number;
    dayCount: number;
}

const months: MonthInfo[] = [
    { name: "Haziran", startDay: 15, dayCount: 16 },
    { name: "Temmuz", startDay: 1, dayCount: 31 },
    { name: "Ağustos", startDay: 1, dayCount: 31 },
    { name: "Eylül", startDay: 1, dayCount: 15 },
];

export default function RoomsPage() {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);

    const today = { day: 12, month: "Temmuz" };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const [roomsData] = await Promise.all([getRooms()]);
            setRooms(roomsData);
            setLoading(false);
        };

        fetchData();
    }, []);

    if (loading) return <Text>Yükleniyor...</Text>;

    return (
        <Box>
            <Text fontSize="lg" fontWeight="bold" mb={4}>
                Oda Takvimi
            </Text>

            <Tabs variant="enclosed" colorScheme="blue">
                <TabList>
                    {months.map((m) => (
                        <Tab key={m.name}>{m.name}</Tab>
                    ))}
                </TabList>

                <TabPanels>
                    {months.map((m) => (
                        <TabPanel key={m.name}>
                            <MonthGrid
                                dayCount={m.dayCount}
                                startDay={m.startDay}
                                rooms={rooms}
                                highlightDay={m.name === today.month ? today.day : undefined}
                            />
                        </TabPanel>
                    ))}
                </TabPanels>
            </Tabs>
        </Box>
    );
}
