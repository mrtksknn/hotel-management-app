"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import {
  Box, Heading, Text, SimpleGrid, Flex, Button, VStack,
  HStack, Badge, Divider, Icon, Tooltip, useToast
} from "@chakra-ui/react";
import { db } from "@/lib/firebaseClient";
import { doc, getDoc } from "firebase/firestore";
import {
  DollarSign, Users, TrendingUp, CalendarDays, LogOut,
  Star, AlertTriangle, Zap, Plus, CreditCard,
  BedDouble, ClipboardList, ArrowRight, Sparkles,
  Brush, PhoneCall, CheckCircle2, Clock,
} from "lucide-react";
import StatCard from "@/components/common/StatCard";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar,
} from "recharts";
import { subscribeToDashboardStats, DashboardStats } from "@/services/dashboardService";
import { getActivityLogs, ActivityLog } from "@/services/activityService";
import { User as UserIcon, Building, Trash2, Settings, History } from "lucide-react";

// ─── Motion wrappers ─────────────────────────────────────────────
const MotionBox = motion(Box as any);
const MotionFlex = motion(Flex as any);

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: "easeOut" },
});

// ─── Mock Data ────────────────────────────────────────────────────
const revenueData = [
  { name: "Pzt", gelir: 4000 },
  { name: "Sal", gelir: 3000 },
  { name: "Çar", gelir: 5000 },
  { name: "Per", gelir: 2780 },
  { name: "Cum", gelir: 8900 },
  { name: "Cmt", gelir: 12390 },
  { name: "Paz", gelir: 10490 },
];

const occupancyData = [
  { name: "Oca", doluluk: 65 },
  { name: "Şub", doluluk: 59 },
  { name: "Mar", doluluk: 80 },
  { name: "Nis", doluluk: 81 },
  { name: "May", doluluk: 90 },
  { name: "Haz", doluluk: 98 },
];

const vipArrivals = [
  { name: "Ahmet Yılmaz", room: "301 Süit", time: "14:00", note: "Şampanya talebi var", country: "🇹🇷" },
  { name: "Sophie Martin", room: "205 Deluxe", time: "15:30", note: "Erken check-in onaylandı", country: "🇫🇷" },
  { name: "James Wilson", room: "412 Penthouse", time: "17:00", note: "VIP transfer karşılama", country: "🇬🇧" },
];

const urgentRooms = [
  { room: "108", issue: "Temizlik Bekliyor", level: "warning", icon: Brush },
  { room: "215", issue: "Bakım Talebi", level: "error", icon: AlertTriangle },
  { room: "304", issue: "Check-out Gecikmesi", level: "error", icon: Clock },
  { room: "119", issue: "Ekstra Yatak Gerekli", level: "warning", icon: BedDouble },
];

const quickActions = [
  { label: "Yeni Kullanıcı Ekle", icon: Users, color: "cyan", path: "/users" },
  { label: "Destek Talebi Oluştur", icon: PhoneCall, color: "pink", path: "/dashboard" },
];

// ─── Glass card style ─────────────────────────────────────────────
const glassCard = {
  bg: "rgba(255, 255, 255, 0.75)",
  backdropFilter: "blur(16px)",
  border: "1px solid",
  borderColor: "rgba(255,255,255,0.6)",
  borderRadius: "2xl",
  boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
};

