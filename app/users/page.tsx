"use client";

import { useEffect, useState } from "react";
import {
    Box,
    Text,
    SimpleGrid,
    Card,
    Spinner,
    useDisclosure,
    Input,
    Select,
    useToast,
} from "@chakra-ui/react";

import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
} from "@chakra-ui/react/modal";

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

export default function UsersPage() {
    const [stats, setStats] = useState<any>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        role: "staff",
        hotel: "",
    });
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [mode, setMode] = useState<"add" | "edit">("add");

    const loadUsers = async () => {
        const data = await getUsersList();
        setUsers(data);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userStats = await getUsersStats();
                setStats(userStats);
                const usersData = await getUsersList();
                setUsers(usersData);
            } catch (error) {
                console.error("Kullanıcı verileri alınamadı:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const refreshUsers = async () => {
        const list = await getUsersList();
        setUsers(list);
    };

    // 🔹 Yeni kullanıcı ekle
    const handleAddUser = async () => {
        try {
            await addUser(form.name, form.email, form.password, form.role, form.hotel);
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
        if (!selectedUser?.id) return;

        try {
            await updateUser(selectedUser.id, {
                name: form.name,
                role: form.role,
                hotel: form.hotel,
            });

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
        if (confirm("Bu kullanıcıyı silmek istediğine emin misin?")) {
            try {
                await deleteUserFromFirestore(userId);
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
            role: user.role,
            hotel: user.hotel || "",
        });
        setMode("edit");
        onOpen();
    };

    const openAddModal = () => {
        setSelectedUser(null);
        setForm({ name: "", email: "", password: "", role: "staff", hotel: "" });
        setMode("add");
        onOpen();
    };

    if (loading) return <Spinner size="lg" color="blue.500" />;

    const statsArray = [
        { title: "Total Staffs", count: stats?.totalStaffs || 0 },
        { title: "Managers", count: stats?.managers || 0 },
        { title: "Receptionists", count: stats?.receptionists || 0 },
        { title: "Housekeepers", count: stats?.housekeepers || 0 },
    ];

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
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={4} mb={6}>
                {statsArray.map((stat) => (
                    <Card
                        key={stat.title}
                        borderRadius="xl"
                        borderColor="neutral.200"
                        borderWidth="1px"
                        p={5}
                        bg="white"
                        boxShadow="sm"
                        transition="all 0.2s ease-in-out"
                        _hover={{ boxShadow: "md", transform: "translateY(-2px)" }}
                    >
                        <Text fontSize="sm" fontWeight="medium" color="neutral.600" mb={2}>
                            {stat.title}
                        </Text>
                        <Text fontSize="2xl" fontWeight="bold" color="brand.600">{stat.count}</Text>
                    </Card>
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
                        { header: "Mail", accessor: "email" },
                        {
                            header: "Rol",
                            accessor: "role",
                            render: (user) => <Text textTransform="capitalize">{user.role}</Text>
                        },
                        { header: "Otel", accessor: "hotel" },
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
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>
                        {mode === "add" ? "Yeni Kullanıcı Ekle" : "Kullanıcıyı Güncelle"}
                    </ModalHeader>
                    <ModalBody display="flex" flexDirection="column" gap={3}>
                        <Input
                            placeholder="İsim"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                        />
                        <Input
                            placeholder="Email"
                            value={form.email}
                            isReadOnly={mode === "edit"} // 🔒 Güncellemede e-posta değiştirilemez
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                        />
                        {mode === "add" && (
                            <Input
                                placeholder="Şifre"
                                type="password"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                            />
                        )}
                        <Select
                            value={form.role}
                            onChange={(e) => setForm({ ...form, role: e.target.value })}
                        >
                            <option value="manager">Manager</option>
                            <option value="receptionist">Receptionist</option>
                            <option value="housekeeper">Housekeeper</option>
                            <option value="staff">Staff</option>
                        </Select>
                        <Input
                            placeholder="Otel Adı"
                            value={form.hotel}
                            onChange={(e) => setForm({ ...form, hotel: e.target.value })}
                        />
                    </ModalBody>

                    <ModalFooter display="flex" gap={2}>
                        <CustomButton variant="ghost" onClick={onClose}>Vazgeç</CustomButton>
                        <CustomButton
                            bg="brand.500"
                            color="white"
                            _hover={{ bg: "brand.600" }}
                            onClick={mode === "add" ? handleAddUser : handleUpdateUser}
                        >
                            {mode === "add" ? "Ekle" : "Güncelle"}
                        </CustomButton>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
}
