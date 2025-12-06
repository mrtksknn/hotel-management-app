"use client";

import { Box, Text, Button, Icon, useDisclosure, Spinner, IconButton, useToast } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Plus, Trash2, Building2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getOwners, deleteOwner, HotelOwner } from "@/services/hotelOwnersService";
import DynamicTable from "@/components/common/DynamicTable";
import AddOwnerModal from "./AddOwnerModal";
import { useRouter } from "next/navigation";

export default function OtellerPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [owners, setOwners] = useState<HotelOwner[]>([]);
    const [loading, setLoading] = useState(true);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();

    // Sadece sistem-admin erişebilir
    useEffect(() => {
        if (user && user.role !== "sistem-admin") {
            toast({
                title: "Yetkisiz Erişim",
                description: "Bu sayfaya erişim yetkiniz yok",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            router.push("/");
        }
    }, [user, router, toast]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await getOwners();
            setOwners(data);
        } catch (error) {
            console.error("Otel sahipleri yüklenirken hata:", error);
            toast({
                title: "Veriler yüklenemedi",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.role === "sistem-admin") {
            fetchData();
        }
    }, [user]);

    const handleDelete = async (id: string) => {
        if (!confirm("Bu otel sahibini silmek istediğinizden emin misiniz?")) {
            return;
        }

        try {
            await deleteOwner(id);
            toast({
                title: "Otel sahibi silindi",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            fetchData();
        } catch (error) {
            toast({
                title: "Silme işlemi başarısız",
                description: error instanceof Error ? error.message : "Bilinmeyen hata",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    // Sadece sistem-admin görebilir
    if (!user || user.role !== "sistem-admin") {
        return (
            <Box minH="100vh" display="flex" alignItems="center" justifyContent="center">
                <Spinner size="xl" color="brand.500" />
            </Box>
        );
    }

    if (loading) {
        return (
            <Box minH="100vh" display="flex" alignItems="center" justifyContent="center">
                <Spinner size="xl" color="brand.500" />
            </Box>
        );
    }

    return (
        <Box h="100vh" display="flex" flexDirection="column" p={6} bg="gray.50" overflow="hidden">
            {/* Header */}
            <Box flex="0 0 auto" display="flex" alignItems="center" justifyContent="space-between" mb={6}>
                <Box>
                    <Text fontSize="2xl" fontWeight="semibold" color="neutral.800">Otel Yönetimi</Text>
                    <Text fontSize="md" color="neutral.500" mt={2}>
                        Tüm otel sahiplerini buradan yönetebilirsiniz
                    </Text>
                </Box>
                <Button
                    leftIcon={<Icon as={Plus} />}
                    colorScheme="brand"
                    onClick={onOpen}
                    size="md"
                    borderRadius="xl"
                    fontWeight="semibold"
                >
                    Yeni Otel Sahibi Ekle
                </Button>
            </Box>

            {/* Table */}
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
                        <DynamicTable
                            columns={[
                                {
                                    header: "OTEL ADI",
                                    accessor: "hotel",
                                    render: (row) => (
                                        <Box display="flex" alignItems="center" gap={2}>
                                            <Icon as={Building2} size={18} color="brand.500" />
                                            <Text fontWeight="semibold" color="neutral.800">{row.hotel}</Text>
                                        </Box>
                                    )
                                },
                                {
                                    header: "SAHİBİ",
                                    accessor: "name",
                                    render: (row) => (
                                        <Text fontWeight="medium" color="neutral.700">{row.name}</Text>
                                    )
                                },
                                {
                                    header: "E-POSTA",
                                    accessor: "email",
                                    render: (row) => (
                                        <Text color="neutral.600">{row.email}</Text>
                                    )
                                },
                                {
                                    header: "ROL",
                                    accessor: "role",
                                    render: (row) => (
                                        <Text
                                            px={3}
                                            py={1}
                                            bg="brand.50"
                                            color="brand.700"
                                            borderRadius="md"
                                            fontSize="sm"
                                            fontWeight="semibold"
                                            display="inline-block"
                                        >
                                            {row.role}
                                        </Text>
                                    )
                                },
                                {
                                    header: "İŞLEM",
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
                            data={owners}
                        />
                    )}
                </Box>
            </Box>

            <AddOwnerModal
                isOpen={isOpen}
                onClose={onClose}
                onSuccess={fetchData}
            />
        </Box>
    );
}
