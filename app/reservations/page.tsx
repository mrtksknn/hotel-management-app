"use client";

import { useEffect, useState } from "react";
import {
    Box, Text, Tr, Td, Spinner, Badge, Flex,
    ButtonGroup, Button, useDisclosure,
    Select, SimpleGrid
} from "@chakra-ui/react";
import CustomButton from "@/components/common/CustomButton";
import DynamicTable, { Column } from "@/components/common/DynamicTable";
import { getReservationsByYear, ReservationData, summarizeByTur } from "../../services/reservationsService";
import ReservationModal from "./ReservationModal";
import { calculateGeceleme, formatDate, getDateColors, parseUcret, getTurColor } from "./utils";

export default function ReservationsPage() {
    if (typeof window === "undefined") return null;

    const currentYear = new Date().getFullYear();
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [summaryByTur, setSummaryByTur] = useState<Record<string, { totalGeceleme: number; totalUcret: number }>>({});
    const [reservations, setReservations] = useState<ReservationData[]>([]);
    const [loading, setLoading] = useState(true);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 7;

    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await getReservationsByYear(selectedYear);
            const sortedData = data.sort((a, b) =>
                a.isim.localeCompare(b.isim, "tr", { sensitivity: "base" })
            );
            setReservations(sortedData);
            setSummaryByTur(summarizeByTur(sortedData));
        } catch (error) {
            console.error("Rezervasyonlar yüklenirken hata:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);
    useEffect(() => { fetchData(); setCurrentPage(1); }, [selectedYear]);

    const handlePageChange = (page: number) => {
        const totalPages = Math.ceil(reservations.length / itemsPerPage);
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    };

    const totalPax = reservations.reduce((sum, res) => sum + res.pax, 0);
    const totalCocuk = reservations.reduce((sum, res) => sum + res.cocuk_sayisi, 0);
    const totalBebek = reservations.reduce((sum, res) => sum + res.bebek_sayisi, 0);
    const totalGeceleme = reservations.reduce((sum, res) => sum + calculateGeceleme(res), 0);
    const totalUcret = reservations.reduce((sum, res) => sum + parseUcret(res.ucret), 0);

    const getPageNumbers = () => {
        const totalPages = Math.ceil(reservations.length / itemsPerPage);
        const pages: (number | string)[] = [];
        if (totalPages <= 5) for (let i = 1; i <= totalPages; i++) pages.push(i);
        else {
            if (currentPage <= 3) pages.push(1, 2, 3, "...", totalPages);
            else if (currentPage >= totalPages - 2) pages.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
            else pages.push(1, "...", currentPage, "...", totalPages);
        }
        return pages;
    };

    const years = [];
    for (let y = 2018; y <= currentYear; y++) years.push(y);

    const totalPages = Math.ceil(reservations.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentData = reservations.slice(startIndex, startIndex + itemsPerPage);

    return (
        <Box minH="90vh" display="flex" flexDirection="column">
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
                <Box>
                    <Text fontSize="lg" fontWeight="medium">Rezervasyon yönetimi</Text>
                    <Text fontSize="sm" color="#6c757d" mb={6}>
                        Tüm rezervasyon ve misafir bilgilerini buradan görüntüleyebilirsiniz.
                    </Text>
                </Box>
                <Box display="flex" gap={3} alignItems="center">
                    <Select
                        width="120px"
                        value={selectedYear}
                        onChange={(e) => { setSelectedYear(Number(e.target.value)); setCurrentPage(1); }}
                    >
                        {years.map((y) => (<option key={y} value={y}>{y}</option>))}
                    </Select>
                    <CustomButton bg="#1e2532" color="#fff" onClick={onOpen}>Yeni rezervasyon ekle</CustomButton>
                </Box>
            </Box>

            {Object.keys(summaryByTur).length > 0 && (
                <SimpleGrid
                    columns={{
                        base: Math.min(Object.keys(summaryByTur).length, 2),
                        md: Math.min(Object.keys(summaryByTur).length, 3),
                        lg: Math.min(Object.keys(summaryByTur).length, 6)
                    }}
                    spacing={4}
                    mb={6}
                >
                    {Object.entries(summaryByTur).map(([tur, values]) => {
                        const colorScheme = getTurColor(tur);
                        return (
                            <Box
                                key={tur}
                                p={4}
                                borderRadius="2xl"
                                bg={`${colorScheme}.50`}
                                border="1px solid"
                                borderColor={`${colorScheme}.100`}
                                transition="all 0.2s"
                                _hover={{ transform: "translateY(-2px)", boxShadow: "md", borderColor: `${colorScheme}.300` }}
                                display="flex"
                                flexDirection="column"
                                justifyContent="space-between"
                            >
                                <Flex justifyContent="space-between" alignItems="start" mb={3}>
                                    <Text fontSize="xs" fontWeight="bold" color={`${colorScheme}.600`} letterSpacing="wider" textTransform="uppercase">
                                        {tur}
                                    </Text>
                                    <Box w="2" h="2" borderRadius="full" bg={`${colorScheme}.400`} />
                                </Flex>

                                <Box>
                                    <Text fontSize="lg" fontWeight="800" color={`${colorScheme}.800`} lineHeight="1" mb={1}>
                                        {values.totalUcret.toLocaleString("tr-TR", { maximumFractionDigits: 0 })} ₺
                                    </Text>
                                    <Text fontSize="xs" fontWeight="medium" color={`${colorScheme}.600`}>
                                        {values.totalGeceleme} Geceleme
                                    </Text>
                                </Box>
                            </Box>
                        );
                    })}
                </SimpleGrid>
            )}

            <SimpleGrid columns={{ base: 1, md: 1 }} spacing={4}>
                <Box borderWidth="1px" borderColor="#e2e8f0" borderRadius="lg" overflowX="auto" bg="white">
                    {loading ? (
                        <Box textAlign="center" p={10}><Spinner size="lg" /><Text mt={3}>Veriler yükleniyor...</Text></Box>
                    ) : (
                        <>
                            <DynamicTable
                                columns={[
                                    {
                                        header: "İsim",
                                        render: (res) => (
                                            <Box>
                                                <Text fontWeight="500">{res.isim}</Text>
                                                {res.room_code && (
                                                    <Text fontSize="12px" color="gray.600" mt={1}>
                                                        Oda: <b>{res.room_code}</b>
                                                    </Text>
                                                )}
                                            </Box>
                                        )
                                    },
                                    {
                                        header: "Tur",
                                        accessor: "tur",
                                        render: (res) => (
                                            <Badge colorScheme={getTurColor(res.tur)} variant="subtle" px={2} py={1} borderRadius="md">
                                                {res.tur}
                                            </Badge>
                                        )
                                    },
                                    {
                                        header: "Giriş / Çıkış",
                                        render: (res) => {
                                            const { bg, color } = getDateColors(res);
                                            return (
                                                <Box display="flex" alignItems="center" gap={2}>
                                                    <Box padding="3px 6px" borderRadius="md" borderColor={color} border="1px solid" bg={bg} color={color} fontSize="xs" fontWeight="bold">
                                                        {formatDate(res.giris_tarihi)}
                                                    </Box>
                                                    <Text fontSize="sm" color="gray.400">-</Text>
                                                    <Box padding="3px 6px" borderRadius="md" borderColor={color} border="1px solid" bg={bg} color={color} fontSize="xs" fontWeight="bold">
                                                        {formatDate(res.bitis_tarihi)}
                                                    </Box>
                                                </Box>
                                            );
                                        }
                                    },
                                    {
                                        header: "P / Ç / B",
                                        textAlign: "center",
                                        render: (res) => `${res.pax} / ${res.cocuk_sayisi} / ${res.bebek_sayisi}`
                                    },
                                    {
                                        header: "Geceleme",
                                        textAlign: "center",
                                        render: (res) => calculateGeceleme(res)
                                    },
                                    {
                                        header: "Ücret",
                                        textAlign: "center",
                                        render: (res) => `${res.ucret} ₺`
                                    }
                                ]}
                                data={currentData}
                                footer={
                                    <Tr bg="gray.50" fontWeight="bold">
                                        <Td fontSize="14px"><strong>{reservations.length} rezervasyon</strong></Td>
                                        <Td></Td><Td></Td>
                                        <Td fontSize="14px" textAlign="center">{totalPax} / {totalCocuk} / {totalBebek}</Td>
                                        <Td fontSize="14px" textAlign="center">{totalGeceleme}</Td>
                                        <Td fontSize="14px" textAlign="center">{totalUcret.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺</Td>
                                    </Tr>
                                }
                            />

                            {totalPages > 1 && (
                                <Box display="flex" justifyContent="center" alignItems="center" py={4}>
                                    <ButtonGroup size="sm" isAttached>
                                        <Button onClick={() => handlePageChange(currentPage - 1)} isDisabled={currentPage === 1}>Önceki</Button>
                                        {getPageNumbers().map((page, idx) => {
                                            if (page === "...") return <Button key={idx} variant="ghost" isDisabled>...</Button>;
                                            return (
                                                <Button
                                                    key={idx}
                                                    onClick={() => handlePageChange(Number(page))}
                                                    variant={currentPage === page ? "solid" : "outline"}
                                                    colorScheme={currentPage === page ? "blue" : "gray"}
                                                >
                                                    {page}
                                                </Button>
                                            );
                                        })}
                                        <Button onClick={() => handlePageChange(currentPage + 1)} isDisabled={currentPage === totalPages}>Sonraki</Button>
                                    </ButtonGroup>
                                </Box>
                            )}
                        </>
                    )}
                </Box>
            </SimpleGrid>

            <ReservationModal
                isOpen={isOpen}
                onClose={() => { onClose(); fetchData(); }}
            />
        </Box>
    );
}
