"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
    Stack,
    Text,
    Box,
    Divider,
    Button,
    useToken,
    Spinner,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebaseClient";
import { collection, query, where, getDocs } from "firebase/firestore";
import { LogOut } from "lucide-react";

export default function Sidebar() {
    const router = useRouter();
    const { logout } = useAuth();
    const [gray] = useToken("colors", ["gray"]);

    const [userData, setUserData] = useState<{ name: string; email: string; role: string } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const storedUser = localStorage.getItem("user");
                if (!storedUser) {
                    setLoading(false);
                    return;
                }

                const userObj = JSON.parse(storedUser);
                const email = userObj.email;

                if (!email) {
                    setLoading(false);
                    return;
                }

                const usersRef = collection(db, "users");
                const q = query(usersRef, where("email", "==", email));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    const data = querySnapshot.docs[0].data() as {
                        name: string;
                        email: string;
                        role: string;
                    };
                    setUserData(data);
                }
            } catch (error) {
                console.error("Kullanıcı bilgileri alınamadı:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    // 🔹 İsimden baş harfleri üret
    const getInitials = (fullName: string | undefined) => {
        if (!fullName) return "GH";
        const parts = fullName.trim().split(" ");
        const initials = parts
            .slice(0, 2)
            .map((p) => p.charAt(0).toUpperCase())
            .join("");
        return initials || "GH";
    };

    // 🔹 Menü öğeleri (rol bazlı kontrol burada yapılacak)
    const menuItems = [
        { label: "Anasayfa", path: "/dashboard", roles: ["owner", "user", "employee"] },
        { label: "Rezervasyonlar", path: "/reservations", roles: ["owner", "user", "employee"] },
        { label: "Odalar", path: "/rooms", roles: ["owner", "user", "employee"] },
        { label: "Oda Durumu", path: "/status", roles: ["owner", "user", "employee"] },
        { label: "Giriş-Çıkış", path: "/checkinout", roles: ["owner", "user", "employee"] },
        { label: "Kullanıcılar", path: "/users", roles: ["owner"] },
    ];

    return (
        <Box
            display="flex"
            flexDirection="column"
            justifyContent="space-between"
            height="100vh"
            width="225px"
        >
            {/* Üst Menü */}
            <Stack
                divider={
                    <Divider
                        style={{ borderColor: "#ffffff1a", margin: 0, padding: 0 }}
                    />
                }
            >
                {/* Logo Alanı */}
                <Box
                    px={4}
                    py={3}
                    display="flex"
                    alignItems="center"
                    gap={3}
                    borderBottom="1px solid #ffffff1a"
                >
                    <Box
                        width="2rem"
                        height="2rem"
                        borderRadius="md"
                        bg="#d4af37"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        fontWeight="medium"
                        color="black"
                    >
                        GH
                    </Box>
                    <Box>
                        <Text fontSize="sm" fontWeight="medium">
                            Grand Hotel
                        </Text>
                        <Text fontSize="xs" color={gray}>
                            Management System
                        </Text>
                    </Box>
                </Box>

                {/* Menü */}
                <Box p={3}>
                    <Stack>
                        {menuItems
                            .filter((item) =>
                                userData ? item.roles.includes(userData.role) : false
                            )
                            .map((item) => (
                                <Text
                                    key={item.path}
                                    px={2}
                                    py={3}
                                    cursor="pointer"
                                    borderRadius="md"
                                    fontSize="sm"
                                    _hover={{ background: "#2c3e50" }}
                                    onClick={() => router.push(item.path)}
                                >
                                    {item.label}
                                </Text>
                            ))}
                    </Stack>
                </Box>
            </Stack>

            {/* Kullanıcı Bilgisi + Logout */}
            <Box
                px={4}
                py={3}
                borderTop="1px solid #ffffff1a"
                display="flex"
                flexDirection="row"
                alignItems="center"
                justifyContent="space-between"
            >
                {loading ? (
                    <Spinner size="sm" color="gray.400" />
                ) : userData ? (
                    <Box display="flex" flexDirection="row" alignItems="center" gap={2}>
                        <Box
                            width="2rem"
                            height="2rem"
                            borderRadius="md"
                            bg="#d4af37"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            color="black"
                            fontWeight="medium"
                        >
                            {getInitials(userData.name)}
                        </Box>

                        <Box display="flex" flexDirection="column">
                            <Text fontSize="sm" fontWeight="medium">
                                {userData.name}
                            </Text>
                            <Text fontSize="xs" color={gray}>
                                {userData.role}
                            </Text>
                        </Box>
                    </Box>
                ) : (
                    <Text fontSize="xs" color={gray}>
                        Giriş yapılmadı
                    </Text>
                )}

                <Button
                    borderRadius="md"
                    fontSize="sm"
                    _hover={{ background: "#2c3e50" }}
                    onClick={logout}
                >
                    <LogOut size={16} />
                </Button>
            </Box>
        </Box>
    );
}
