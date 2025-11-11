"use client";

import { Box, Grid } from "@chakra-ui/react";
import React from "react";
import { Room } from "./types";

interface MonthGridProps {
    dayCount: number;
    startDay?: number;
    rooms: Room[];
    highlightDay?: number;
}

export default function MonthGrid({
    dayCount,
    startDay = 1,
    rooms,
    highlightDay,
}: MonthGridProps) {
    const days = Array.from({ length: dayCount }, (_, i) => i + startDay);

    return (
        <Box borderWidth="1px" borderColor="#e2e8f0" borderRadius="md" maxH="85vh" overflowY="auto" position="relative">
            <Grid
                templateColumns={`50px 50px 80px repeat(${days.length}, 50px)`}
                bg="#f8f9fa"
                fontSize="sm"
                fontWeight="medium"
                position="relative"
            >
                {/* Başlıklar */}
                <Box borderRight="1px solid #dee2e6" textAlign="center" bg="gray.100" position="sticky" top={0} zIndex={2}>Kat</Box>
                <Box borderRight="1px solid #dee2e6" textAlign="center" bg="gray.100" position="sticky" top={0} zIndex={2}>No</Box>
                <Box borderRight="1px solid #dee2e6" textAlign="center" bg="gray.100" position="sticky" top={0} zIndex={2}>Kod</Box>

                {days.map((day) => (
                    <Box key={day} p={1.5} borderRight="1px solid #dee2e6" textAlign="center" bg={day === highlightDay ? "blue.100" : "gray.100"} position="sticky" top={0}>
                        {day}
                    </Box>
                ))}

                {/* Odalar ve rezervasyonlar */}
                {rooms.map((room, rIdx) => {
                    return (
                        <React.Fragment key={`room-row-${room.no}`}>
                            <Box p={2} borderTop="1px solid #dee2e6" borderRight="1px solid #dee2e6" bg="#3182ce" color="white" textAlign="center">{room.floor}</Box>
                            <Box p={2} borderTop="1px solid #dee2e6" borderRight="1px solid #dee2e6" bg="#fff" textAlign="center">{room.no}</Box>
                            <Box p={2} borderTop="1px solid #dee2e6" borderRight="1px solid #dee2e6" bg="#fff" textAlign="center">{room.code || "-"}</Box>

                            {days.map((day) => (
                                <Box key={`cell-${rIdx}-${day}`} borderTop="1px solid #dee2e6" borderRight="1px solid #dee2e6" height="38px" bg={day === highlightDay ? "blue.50" : "#fafafa"} />
                            ))}
                        </React.Fragment>
                    );
                })}
            </Grid>
        </Box>
    );
}
