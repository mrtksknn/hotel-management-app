"use client";

import { useEffect, useState } from "react";
import {
    Box, Text, Tr, Td, Spinner, Badge, Flex,
    ButtonGroup, Button, useDisclosure,
    Select, SimpleGrid, Icon
} from "@chakra-ui/react";
import CustomButton from "@/components/common/CustomButton";
import DynamicTable from "@/components/common/DynamicTable";
import StatCard from "@/components/common/StatCard";
import { getReservationsByYear, ReservationData, summarizeByTur } from "../../services/reservationsService";
import ReservationModal from "./ReservationModal";
import { calculateGeceleme, formatDate, getDateColors, parseUcret, getTurColor } from "./utils";
import { Users, Moon, Wallet, Calendar } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function ReservationsPage() {
    if (typeof window === "undefined") return null;

    const { user } = useAuth();
    const isOwner = user?.role === "owner";
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
            const hotelToFilter = user?.hotel;

            const data = await getReservationsByYear(selectedYear, hotelToFilter);
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

    useEffect(() => {
        fetchData();
    }, [user, selectedYear]);

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedYear]);


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

    const cardCount = Object.keys(summaryByTur).length;
    let variant: 'normal' | 'compact' | 'veryCompact' = 'normal';
    if (cardCount > 5) variant = 'veryCompact';
    else if (cardCount > 3) variant = 'compact';

    return (
        <Box h="100vh" display="flex" flexDirection="column" p={6} bg="gray.50" overflow="hidden">
            {/* Header */}
            <Box flex="0 0 auto" display="flex" alignItems="center" justifyContent="space-between" mb={6}>
                <Box>
                    <Text fontSize="2xl" fontWeight="bold" color="neutral.900" letterSpacing="tight">Rezervasyon Yönetimi</Text>
                    <Text fontSize="md" color="neutral.500" mt={2}>
                        Tüm rezervasyon ve misafir bilgilerini buradan görüntüleyebilirsiniz.
                    </Text>
                </Box>
                <Box display="flex" gap={3} alignItems="center">

                    <Select
                        width="120px"
                        value={selectedYear}
                        onChange={(e) => { setSelectedYear(Number(e.target.value)); setCurrentPage(1); }}
                        variant="filled"
                        bg="white"
                        borderRadius="xl"
                        fontWeight="semibold"
                        color="neutral.700"
                        _hover={{ bg: "white", shadow: "sm" }}
                        _focus={{ bg: "white", shadow: "md", borderColor: "brand.500" }}
                    >
                        {years.map((y) => (<option key={y} value={y}>{y}</option>))}
                    </Select>
                    <CustomButton
                        bg="brand.500"
                        color="white"
                        _hover={{ bg: "brand.600", transform: "translateY(-1px)", shadow: "md" }}
                        _active={{ transform: "translateY(0)" }}
                        onClick={onOpen}
                        px={6}
                        h="40px"
                        borderRadius="xl"
                        fontSize="sm"
                        fontWeight="semibold"
                        leftIcon={<Icon as={Calendar} />}
                    >
                        Yeni Rezervasyon
                    </CustomButton>
                </Box>
            </Box>

            {Object.keys(summaryByTur).length > 0 && (
                <Box flex="0 0 auto" mb={6}>
                    <SimpleGrid
                        minChildWidth={960 / Object.keys(summaryByTur).length}
                        spacing={4}
                    >
                        {Object.entries(summaryByTur).map(([tur, values]) => {
                            const colorScheme = getTurColor(tur);
                            return (
                                <StatCard
                                    key={tur}
                                    title={tur}
                                    value={isOwner
                                        ? `${values.totalUcret.toLocaleString("tr-TR", { maximumFractionDigits: 0 })} ₺`
                                        : `${values.totalGeceleme} Geceleme`
                                    }
                                    subValue={isOwner
                                        ? `${values.totalGeceleme} Geceleme`
                                        : ""
                                    }
                                    icon={Wallet}
                                    colorScheme={colorScheme}
                                    variant={variant}
                                />
                            );
                        })}
                    </SimpleGrid>
                </Box>
            )}

            <Box flex="1" minH={0} display="flex" flexDirection="column">
                <Box
                    flex="1"
                    overflowY="auto"
                    border="1px solid"
                    borderColor="neutral.100"
                    borderRadius="2xl"
                    bg="white"
                    boxShadow="soft"
                    css={{
                        "&::-webkit-scrollbar": { width: "6px", height: "6px" },
                        "&::-webkit-scrollbar-track": { background: "transparent" },
                        "&::-webkit-scrollbar-thumb": { background: "#CBD5E0", borderRadius: "4px" },
                        "&::-webkit-scrollbar-thumb:hover": { background: "#A0AEC0" },
                    }}
                >
                    {loading ? (
                        <Box textAlign="center" p={10}><Spinner size="lg" color="brand.500" thickness="3px" /><Text mt={4} color="neutral.500" fontWeight="medium">Veriler yükleniyor...</Text></Box>
                    ) : (
                        <>
                            <DynamicTable
                                columns={[
                                    {
                                        header: "MİSAFİR",
                                        render: (res) => (
                                            <Box>
                                                <Text fontWeight="semibold" textTransform="capitalize" color="neutral.800">{res.isim}</Text>
                                                {res.room_code && (
                                                    <Flex align="center" gap={1} mt={1}>
                                                        <Badge size="sm" colorScheme="gray" variant="subtle" borderRadius="md">
                                                            ODA {res.room_code}
                                                        </Badge>
                                                    </Flex>
                                                )}
                                            </Box>
                                        )
                                    },
                                    {
                                        header: "TUR",
                                        accessor: "tur",
                                        render: (res) => (
                                            <Badge colorScheme={getTurColor(res.tur)} variant="subtle" px={2.5} py={1} borderRadius="lg" textTransform="uppercase" letterSpacing="wide" fontSize="xs" fontWeight="bold">
                                                {res.tur}
                                            </Badge>
                                        )
                                    },
                                    {
                                        header: "TARİHLER",
                                        render: (res) => {
                                            const { bg, color } = getDateColors(res);
                                            return (
                                                <Flex align="center" gap={2}>
                                                    <Badge variant="outline" colorScheme={color.split('.')[0]} borderRadius="md" px={2} py={1}>
                                                        {formatDate(res.giris_tarihi)}
                                                    </Badge>
                                                    <Text fontSize="xs" color="neutral.400">→</Text>
                                                    <Badge variant="outline" colorScheme={color.split('.')[0]} borderRadius="md" px={2} py={1}>
                                                        {formatDate(res.bitis_tarihi)}
                                                    </Badge>
                                                </Flex>
                                            );
                                        }
                                    },
                                    {
                                        header: "KİŞİ SAYISI",
                                        textAlign: "center",
                                        render: (res) => (
                                            <Flex justify="center" gap={3} color="neutral.600" fontSize="sm">
                                                <Flex align="center" gap={1} title="Yetişkin"><Icon as={Users} boxSize={3} /> {res.pax}</Flex>
                                                {res.cocuk_sayisi > 0 && <Flex align="center" gap={1} title="Çocuk" color="neutral.500">+{res.cocuk_sayisi}</Flex>}
                                                {res.bebek_sayisi > 0 && <Flex align="center" gap={1} title="Bebek" color="neutral.400">+{res.bebek_sayisi}B</Flex>}
                                            </Flex>
                                        )
                                    },
                                    {
                                        header: "GECELEME",
                                        textAlign: "center",
                                        render: (res) => (
                                            <Text fontWeight="medium" color="neutral.700">{calculateGeceleme(res)}</Text>
                                        )
                                    },
                                    {
                                        header: "ÜCRET",
                                        textAlign: "center",
                                        render: (res) => (
                                            <Text fontWeight="bold" color="brand.600">{res.ucret} ₺</Text>
                                        )
                                    }
                                ]}
                                data={currentData}
                                footer={
                                    <Tr bg="gray.50">
                                        <Td fontSize="sm" color="neutral.600" py={4}><strong>{reservations.length} Rezervasyon</strong></Td>
                                        <Td></Td><Td></Td>
                                        <Td fontSize="sm" textAlign="center" color="neutral.600">{totalPax} / {totalCocuk} / {totalBebek}</Td>
                                        <Td fontSize="sm" textAlign="center" color="neutral.600">{totalGeceleme}</Td>
                                        <Td fontSize="sm" textAlign="center" fontWeight="bold" color="brand.700">
                                            {isOwner
                                                ? `${totalUcret.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺`
                                                : "-"
                                            }
                                        </Td>
                                    </Tr>
                                }
                            />

                            {totalPages > 1 && (
                                <Box display="flex" justifyContent="center" alignItems="center" py={4} borderTop="1px solid" borderColor="neutral.100">
                                    <ButtonGroup size="sm" isAttached variant="outline">
                                        <Button onClick={() => handlePageChange(currentPage - 1)} isDisabled={currentPage === 1} borderRadius="lg">Önceki</Button>
                                        {getPageNumbers().map((page, idx) => {
                                            if (page === "...") return <Button key={idx} variant="ghost" isDisabled>...</Button>;
                                            return (
                                                <Button
                                                    key={idx}
                                                    onClick={() => handlePageChange(Number(page))}
                                                    variant={currentPage === page ? "solid" : "outline"}
                                                    colorScheme={currentPage === page ? "brand" : "gray"}
                                                >
                                                    {page}
                                                </Button>
                                            );
                                        })}
                                        <Button onClick={() => handlePageChange(currentPage + 1)} isDisabled={currentPage === totalPages} borderRadius="lg">Sonraki</Button>
                                    </ButtonGroup>
                                </Box>
                            )}
                        </>
                    )}
                </Box>
            </Box>

            <ReservationModal
                isOpen={isOpen}
                onClose={() => { onClose(); fetchData(); }}
            />
        </Box>
    );
}
