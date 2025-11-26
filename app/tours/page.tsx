"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
    Box, Heading, Text, Button, useDisclosure,
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
    FormControl, FormLabel, Input, Select, useToast,
    Flex, Badge, Icon, Spinner, IconButton, NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper, ButtonGroup
} from "@chakra-ui/react";
import { Plus, Trash2, Calendar, DollarSign, Percent, Tag, Database, TurkishLira, ChevronLeft, ChevronRight } from "lucide-react";
import DynamicTable from "@/components/common/DynamicTable";
import CustomButton from "@/components/common/CustomButton";
import { getTourPrices, addTourPrice, deleteTourPrice, TourPriceDefinition } from "@/services/tourService";

const parseAmount = (value: string) => {
    if (!value) return 0;
    let cleanValue = value.replace(/\./g, "").replace(",", ".");
    return parseFloat(cleanValue);
};

export default function ToursPage() {
    const { user } = useAuth();
    const [prices, setPrices] = useState<TourPriceDefinition[]>([]);
    const [loading, setLoading] = useState(true);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();

    // Yıl Filtresi
    const currentYear = new Date().getFullYear();
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const years = Array.from({ length: currentYear - 2018 + 1 }, (_, i) => currentYear - i);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    const totalPages = Math.ceil(prices.length / itemsPerPage);
    const currentData = prices.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Sayfa numaralarını oluştur
    const getPageNumbers = () => {
        const pages = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 4) {
                pages.push(1, 2, 3, 4, 5, "...", totalPages);
            } else if (currentPage >= totalPages - 3) {
                pages.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
            }
        }
        return pages;
    };

    // Form State
    const [tourName, setTourName] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [adultPrice, setAdultPrice] = useState("");
    const [childDiscount, setChildDiscount] = useState("0.7");

    const fetchData = async () => {
        if (!user?.hotel) return;
        setLoading(true);
        try {
            const data = await getTourPrices(user.hotel, selectedYear);
            setPrices(data);
        } catch (error) {
            console.error(error);
            toast({ title: "Veriler yüklenemedi", status: "error" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user, selectedYear]);

    const handleSubmit = async () => {
        if (!user?.hotel || !tourName || !startDate || !endDate || !adultPrice) {
            toast({ title: "Lütfen zorunlu alanları doldurun", status: "warning" });
            return;
        }

        try {
            await addTourPrice({
                hotel: user.hotel,
                tourName: tourName,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                adultPrice: parseAmount(adultPrice),
                childDiscount: parseFloat(childDiscount)
            });
            toast({ title: "Fiyat tanımı eklendi", status: "success" });
            onClose();

            // Formu sıfırla
            setTourName("");
            setStartDate("");
            setEndDate("");
            setAdultPrice("");
            setChildDiscount("0.7");

            fetchData();
        } catch (error) {
            toast({ title: "Kayıt sırasında hata oluştu", status: "error" });
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Bu fiyat tanımını silmek istediğinize emin misiniz?")) return;
        try {
            await deleteTourPrice(id);
            toast({ title: "Silindi", status: "success" });
            fetchData();
        } catch (error) {
            toast({ title: "Silme hatası", status: "error" });
        }
    };

    // Renk üretici
    const getTourColor = (name: string) => {
        const colors = ["blue", "green", "purple", "orange", "teal", "red", "cyan", "pink"];
        let hash = 0;
        for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
        return colors[Math.abs(hash) % colors.length];
    };

    return (
        <Box h="100vh" display="flex" flexDirection="column" p={6} bg="gray.50" overflow="hidden">
            {/* Header */}
            <Box flex="0 0 auto" display="flex" alignItems="center" justifyContent="space-between" mb={6}>
                <Box>
                    <Text fontSize="2xl" fontWeight="semibold" color="neutral.800">Tur ve Fiyat Yönetimi</Text>
                    <Text fontSize="md" color="neutral.500" mt={2}>
                        Tur şirketleri için sezonluk fiyat tanımlamaları
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
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </Select>
                    <CustomButton
                        bg="brand.500"
                        color="white"
                        _hover={{ bg: "brand.600" }}
                        onClick={onOpen}
                        leftIcon={<Icon as={Plus} />}
                    >
                        Yeni Fiyat Tanımla
                    </CustomButton>
                </Box>
            </Box>

            {/* Tablo */}
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
                        <Box p={8} textAlign="center"><Spinner color="brand.500" /></Box>
                    ) : (
                        <>
                            <DynamicTable
                                columns={[
                                    {
                                        header: "Tur Şirketi",
                                        accessor: "tourName",
                                        render: (row) => (
                                            <Badge colorScheme={getTourColor(row.tourName)} px={2} py={1} borderRadius="md">
                                                {row.tourName}
                                            </Badge>
                                        )
                                    },
                                    {
                                        header: "Başlangıç",
                                        accessor: "startDate",
                                        render: (row) => (
                                            <Flex align="center" gap={2}>
                                                <Icon as={Calendar} size={14} color="gray" />
                                                <Text>{new Date(row.startDate).toLocaleDateString("tr-TR")}</Text>
                                            </Flex>
                                        )
                                    },
                                    {
                                        header: "Bitiş",
                                        accessor: "endDate",
                                        render: (row) => (
                                            <Flex align="center" gap={2}>
                                                <Icon as={Calendar} size={14} color="gray" />
                                                <Text>{new Date(row.endDate).toLocaleDateString("tr-TR")}</Text>
                                            </Flex>
                                        )
                                    },
                                    {
                                        header: "Yetişkin Fiyatı",
                                        accessor: "adultPrice",
                                        render: (row) => (
                                            <Flex align="center" gap={2}>
                                                <Icon as={TurkishLira} size={14} color="green" />
                                                <Text fontWeight="bold">
                                                    {typeof row.adultPrice === 'number'
                                                        ? row.adultPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })
                                                        : row.adultPrice}
                                                </Text>
                                            </Flex>
                                        )
                                    },
                                    {
                                        header: "Çocuk Katsayısı",
                                        accessor: "childDiscount",
                                        render: (row) => {
                                            const price = typeof row.adultPrice === 'number' ? row.adultPrice : parseAmount(row.adultPrice as string);
                                            return (
                                                <Flex align="center" gap={2}>
                                                    <Icon as={Percent} size={14} color="orange" />
                                                    <Text>{row.childDiscount} (x{price} = {(price * row.childDiscount).toFixed(2)} ₺)</Text>
                                                </Flex>
                                            )
                                        }
                                    },
                                    {
                                        header: "İşlem",
                                        accessor: "id",
                                        render: (row) => (
                                            <IconButton
                                                aria-label="Sil"
                                                icon={<Trash2 size={18} />}
                                                size="sm"
                                                colorScheme="red"
                                                variant="ghost"
                                                onClick={() => handleDelete(row.id!)}
                                            />
                                        )
                                    }
                                ]}
                                data={currentData}
                            />

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <Flex justify="center" mt={4} align="center" gap={2}>
                                    <Button
                                        size="sm"
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        isDisabled={currentPage === 1}
                                        leftIcon={<Icon as={ChevronLeft} size={16} />}
                                        variant="outline"
                                        bg="white"
                                    >
                                        Önceki
                                    </Button>

                                    <ButtonGroup size="sm" isAttached variant="outline" bg="white">
                                        {getPageNumbers().map((page, index) => (
                                            <Button
                                                key={index}
                                                onClick={() => typeof page === "number" && setCurrentPage(page)}
                                                isActive={currentPage === page}
                                                isDisabled={typeof page !== "number"}
                                                _active={{
                                                    bg: "brand.500",
                                                    color: "white",
                                                    borderColor: "brand.500"
                                                }}
                                            >
                                                {page}
                                            </Button>
                                        ))}
                                    </ButtonGroup>

                                    <Button
                                        size="sm"
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        isDisabled={currentPage === totalPages}
                                        rightIcon={<Icon as={ChevronRight} size={16} />}
                                        variant="outline"
                                        bg="white"
                                    >
                                        Sonraki
                                    </Button>
                                </Flex>
                            )}
                        </>
                    )}
                </Box>

                {/* Modal */}
                <Modal isOpen={isOpen} onClose={onClose} size="lg">
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Yeni Fiyat Tanımı Ekle</ModalHeader>
                        <ModalBody display="flex" flexDirection="column" gap={4}>
                            <FormControl isRequired>
                                <FormLabel>Tur Şirketi</FormLabel>
                                <Input
                                    placeholder="Tur Şirketi Adı"
                                    value={tourName}
                                    onChange={(e) => setTourName(e.target.value)}
                                />
                            </FormControl>

                            <Flex gap={4}>
                                <FormControl isRequired>
                                    <FormLabel>Başlangıç Tarihi</FormLabel>
                                    <Input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                    />
                                </FormControl>
                                <FormControl isRequired>
                                    <FormLabel>Bitiş Tarihi</FormLabel>
                                    <Input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                    />
                                </FormControl>
                            </Flex>

                            <Flex gap={4}>
                                <FormControl isRequired>
                                    <FormLabel>Yetişkin Fiyatı (₺)</FormLabel>
                                    <Input
                                        placeholder="Örn: 1.250,50"
                                        value={adultPrice}
                                        onChange={(e) => setAdultPrice(e.target.value)}
                                    />
                                </FormControl>
                                <FormControl isRequired>
                                    <FormLabel>Çocuk Katsayısı</FormLabel>
                                    <NumberInput min={0} max={1} step={0.1} value={childDiscount} onChange={(val) => setChildDiscount(val)}>
                                        <NumberInputField placeholder="Örn: 0.7" />
                                        <NumberInputStepper>
                                            <NumberIncrementStepper />
                                            <NumberDecrementStepper />
                                        </NumberInputStepper>
                                    </NumberInput>
                                    <Text fontSize="xs" color="gray.500" mt={1}>
                                        0.7 = %70 Fiyat (Yetişkin fiyatının %70'i)
                                    </Text>
                                </FormControl>
                            </Flex>
                        </ModalBody>

                        <ModalFooter>
                            <Button variant="ghost" mr={3} onClick={onClose}>İptal</Button>
                            <Button colorScheme="brand" onClick={handleSubmit}>Kaydet</Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </Box>
        </Box>
    );
}