// ─── Empty State Component ────────────────────────────────────────
function EmptyStateDashboard({ onAction }: { onAction: (path: string) => void }) {
  const steps = [
    {
      icon: Users, color: "teal", label: "Ekip Üyelerini Davet Et",
      desc: "Resepsiyonist ve yöneticilerini platforma ekle.", path: "/users",
    },
  ];

  return (
    <MotionBox {...fadeUp(0.1)} mb={8}>
      <Box {...glassCard} p={8} textAlign="center" mb={6}>
        <Box
          w="72px" h="72px" mx="auto" mb={4}
          borderRadius="2xl"
          bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          display="flex" alignItems="center" justifyContent="center"
          boxShadow="0 8px 24px rgba(102,126,234,0.35)"
        >
          <Icon as={Sparkles} color="white" boxSize={8} />
        </Box>
        <Heading size="md" color="gray.700" mb={2}>
          HotelCloud'a Hoş Geldiniz! 🎉
        </Heading>
        <Text color="gray.500" maxW="440px" mx="auto" fontSize="sm" mb={6}>
          Henüz veri yok — ama bunu değiştirmek çok kolay. Aşağıdaki adımları tamamlayarak
          panelinizi birkaç dakikada hayata geçirin.
        </Text>
        <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
          {steps.map(({ icon, color, label, desc, path }, i) => (
            <MotionBox key={label} {...fadeUp(0.1 + i * 0.1)}>
              <Box
                p={5} borderRadius="xl" bg={`${color}.50`}
                border="1px solid" borderColor={`${color}.100`}
                cursor="pointer" textAlign="left"
                transition="all 0.25s"
                _hover={{ transform: "translateY(-3px)", boxShadow: "md", bg: `${color}.100` }}
                onClick={() => onAction(path)}
              >
                <Flex align="center" gap={3} mb={2}>
                  <Box
                    w="36px" h="36px" borderRadius="lg"
                    bg={`${color}.500`}
                    display="flex" alignItems="center" justifyContent="center"
                  >
                    <Icon as={icon} color="white" boxSize={4} />
                  </Box>
                  <Badge colorScheme={color} borderRadius="full" fontSize="10px">Adım {i + 1}</Badge>
                </Flex>
                <Text fontWeight="semibold" color="gray.700" fontSize="sm" mb={1}>{label}</Text>
                <Text color="gray.500" fontSize="xs">{desc}</Text>
              </Box>
            </MotionBox>
          ))}
        </SimpleGrid>
      </Box>
    </MotionBox>
  );
}

