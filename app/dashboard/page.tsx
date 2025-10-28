"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { Box, Heading, Text, Button } from "@chakra-ui/react";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  if (!user) return null;

  return (
    <Box p={8}>
      <Heading mb={4}>Dashboard</Heading>
      <Text>Hoş geldiniz {user.email}!</Text>

      <Box mt={6}>
        <Button colorScheme="red" onClick={logout}>
          Çıkış Yap
        </Button>
      </Box>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="p-4 bg-white shadow rounded">📊 İstatistikler</div>
        <div className="p-4 bg-white shadow rounded">📅 Etkinlikler</div>
        <div className="p-4 bg-white shadow rounded">💬 Bildirimler</div>
      </div>
    </Box>
  );
}
