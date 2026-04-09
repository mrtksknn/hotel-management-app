"use client";

import { useEffect, useState } from "react";
import {
    Box,
    Text,
    SimpleGrid,
    Card,
    Spinner,
    useDisclosure,
    useToast,
    Badge,
    Select,
    FormControl,
    FormLabel,
    HStack,
} from "@chakra-ui/react";

import {
    getUsersStats,
    getUsersList,
    User,
    deleteUserFromFirestore,
    addUser,
    updateUser,
} from "@/services/userService";
import { getHotelsByOwner } from "@/services/hotelService";
import { CustomButton } from "@/components";
import DynamicTable from "@/components/common/DynamicTable";
import StatCard from "@/components/common/StatCard";
import { getStatsArray, INITIAL_FORM_STATE } from "./utils";
import UserModal from "./UserModal";
import { useAuth } from "@/hooks/useAuth";

export default function UsersPage() {
    const { user } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [hotels, setHotels] = useState<any[]>([]);
    const [selectedHotelId, setSelectedHotelId] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [form, setForm] = useState(INITIAL_FORM_STATE);
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [mode, setMode] = useState<"add" | "edit">("add");

    // 🔹 Otelleri Yükle
    useEffect(() => {
        const fetchHotels = async () => {
            if (user?.uid) {
                const ownerHotels = await getHotelsByOwner(user.uid);
                setHotels(ownerHotels);
                if (ownerHotels.length > 0 && !selectedHotelId) {
                    setSelectedHotelId(ownerHotels[0].id);
                }
            }
        };
        fetchHotels();
    }, [user]);

    const loadUsers = async () => {
        if (!selectedHotelId) return;
        const data = await getUsersList(selectedHotelId);
        setUsers(data);
    };

    const fetchStats = async () => {
        if (!selectedHotelId) return;
        setStatsLoading(true);
        try {
            const userStats = await getUsersStats(selectedHotelId);
            setStats(userStats);
        } finally {
            setStatsLoading(false);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            if (!selectedHotelId) {
                if (!user?.hotelIds || user.hotelIds.length === 0) {
                    setLoading(false);
                }
                return;
            }

            try {
                setLoading(true);
                await Promise.all([fetchStats(), loadUsers()]);
            } catch (error) {
                console.error("Kullanıcı verileri alınamadı:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [selectedHotelId, user]);

    const refreshUsers = async () => {
        await Promise.all([fetchStats(), loadUsers()]);
    };

    // 🔹 Yeni kullanıcı ekle
    const handleAddUser = async () => {
        if (!selectedHotelId || !user) {
            toast({ title: "Otel bilgisi seçilmedi", status: "error" });
            return;
        }

        try {
            await addUser(form.name, form.email, form.password, form.team, form.title, selectedHotelId, { uid: user.uid, name: user.name });
            toast({ title: "Kullanıcı eklendi", status: "success" });
            refreshUsers();
            onClose();
        } catch (err: any) {
            toast({
                title: "Ekleme hatası",
                description: err.message,
                status: "error",
            });
        }
    };

    // 🔹 Kullanıcı güncelle
    const handleUpdateUser = async () => {
        if (!selectedUser?.id || !user || !selectedHotelId) return;

        try {
            await updateUser(selectedUser.id, {
                name: form.name,
                team: form.team,
                title: form.title,
                hotelIds: [selectedHotelId], // Mevcut seçili otele bağlı kal
            }, { uid: user.uid, name: user.name });

            toast({ title: "Kullanıcı bilgileri güncellendi", status: "info" });
            refreshUsers();
            onClose();
        } catch (err: any) {
            toast({
                title: "Güncelleme hatası",
                description: err.message,
                status: "error",
            });
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!user || !selectedHotelId) return;
        if (confirm("Bu kullanıcıyı silmek istediğine emin misin?")) {
            try {
                await deleteUserFromFirestore(userId, selectedHotelId, { uid: user.uid, name: user.name });
                await refreshUsers();
                toast({ title: "Kullanıcı silindi", status: "success" });
            } catch (err) {
                console.error("Kullanıcı silinirken hata:", err);
            }
        }
    };

    const openEditModal = (user: User) => {
        setSelectedUser(user);
        setForm({
            name: user.name,
            email: user.email,
            password: "",
            team: user.team || "reception",
            title: user.title || "",
            hotel: selectedHotelId,
        });
        setMode("edit");
        onOpen();
    };

    const openAddModal = () => {
        setSelectedUser(null);
        setForm(INITIAL_FORM_STATE);
        setMode("add");
        onOpen();
    };

    if (loading && !selectedHotelId) return <Spinner size="lg" color="blue.500" />;

    const statsArray = getStatsArray(stats);
    const cardCount = statsArray.length;
    let variant: 'normal' | 'compact' | 'veryCompact' = 'normal';
    if (cardCount > 5) variant = 'veryCompact';
    else if (cardCount > 3) variant = 'compact';

    return (
        <Box minH="90vh" display="flex" flexDirection="column" p={6}>
            <Box display="flex" justifyContent="space-between" alignItems="flex-end" w="full" mb={8}>
                <Box>
                    <Text fontSize="2xl" fontWeight="semibold" color="neutral.800">
                        Kullanıcı Yönetimi
                    </Text>
                    <Text fontSize="sm" color="neutral.500" mt={1}>
                        Çalışanların bilgilerini görüntüleyin ve yönetin.
                    </Text>
                </Box>
                
                <HStack spacing={4} align="flex-end">
                    {hotels.length > 1 && (
                        <FormControl w="300px">
                            <FormLabel fontSize="xs" fontWeight="bold" color="neutral.500" mb={1}>YÖNETİLEN İŞLETME</FormLabel>
                            <Select 
                                value={selectedHotelId} 
                                onChange={(e) => setSelectedHotelId(e.target.value)}
                                borderRadius="lg"
                                bg="white"
                                boxShadow="sm"
                                fontWeight="medium"
                            >
                                {hotels.map(h => (
                                    <option key={h.id} value={h.id}>{h.name}</option>
                                ))}
                            </Select>
                        </FormControl>
                    )}
                    <CustomButton bg="brand.500" color="white" _hover={{ bg: "brand.600" }} onClick={openAddModal} h="40px">
                        Yeni Kullanıcı Ekle
                    </CustomButton>
                </HStack>
            </Box>

            {/* İstatistikler */}
            <Box position="relative">
                {statsLoading && <Box position="absolute" top={0} right={0} zIndex={1}><Spinner size="xs" /></Box>}
                <SimpleGrid
                    minChildWidth={statsArray.length > 0 ? (960 / cardCount) : "200px"}
                    spacing={4}
                    mb={6}
                >
                    {statsArray.map((stat) => (
                        <StatCard
                            key={stat.title}
                            title={stat.title}
                            value={stat.count.toString()}
                            subValue="Personel"
                            icon={stat.icon}
                            colorScheme={stat.color}
                            variant={variant}
                        />
                    ))}
                </SimpleGrid>
            </Box>

            {/* Tablo */}
            <Card borderRadius="xl"
                borderColor="neutral.200"
                borderWidth="1px"
                p={5}
                bg="white"
                boxShadow="sm">
                <DynamicTable
                    columns={[
                        { header: "İsim", accessor: "name" },
                        {
                            header: "Unvan / Mevki",
                            render: (u) => <Text fontWeight="medium" color="brand.600">{u.title || "Belirtilmemiş"}</Text>
                        },
                        {
                            header: "Ekip",
                            render: (u: any) => (
                                <Badge colorScheme="purple" variant="subtle" borderRadius="full" px={2} textTransform="capitalize">
                                    {u.team}
                                </Badge>
                            )
                        },
                        { header: "Mail", accessor: "email" },
                        {
                            header: "İşlemler",
                            render: (u: any) => (
                                <Box display="flex" gap={2}>
                                    <CustomButton
                                        variant="outline"
                                        borderColor="brand.500"
                                        color="brand.500"
                                        size="sm"
                                        _hover={{ bg: "brand.50" }}
                                        onClick={() => openEditModal(u)}
                                    >
                                        Güncelle
                                    </CustomButton>
                                    <CustomButton
                                        variant="outline"
                                        borderColor="red.500"
                                        color="red.500"
                                        size="sm"
                                        _hover={{ bg: "red.50" }}
                                        onClick={() => u.id && handleDeleteUser(u.id)}
                                    >
                                        Sil
                                    </CustomButton>
                                </Box>
                            )
                        }
                    ]}
                    data={users}
                />
            </Card>

            {/* Kullanıcı Ekle / Güncelle Modal */}
            <UserModal
                isOpen={isOpen}
                onClose={onClose}
                mode={mode}
                form={form}
                setForm={setForm}
                onSave={mode === "add" ? handleAddUser : handleUpdateUser}
            />
        </Box>
    );
}
