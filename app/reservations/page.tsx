"use client";

import { useEffect, useState } from "react";
import {
    Box, Text, Table, Thead, Tbody, Tr, Th, Td, Spinner,
    ButtonGroup, Button, useToast, useDisclosure,
} from "@chakra-ui/react";
import CustomButton from "@/components/common/CustomButton";
import { getReservations, ReservationData } from "../../services/reservationsService";
import ReservationModal from "./ReservationModal";
import { SimpleGrid } from "@chakra-ui/react";

export default function ReservationsPage() {
    const [reservations, setReservations] = useState<ReservationData[]>([]);
    const [loading, setLoading] = useState(true);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const toast = useToast();

    // 🔹 Bugünün tarihi sabit olarak 12 Temmuz 2025
    const today = new Date("2025-07-12");

    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await getReservations();
            const sortedData = data.sort((a, b) =>
                a.isim.localeCompare(b.isim, "tr", { sensitivity: "base" })
            );
            setReservations(sortedData);
        } catch (error) {
            console.error("Rezervasyonlar yüklenirken hata:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const totalPages = Math.ceil(reservations.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentData = reservations.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    };

    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        if (totalPages <= 5) for (let i = 1; i <= totalPages; i++) pages.push(i);
        else {
            if (currentPage <= 3) pages.push(1, 2, 3, "...", totalPages);
            else if (currentPage >= totalPages - 2)
                pages.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
            else pages.push(1, "...", currentPage, "...", totalPages);
        }
        return pages;
    };

    const openAddModal = () => {
        onOpen();
    };

    // 🔹 Gece sayısı hesaplama
    const calculateNights = (start: Date, end: Date): number => {
        const diff = end.getTime() - start.getTime();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    };

    // 🔹 Geceleme hesaplama
    const calculateGeceleme = (res: ReservationData): number => {
        const nights = calculateNights(res.baslangic_tarihi, res.bitis_tarihi);
        const totalGuests = res.pax + res.cocuk_sayisi * 0.5 + res.bebek_sayisi * 0;
        return totalGuests * nights;
    };

    // 🔹 Tarih durumuna göre renk belirleme
    const getDateColors = (res: ReservationData) => {
        const start = new Date(res.baslangic_tarihi);
        const end = new Date(res.bitis_tarihi);

        if (today.getTime() === start.getTime()) {
            // Bugün başlangıç günü
            return { bg: "orange.50", color: "orange.600" };
        } else if (today > start && today <= end) {
            // Rezervasyon devam ediyor
            return { bg: "green.50", color: "green.600" };
        } else if (today > end) {
            // Rezervasyon bitmiş
            return { bg: "red.50", color: "red.600" };
        } else {
            // Gelecek tarihli rezervasyon
            return { bg: "blue.50", color: "blue.600" };
        }
    };

    return (
        <Box minH="90vh" display="flex" flexDirection="column">
            {/* Başlık */}
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
                <Box>
                    <Text fontSize="lg" fontWeight="medium">
                        Rezervasyon yönetimi
                    </Text>
                    <Text fontSize="sm" color="#6c757d" mb={6}>
                        Tüm rezervasyon ve misafir bilgilerini buradan görüntüleyebilirsiniz.
                    </Text>
                </Box>

                <Box display="flex" gap={2}>
                    <CustomButton bg="#1e2532" color="#fff" onClick={openAddModal}>
                        Yeni rezervasyon ekle
                    </CustomButton>
                </Box>
            </Box>

            {/* SimpleGrid yapısı ile tablo kutusu */}
            <SimpleGrid columns={{ base: 1, md: 1 }} spacing={4}>
                <Box borderWidth="1px" borderColor="#e2e8f0" borderRadius="lg" overflowX="auto" bg="white">
                    {loading ? (
                        <Box textAlign="center" p={10}>
                            <Spinner size="lg" />
                            <Text mt={3}>Veriler yükleniyor...</Text>
                        </Box>
                    ) : (
                        <>
                            <Table variant="simple" size="md">
                                <Thead bg="gray.100">
                                    <Tr>
                                        <Th>İsim</Th>
                                        <Th>Tur</Th>
                                        <Th>Giriş</Th>
                                        <Th>Çıkış</Th>
                                        <Th>Gece</Th>
                                        <Th>P / Ç / B</Th>
                                        <Th>Geceleme</Th>
                                        <Th>Ücret</Th>
                                    </Tr>
                                </Thead>

                                <Tbody>
                                    {currentData.map((res) => {
                                        const { bg, color } = getDateColors(res);
                                        return (
                                            <Tr key={res.id}>
                                                <Td>{res.isim}</Td>
                                                <Td>{res.tur}</Td>

                                                {/* 🔹 Sadece tarih hücrelerinin arka planı değişiyor */}
                                                <Td fontWeight="500">
                                                    <Box padding="6px" width="fit-content" borderRadius="8" borderColor={color} border="1px solid" bg={bg} color={color}>
                                                        {res.giris_tarihi.toLocaleDateString("tr-TR")}
                                                    </Box>
                                                </Td>
                                                <Td fontWeight="500">
                                                    <Box padding="6px" width="fit-content" borderRadius="8" borderColor={color} border="1px solid" bg={bg} color={color}>
                                                        {res.bitis_tarihi.toLocaleDateString("tr-TR")}
                                                    </Box>
                                                </Td>

                                                <Td>{calculateNights(res.baslangic_tarihi, res.bitis_tarihi)}</Td>
                                                <Td>{res.pax} / {res.cocuk_sayisi} / {res.bebek_sayisi}</Td>
                                                <Td>{calculateGeceleme(res)}</Td>
                                                <Td>{res.ucret} ₺</Td>
                                            </Tr>
                                        );
                                    })}
                                </Tbody>
                            </Table>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <Box display="flex" justifyContent="center" alignItems="center" py={4}>
                                    <ButtonGroup size="sm" isAttached>
                                        <Button
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            isDisabled={currentPage === 1}
                                        >
                                            Önceki
                                        </Button>

                                        {getPageNumbers().map((page, idx) =>
                                            page === "..." ? (
                                                <Button key={idx} variant="ghost" isDisabled>
                                                    ...
                                                </Button>
                                            ) : (
                                                <Button
                                                    key={idx}
                                                    onClick={() => handlePageChange(page as number)}
                                                    variant={currentPage === page ? "solid" : "outline"}
                                                    colorScheme={currentPage === page ? "blue" : "gray"}
                                                >
                                                    {page}
                                                </Button>
                                            )
                                        )}

                                        <Button
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            isDisabled={currentPage === totalPages}
                                        >
                                            Sonraki
                                        </Button>
                                    </ButtonGroup>
                                </Box>
                            )}
                        </>
                    )}
                </Box>
            </SimpleGrid>

            {/* Modal component */}
            <ReservationModal
                isOpen={isOpen}
                onClose={onClose}
                onSuccess={fetchData}
            />
        </Box>
    );
}
