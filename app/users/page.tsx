"use client";

import { useEffect, useState } from "react";
import {
    Box,
    Text,
    SimpleGrid,
    Card,
    Spinner,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
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
            await addUser(form.name, form.email, form.password, form.role);
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
        });
        setMode("edit");
        onOpen();
    };

    const openAddModal = () => {
        setSelectedUser(null);
        setForm({ name: "", email: "", password: "", role: "staff" });
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
        <Box minH="90vh" display="flex" flexDirection="column">
            <Text fontSize="lg" fontWeight="medium">
                Kullanıcı Yönetimi
            </Text>
            <Text fontSize="sm" color="#6c757d" mb={6}>
                Çalışanları ve rolleri yönetin.
            </Text>

            {/* İstatistikler */}
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={3} mb={4}>
                {statsArray.map((stat) => (
                    <Card
                        key={stat.title}
                        borderRadius="lg"
                        borderColor="#1e25321f"
                        borderWidth="1px"
                        p={4}
                    >
                        <Text fontSize="sm" fontWeight="medium">
                            {stat.title}
                        </Text>
                        <Text>{stat.count}</Text>
                    </Card>
                ))}
            </SimpleGrid>

            {/* Tablo */}
            <Box borderWidth="1px" borderColor="#1e25321f" rounded="md" overflow="auto" p={4}>
                <Box mb={4} display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                        <Text fontSize="md" fontWeight="medium">
                            Tüm Kullanıcılar
                        </Text>
                        <Text fontSize="sm" color="#6c757d">
                            Çalışanların bilgilerini görüntüleyin ve yönetin.
                        </Text>
                    </Box>

                    <CustomButton bg="#1e2532" color="#fff" onClick={openAddModal}>
                        Yeni Kullanıcı Ekle
                    </CustomButton>
                </Box>

                <Table variant="simple" size="md">
                    <Thead bg="#f8f9fa">
                        <Tr>
                            <Th>İsim</Th>
                            <Th>Mail</Th>
                            <Th>Rol</Th>
                            <Th>İşlemler</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {users.map((user) => (
                            <Tr key={user.id}>
                                <Td>{user.name}</Td>
                                <Td>{user.email}</Td>
                                <Td textTransform="capitalize">{user.role}</Td>
                                <Td>
                                    <Box display="flex" gap={2}>
                                        <CustomButton
                                            variant="outline"
                                            borderColor="#007bff"
                                            color="#007bff"
                                            size="sm"
                                            onClick={() => openEditModal(user)}
                                        >
                                            Güncelle
                                        </CustomButton>
                                        <CustomButton
                                            variant="outline"
                                            borderColor="#dc3545"
                                            color="#dc3545"
                                            size="sm"
                                            onClick={() => user.id && handleDeleteUser(user.id)}
                                        >
                                            Sil
                                        </CustomButton>
                                    </Box>
                                </Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            </Box>

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
                    </ModalBody>

                    <ModalFooter display="flex" gap={2}>
                        <CustomButton onClick={onClose}>Vazgeç</CustomButton>
                        <CustomButton
                            bg="#1e2532"
                            color="#fff"
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
