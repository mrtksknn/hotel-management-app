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
} from "@chakra-ui/react";

import {
    getUsersStats,
    getUsersList,
    User,
    deleteUserFromFirestore,
    addUser,
    updateUser,
} from "@/services/userService";
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
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [form, setForm] = useState(INITIAL_FORM_STATE);
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [mode, setMode] = useState<"add" | "edit">("add");

    const loadUsers = async () => {
        const hotelId = user?.hotelIds?.[0];
        const data = await getUsersList(hotelId);
        setUsers(data);
    };

    useEffect(() => {
        const fetchData = async () => {
            if (!user?.hotelIds || user.hotelIds.length === 0) {
                setLoading(false);
                return;
            }

            try {
                const hotelId = user.hotelIds?.[0];
                if (hotelId) {
                    const userStats = await getUsersStats(hotelId);
                    setStats(userStats);
                    const usersData = await getUsersList(hotelId);
                    setUsers(usersData);
                }
            } catch (error) {
                console.error("Kullanıcı verileri alınamadı:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    const refreshUsers = async () => {
        const hotelId = user?.hotelIds?.[0];
        const list = await getUsersList(hotelId);
        setUsers(list);
    };

    // 🔹 Yeni kullanıcı ekle
    const handleAddUser = async () => {
        if (!user || !user.hotelIds || user.hotelIds.length === 0) {
            toast({ title: "Otel bilgisi bulunamadı", status: "error" });
            return;
        }

        try {
            const hotelId = user.hotelIds[0];
            if (!hotelId) throw new Error("Otel ID bulunamadı");
            await addUser(form.name, form.email, form.password, form.team, form.title, hotelId, { uid: user.uid, name: user.name });
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

    // 🔹 Kullanıcı güncelle (Sadece Firestore)
    const handleUpdateUser = async () => {
        if (!selectedUser?.id || !user) return;

        try {
            await updateUser(selectedUser.id, {
                name: form.name,
                team: form.team,
                title: form.title,
                hotelIds: [form.hotel],
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
        if (!user) return;
        if (confirm("Bu kullanıcıyı silmek istediğine emin misin?")) {
            try {
                const hotelId = user.hotelIds?.[0];
                if (!hotelId) return;
                await deleteUserFromFirestore(userId, hotelId, { uid: user.uid, name: user.name });
                await loadUsers();
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
            hotel: user.hotelIds?.[0] || "",
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

    if (loading) return <Spinner size="lg" color="blue.500" />;

    const statsArray = getStatsArray(stats);

    const cardCount = statsArray.length;
    let variant: 'normal' | 'compact' | 'veryCompact' = 'normal';
    if (cardCount > 5) variant = 'veryCompact';
    else if (cardCount > 3) variant = 'compact';

    return (
        <Box minH="90vh" display="flex" flexDirection="column" p={6}>
            <Box display="flex" justifyContent="space-between" alignItems="center" w="full" mb={6}>
                <Box>
                    <Text fontSize="2xl" fontWeight="semibold" color="neutral.800">
                        Kullanıcı Yönetimi
                    </Text>
                    <Text fontSize="sm" color="neutral.500" mt={1}>
                        Çalışanların bilgilerini görüntüleyin ve yönetin.
                    </Text>
                </Box>
                <CustomButton bg="brand.500" color="white" _hover={{ bg: "brand.600" }} onClick={openAddModal}>
                    Yeni Kullanıcı Ekle
                </CustomButton>
            </Box>

            {/* İstatistikler */}
            <SimpleGrid
                minChildWidth={960 / cardCount}
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
                            render: (u) => (
                                <Badge colorScheme="purple" variant="subtle" borderRadius="full" px={2} textTransform="capitalize">
                                    {u.team}
                                </Badge>
                            )
                        },
                        { header: "Mail", accessor: "email" },
                        {
                            header: "İşlemler",
                            render: (user) => (
                                <Box display="flex" gap={2}>
                                    <CustomButton
                                        variant="outline"
                                        borderColor="brand.500"
                                        color="brand.500"
                                        size="sm"
                                        _hover={{ bg: "brand.50" }}
                                        onClick={() => openEditModal(user)}
                                    >
                                        Güncelle
                                    </CustomButton>
                                    <CustomButton
                                        variant="outline"
                                        borderColor="red.500"
                                        color="red.500"
                                        size="sm"
                                        _hover={{ bg: "red.50" }}
                                        onClick={() => user.id && handleDeleteUser(user.id)}
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
