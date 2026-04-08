"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
    Stack,
    Text,
    Box,
    Button,
    useToken,
    Spinner,
} from "@chakra-ui/react";
import { useRouter, usePathname } from "next/navigation";
import { db } from "@/lib/firebaseClient";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { LogOut, ChevronDown, ChevronUp } from "lucide-react";

export default function Sidebar() {
    const router = useRouter();
    const pathname = usePathname();
    const { logout } = useAuth();
    const [gray] = useToken("colors", ["gray"]);

    const [userData, setUserData] = useState<{ name: string; email: string; role: string; team: string; title: string; hotelIds: string[] } | null>(null);
    const [activeHotelName, setActiveHotelName] = useState<string>("");
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
                        team: string;
                        title: string;
                        hotelIds: string[];
                    };
                    setUserData(data);

                    // İlk otelin ismini çek
                    if (data.hotelIds && data.hotelIds.length > 0) {
                        const hotelRef = doc(db, "hotels", data.hotelIds[0]);
                        const hotelSnap = await getDoc(hotelRef);
                        if (hotelSnap.exists()) {
                            setActiveHotelName(hotelSnap.data().name);
                        }
                    }
                }
            } catch (error) {
                console.error("Kullanıcı veya otel bilgileri alınamadı:", error);
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
        { label: "Anasayfa", path: "/dashboard", allowedTeams: ["owner", "management", "reception", "housekeeping", "kitchen", "technical"] },
        { label: "Oteller", path: "/hotels", allowedTeams: ["owner"] },
        { label: "Kullanıcılar", path: "/users", allowedTeams: ["owner"] },
    ];

    return (
        <Box
            display="flex"
            flexDirection="column"
            justifyContent="space-between"
            height="100vh"
            width="260px"
            bg="white"
            borderRight="1px solid"
            borderColor="neutral.200"
            boxShadow="sm"
        >
            {/* Üst Menü */}
            <Stack spacing={0}>
                {/* Logo Alanı */}
                <Box
                    px={5}
                    py={5}
                    display="flex"
                    alignItems="center"
                    gap={3}
                    borderBottom="1px solid"
                    borderColor="neutral.100"
                >
                        <Box
                        width="2.5rem"
                        height="2.5rem"
                        borderRadius="lg"
                        bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        fontWeight="bold"
                        color="white"
                        fontSize="md"
                        boxShadow="soft"
                    >
                        {getInitials(activeHotelName)}
                    </Box>
                    <Box>
                        <Text fontSize="md" fontWeight="semibold" color="neutral.800">
                            {activeHotelName}
                        </Text>
                        <Text fontSize="xs" color="neutral.500">
                            Management System
                        </Text>
                    </Box>
                </Box>

                {/* Menü */}
                <Box p={4}>
                    <Stack spacing={1}>
                        {menuItems
                            .filter((item) =>
                                userData ? item.allowedTeams.includes(userData.team || userData.role) : false
                            )
                            .map((item) => {
                                const isMainActive = pathname === item.path;

                                return (
                                    <Box key={item.label}>
                                        <Box
                                            px={4}
                                            py={3}
                                            cursor="pointer"
                                            borderRadius="lg"
                                            fontSize="sm"
                                            fontWeight="bold"
                                            color={isMainActive ? "brand.600" : "neutral.700"}
                                            bg={isMainActive ? "brand.50" : "transparent"}
                                            transition="all 0.2s ease-in-out"
                                            display="flex"
                                            justifyContent="space-between"
                                            alignItems="center"
                                            _hover={{
                                                bg: "brand.50",
                                                color: "brand.600",
                                                transform: "translateX(4px)"
                                            }}
                                            onClick={() => {
                                                if (item.path) {
                                                    router.push(item.path);
                                                }
                                            }}
                                        >
                                            <Text>{item.label}</Text>
                                        </Box>
                                    </Box>
                                );
                            })}
                    </Stack>
                </Box>
            </Stack>

            {/* Kullanıcı Bilgisi + Logout */}
            <Box
                px={4}
                py={4}
                borderTop="1px solid"
                borderColor="neutral.100"
                display="flex"
                flexDirection="row"
                alignItems="center"
                justifyContent="space-between"
                bg="neutral.50"
            >
                {loading ? (
                    <Spinner size="sm" color="brand.500" />
                ) : userData ? (
                    <Box display="flex" flexDirection="row" alignItems="center" gap={3}>
                        <Box
                            width="2.5rem"
                            height="2.5rem"
                            borderRadius="lg"
                            bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            color="white"
                            fontWeight="semibold"
                            fontSize="sm"
                            boxShadow="soft"
                        >
                            {getInitials(userData.name)}
                        </Box>

                        <Box display="flex" flexDirection="column">
                            <Text fontSize="sm" fontWeight="semibold" color="neutral.800">
                                {userData.name}
                            </Text>
                            <Text fontSize="xs" color="neutral.500">
                                {userData.title || userData.role}
                            </Text>
                        </Box>
                    </Box>
                ) : (
                    <Text fontSize="xs" color="neutral.500">
                        Giriş yapılmadı
                    </Text>
                )}

                <Button
                    size="sm"
                    variant="ghost"
                    colorScheme="red"
                    borderRadius="lg"
                    _hover={{ bg: "red.50" }}
                    onClick={logout}
                >
                    <LogOut size={18} />
                </Button>
            </Box>
        </Box>
    );
}