// ─── Main Page ────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const toast = useToast();
  // Simulated: eğer hiç rezervasyon yoksa true
  const [isEmpty] = useState(false);

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeHotelName, setActiveHotelName] = useState<string>("");

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    const fetchHotelInfo = async () => {
      if (user.hotelIds && user.hotelIds.length > 0) {
        const hotelId = user.hotelIds[0];

        // 🔹 Otel adını getir
        const hotelRef = doc(db, "hotels", hotelId);
        const hotelSnap = await getDoc(hotelRef);
        if (hotelSnap.exists()) {
          setActiveHotelName(hotelSnap.data().name);
        }

        // 🔹 İstatistiklere abone ol
        const unsubscribe = subscribeToDashboardStats(hotelId, (newStats) => {
          setStats(newStats);
          setLoading(false);
        });

        // 🔹 Aktivite loglarını getir (En son 5 log)
        const latestLogs = await getActivityLogs(hotelId, 5);
        setLogs(latestLogs);

        return unsubscribe;
      }
      setLoading(false);
    };

    let unsubscribeStats: (() => void) | undefined;
    fetchHotelInfo().then(unsub => {
      unsubscribeStats = unsub;
    });

    return () => {
      if (unsubscribeStats) unsubscribeStats();
    };
  }, [user, router]);

  if (!user) return null;

  const hasData = !isEmpty;

  return (
    <Box minH="100vh" bg="gray.50" p={{ base: 4, md: 8 }}>

      {/* ── Header ── */}
      <MotionFlex {...fadeUp(0)} justify="space-between" align="center" mb={6} flexWrap="wrap" gap={3}>
        <Box>
          <Heading size="lg" color="gray.800" fontWeight="bold">
            Genel Bakış
          </Heading>
          <Text color="gray.500" mt={0.5} fontSize="sm">
            {activeHotelName ? `${activeHotelName} — ` : ""}
            {new Date().toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </Text>
        </Box>
        <HStack spacing={3}>

          <Button
            leftIcon={<LogOut size={16} />}
            colorScheme="red"
            variant="outline"
            onClick={logout}
            borderRadius="full"
            size="sm"
          >
            Çıkış Yap
          </Button>
        </HStack>
      </MotionFlex>

      {/* ── Trial Banner ── */}
      <AnimatePresence>
        {user.subscriptionPlan === "trial" && (
          <MotionBox
            key="trial"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            mb={6}
            p={4}
            bg="linear-gradient(90deg, #fff5f5 0%, #ffe4e4 100%)"
            borderLeft="4px solid"
            borderColor="red.400"
            borderRadius="xl"
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            boxShadow="0 2px 12px rgba(229,62,62,0.08)"
            flexWrap="wrap"
            gap={3}
          >
            <HStack gap={2}>
              <Icon as={AlertTriangle} color="red.500" boxSize={5} />
              <Box>
                <Text fontWeight="bold" color="red.700" fontSize="sm">Deneme Sürümündesiniz</Text>
                <Text color="red.600" fontSize="xs">
                  Tüm özelliklere erişmeye devam etmek için planınızı yükseltin.
                </Text>
              </Box>
            </HStack>
            <Button
              colorScheme="red"
              size="sm"
              borderRadius="full"
              leftIcon={<Icon as={Zap} boxSize={3} />}
              onClick={() => alert("Ödeme sayfasına yönlendirilecek")}
            >
              Hemen Yükselt
            </Button>
          </MotionBox>
        )}
      </AnimatePresence>

      {/* ── Empty State ── */}
      {!hasData && <EmptyStateDashboard onAction={(p) => router.push(p)} />}

      {/* ── KPI Stat Cards ── */}
      <MotionBox {...fadeUp(0.05)}>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={5} mb={6}>
          <StatCard
            title="Bugünkü Tahmini Gelir"
            value={`₺${stats?.todayRevenue.toLocaleString("tr-TR") || "0"}`}
            subValue="Günlük konaklama ortalaması"
            icon={DollarSign}
            colorScheme="green"
          />
          <StatCard
            title="Aktif Konuk"
            value={stats?.activeGuests.toString() || "0"}
            subValue="Şu an otelde olan"
            icon={Users}
            colorScheme="blue"
          />
          <StatCard
            title="Doluluk Oranı"
            value={`%${stats?.occupancyRate.toString() || "0"}`}
            subValue="Tüm odalara göre"
            icon={TrendingUp}
            colorScheme="purple"
          />
          <StatCard
            title="Bekleyen Giriş"
            value={stats?.pendingCheckIns.toString() || "0"}
            subValue="Bugün beklenen check-in"
            icon={CalendarDays}
            colorScheme="orange"
          />
        </SimpleGrid>
      </MotionBox>

      {/* ── Quick Actions ── */}
      <MotionBox {...fadeUp(0.1)} mb={6}>
        <Flex align="center" gap={2} mb={3}>
          <Icon as={Zap} color="blue.500" boxSize={4} />
          <Text fontWeight="bold" color="gray.700" fontSize="sm">Hızlı İşlemler</Text>
        </Flex>
        <SimpleGrid columns={{ base: 2, sm: 3, md: 6 }} gap={3}>
          {quickActions.map(({ label, icon, color, path }) => (
            <Tooltip key={label} label={label} placement="top" hasArrow>
              <Box
                {...glassCard}
                p={4}
                cursor="pointer"
                textAlign="center"
                transition="all 0.25s"
                _hover={{ transform: "translateY(-4px)", boxShadow: "md", borderColor: `${color}.200` }}
                onClick={() => router.push(path)}
              >
                <Box
                  w="40px" h="40px" mx="auto" mb={2} borderRadius="xl"
                  bg={`${color}.50`} border="1px solid" borderColor={`${color}.100`}
                  display="flex" alignItems="center" justifyContent="center"
                >
                  <Icon as={icon} color={`${color}.500`} boxSize={5} />
                </Box>
                <Text fontSize="11px" fontWeight="semibold" color="gray.600" lineHeight="short">{label}</Text>
              </Box>
            </Tooltip>
          ))}
        </SimpleGrid>
      </MotionBox>

      {/* ── Charts ── */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>

        {/* Revenue Area Chart */}
        <MotionBox {...fadeUp(0.25)}>
          <Box {...glassCard} p={6}>
            <Flex justify="space-between" align="center" mb={4}>
              <Box>
                <Text fontSize="md" fontWeight="bold" color="gray.700">Haftalık Gelir Trendi</Text>
                <Text fontSize="xs" color="gray.500">Son 7 gün içerisindeki net gelir akışı</Text>
              </Box>
              <Badge colorScheme="green" borderRadius="full" px={3} py={1} fontSize="xs">
                ↑ +23% bu hafta
              </Badge>
            </Flex>
            <Box h="260px" w="100%">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorGelir" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3182ce" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3182ce" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#718096", fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#718096", fontSize: 12 }} />
                  <RechartsTooltip
                    contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
                    formatter={(value: any) => [`₺${value.toLocaleString("tr-TR")}`, "Gelir"]}
                  />
                  <Area type="monotone" dataKey="gelir" stroke="#3182ce" strokeWidth={2.5} fillOpacity={1} fill="url(#colorGelir)" dot={{ fill: "#3182ce", r: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        </MotionBox>

        {/* Occupancy Bar Chart */}
        <MotionBox {...fadeUp(0.3)}>
          <Box {...glassCard} p={6}>
            <Flex justify="space-between" align="center" mb={4}>
              <Box>
                <Text fontSize="md" fontWeight="bold" color="gray.700">Aylık Doluluk Oranları</Text>
                <Text fontSize="xs" color="gray.500">Oda kapasitesinin aylara göre kullanım yüzdesi</Text>
              </Box>
              <Badge colorScheme="purple" borderRadius="full" px={3} py={1} fontSize="xs">
                Ort. %79
              </Badge>
            </Flex>
            <Box h="260px" w="100%">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={occupancyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#718096", fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#718096", fontSize: 12 }} />
                  <RechartsTooltip
                    cursor={{ fill: "rgba(0,0,0,0.03)" }}
                    contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
                    formatter={(value: any) => [`%${value}`, "Doluluk"]}
                  />
                  <Bar dataKey="doluluk" fill="#805ad5" radius={[6, 6, 0, 0]} barSize={36} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        </MotionBox>
      </SimpleGrid>

      {/* ── Activity History ── */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        <MotionBox {...fadeUp(0.35)} mt={8}>
          <Box {...glassCard} p={6}>
            <Flex align="center" justify="space-between" mb={4}>
              <HStack gap={2}>
                <Icon as={History} color="brand.500" boxSize={5} />
                <Text fontSize="md" fontWeight="bold" color="gray.700">Son Aktiviteler (En Son 5)</Text>
              </HStack>
              <Button
                size="sm"
                variant="ghost"
                colorScheme="brand"
                rightIcon={<ArrowRight size={14} />}
                onClick={() => router.push("/activities")}
              >
                Tümünü Gör
              </Button>
            </Flex>
            <VStack align="stretch" spacing={3}>
              {logs.length === 0 ? (
                <Text fontSize="sm" color="gray.500" py={4} textAlign="center">Henüz bir aktivite gerçekleşmedi.</Text>
              ) : (
                logs.map((log) => (
                  <Flex key={log.id} align="center" justify="space-between" p={3} borderRadius="xl" bg="gray.50" _hover={{ bg: "gray.100" }} transition="0.2s">
                    <HStack spacing={3}>
                      <Box
                        bg={
                          log.action.includes('USER') ? "blue.100" :
                            log.action.includes('HOTEL') ? "orange.100" : "gray.100"
                        }
                        p={2}
                        borderRadius="lg"
                      >
                        <Icon
                          as={
                            log.action === 'CREATE_USER' ? UserIcon :
                              log.action === 'DELETE_USER' ? Trash2 :
                                log.action === 'UPDATE_USER' ? Settings :
                                  log.action.includes('HOTEL') ? Building : History
                          }
                          color={
                            log.action.includes('USER') ? "blue.600" :
                              log.action.includes('HOTEL') ? "orange.600" : "gray.600"
                          }
                          boxSize={4}
                        />
                      </Box>
                      <Box>
                        <Text fontSize="xs" color="gray.500" fontWeight="medium">{log.userName}</Text>
                        <Text fontSize="sm" color="gray.700" fontWeight="medium">{log.description}</Text>
                      </Box>
                    </HStack>
                    <Text fontSize="xs" color="gray.400">
                      {log.timestamp ? new Date(log.timestamp.toDate()).toLocaleTimeString("tr-TR", { hour: '2-digit', minute: '2-digit' }) : "-"}
                    </Text>
                  </Flex>
                ))
              )}
            </VStack>
          </Box>
        </MotionBox>
      </SimpleGrid>


      {/* ── Footer CTA for low-data state ── */}
      {hasData && (
        <MotionBox {...fadeUp(0.35)} mt={6}>
          <Box
            p={5} borderRadius="2xl"
            bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            boxShadow="0 8px 32px rgba(102,126,234,0.3)"
          >
            <Flex align="center" justify="space-between" flexWrap="wrap" gap={4}>
              <HStack gap={3}>
                <Box
                  w="44px" h="44px" borderRadius="xl"
                  bg="whiteAlpha.200"
                  display="flex" alignItems="center" justifyContent="center"
                >
                  <Icon as={ClipboardList} color="white" boxSize={5} />
                </Box>
                <Box>
                  <Text fontWeight="bold" color="white" fontSize="sm">Günlük Operasyon Raporunu İndir</Text>
                  <Text color="whiteAlpha.700" fontSize="xs">Bugünkü tüm işlemler PDF olarak hazır.</Text>
                </Box>
              </HStack>
              <Button
                size="sm" bg="white" color="purple.700"
                borderRadius="full" fontWeight="bold"
                _hover={{ bg: "purple.50" }}
                leftIcon={<Icon as={CheckCircle2} boxSize={4} />}
              >
                Raporu İndir
              </Button>
            </Flex>
          </Box>
        </MotionBox>
      )}
    </Box>
  );
}
