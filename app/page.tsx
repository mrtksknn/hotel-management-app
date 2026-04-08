"use client";

import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Text,
  SimpleGrid,
  Icon,
  VStack,
  HStack,
  Badge,
  List,
  ListItem,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import {
  CalendarCheck,
  LayoutDashboard,
  ShieldCheck,
  Check,
  Building,
  TrendingUp,
  Users,
  BedDouble,
  Star,
  ChevronRight,
  RefreshCw,
  Loader2
} from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { useToast } from "@chakra-ui/react";

// ──────────────────────────────────────────────
// Motion helpers
// ──────────────────────────────────────────────
const MotionBox = motion(Box as any);
const MotionFlex = motion(Flex as any);
const MotionVStack = motion(VStack as any);

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease: "easeOut" },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
};

function RevealSection({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <MotionBox
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={stagger}
    >
      {children}
    </MotionBox>
  );
}

// ──────────────────────────────────────────────
// Inline Dashboard Mockup (SVG-based)
// ──────────────────────────────────────────────
function DashboardMockup() {
  return (
    <Box
      w="full"
      maxW="900px"
      mx="auto"
      mt={{ base: 12, md: 16 }}
      borderRadius="2xl"
      overflow="hidden"
      boxShadow="0 40px 120px rgba(0,0,0,0.5)"
      border="1px solid rgba(255,255,255,0.15)"
      position="relative"
      bg="#0f172a"
    >
      {/* Browser chrome bar */}
      <Flex
        align="center"
        px={4}
        py={3}
        bg="#1e293b"
        borderBottom="1px solid rgba(255,255,255,0.08)"
        gap={2}
      >
        <Box w="12px" h="12px" borderRadius="full" bg="#ff5f57" />
        <Box w="12px" h="12px" borderRadius="full" bg="#ffbd2e" />
        <Box w="12px" h="12px" borderRadius="full" bg="#28ca41" />
        <Box
          flex={1}
          mx={4}
          h="24px"
          borderRadius="md"
          bg="#0f172a"
          display="flex"
          alignItems="center"
          px={3}
        >
          <Text fontSize="11px" color="whiteAlpha.400">
            app.hotelcloud.io/dashboard
          </Text>
        </Box>
      </Flex>

      {/* App layout */}
      <Flex h={{ base: "340px", md: "420px" }}>
        {/* Sidebar */}
        <Box
          w={{ base: "52px", md: "200px" }}
          bg="#1e293b"
          borderRight="1px solid rgba(255,255,255,0.06)"
          py={4}
          px={{ base: 2, md: 4 }}
          flexShrink={0}
        >
          <HStack mb={6} px={1} display={{ base: "none", md: "flex" }}>
            <Icon as={Building} color="blue.400" boxSize={5} />
            <Text fontWeight="bold" color="white" fontSize="sm">
              HotelCloud
            </Text>
          </HStack>
          {[
            { icon: LayoutDashboard, label: "Dashboard", active: true },
            { icon: CalendarCheck, label: "Rezervasyonlar" },
            { icon: BedDouble, label: "Odalar" },
            { icon: Users, label: "Misafirler" },
            { icon: TrendingUp, label: "Finans" },
          ].map(({ icon, label, active }) => (
            <Flex
              key={label}
              align="center"
              gap={3}
              px={2}
              py={2}
              mb={1}
              borderRadius="lg"
              bg={active ? "blue.600" : "transparent"}
              cursor="pointer"
            >
              <Icon as={icon} color={active ? "white" : "whiteAlpha.500"} boxSize={4} />
              <Text
                fontSize="12px"
                color={active ? "white" : "whiteAlpha.500"}
                display={{ base: "none", md: "block" }}
                fontWeight={active ? "semibold" : "normal"}
              >
                {label}
              </Text>
            </Flex>
          ))}
        </Box>

        {/* Main content */}
        <Box flex={1} p={{ base: 3, md: 5 }} overflow="hidden">
          {/* KPI cards */}
          <SimpleGrid columns={{ base: 2, md: 4 }} gap={{ base: 2, md: 4 }} mb={4}>
            {[
              { label: "Doluluk Oranı", value: "%87", color: "#3b82f6", arrow: "+3%" },
              { label: "Günlük Gelir", value: "₺24.5K", color: "#10b981", arrow: "+12%" },
              { label: "Aktif Misafir", value: "43", color: "#8b5cf6", arrow: "+5" },
              { label: "Ort. Puan", value: "4.8 ★", color: "#f59e0b", arrow: "+0.2" },
            ].map(({ label, value, color, arrow }) => (
              <Box
                key={label}
                bg="#1e293b"
                borderRadius="xl"
                p={{ base: 2, md: 3 }}
                border="1px solid rgba(255,255,255,0.06)"
              >
                <Text fontSize={{ base: "9px", md: "10px" }} color="whiteAlpha.500" mb={1}>
                  {label}
                </Text>
                <Text fontSize={{ base: "14px", md: "18px" }} fontWeight="bold" color={color}>
                  {value}
                </Text>
                <Text fontSize="9px" color="#10b981" mt={1}>
                  ↑ {arrow}
                </Text>
              </Box>
            ))}
          </SimpleGrid>

          {/* Chart area + Kanban */}
          <Flex gap={4} h="calc(100% - 80px)">
            {/* Mini chart */}
            <Box
              flex={2}
              bg="#1e293b"
              borderRadius="xl"
              p={3}
              border="1px solid rgba(255,255,255,0.06)"
              overflow="hidden"
            >
              <Text fontSize="10px" color="whiteAlpha.500" mb={2}>
                Aylık Gelir Trendi
              </Text>
              <svg viewBox="0 0 260 100" width="100%" height="80%">
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,80 C20,70 40,60 60,55 C80,50 100,65 120,45 C140,25 160,35 180,20 C200,10 220,18 240,12 L260,8 L260,100 L0,100 Z"
                  fill="url(#chartGrad)"
                />
                <path
                  d="M0,80 C20,70 40,60 60,55 C80,50 100,65 120,45 C140,25 160,35 180,20 C200,10 220,18 240,12 L260,8"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2"
                />
                {[0, 52, 104, 156, 208, 260].map((x, i) => (
                  <text key={i} x={x} y={98} fontSize="7" fill="#ffffff40" textAnchor="middle">
                    {["Oca", "Şub", "Mar", "Nis", "May", "Haz"][i]}
                  </text>
                ))}
              </svg>
            </Box>

            {/* Kanban room status */}
            <Box
              flex={1}
              bg="#1e293b"
              borderRadius="xl"
              p={3}
              border="1px solid rgba(255,255,255,0.06)"
              display={{ base: "none", md: "block" }}
            >
              <Text fontSize="10px" color="whiteAlpha.500" mb={2}>
                Oda Durumu
              </Text>
              <VStack gap={1} align="stretch">
                {[
                  { room: "101", status: "Dolu", color: "#3b82f6" },
                  { room: "102", status: "Check-out", color: "#f59e0b" },
                  { room: "103", status: "Müsait", color: "#10b981" },
                  { room: "104", status: "Temizlik", color: "#8b5cf6" },
                  { room: "105", status: "Dolu", color: "#3b82f6" },
                  { room: "106", status: "Müsait", color: "#10b981" },
                ].map(({ room, status, color }) => (
                  <Flex
                    key={room}
                    align="center"
                    justify="space-between"
                    bg="#0f172a"
                    borderRadius="md"
                    px={2}
                    py={1}
                  >
                    <Text fontSize="10px" color="whiteAlpha.700" fontWeight="semibold">
                      {room}
                    </Text>
                    <Box
                      px={2}
                      py="1px"
                      borderRadius="full"
                      bg={`${color}22`}
                      border={`1px solid ${color}55`}
                    >
                      <Text fontSize="8px" color={color}>
                        {status}
                      </Text>
                    </Box>
                  </Flex>
                ))}
              </VStack>
            </Box>
          </Flex>
        </Box>
      </Flex>
    </Box>
  );
}

// ──────────────────────────────────────────────
// Main Page
// ──────────────────────────────────────────────
export default function HomePage() {
  const router = useRouter();
  const toast = useToast();
  const [seeding, setSeeding] = useState(false);

  return (
    <Box bg="gray.50" minH="100vh">
      {/* ── Navbar ── */}
      <MotionFlex
        as="nav"
        align="center"
        justify="space-between"
        wrap="wrap"
        padding="1.2rem 2rem"
        bg="white"
        boxShadow="sm"
        position="sticky"
        top={0}
        zIndex={10}
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <Flex align="center">
          <Icon as={Building} boxSize={8} color="blue.600" mr={3} />
          <Heading as="h1" size="lg" letterSpacing="tighter" color="gray.800">
            HotelCloud
          </Heading>
        </Flex>
        <HStack spacing={4}>
          <Button variant="ghost" colorScheme="blue" onClick={() => router.push("/login")}>
            Giriş Yap
          </Button>
          <Button
            colorScheme="blue"
            borderRadius="full"
            px={8}
            boxShadow="md"
            onClick={() => router.push("/register")}
          >
            Ücretsiz Başla
          </Button>
        </HStack>
      </MotionFlex>

      {/* ── Hero Section ── */}
      <Box
        bg="linear-gradient(135deg, #1a365d 0%, #2b6cb0 50%, #1a365d 100%)"
        color="white"
        pt={{ base: 16, md: 24 }}
        pb={{ base: 10, md: 14 }}
        textAlign="center"
        position="relative"
        overflow="hidden"
      >
        {/* Background glows */}
        <Box
          position="absolute"
          top="-20%"
          left="-10%"
          w="600px"
          h="600px"
          bg="blue.500"
          borderRadius="full"
          filter="blur(120px)"
          opacity={0.25}
          zIndex={1}
          pointerEvents="none"
        />
        <Box
          position="absolute"
          bottom="-30%"
          right="-10%"
          w="500px"
          h="500px"
          bg="purple.600"
          borderRadius="full"
          filter="blur(120px)"
          opacity={0.2}
          zIndex={1}
          pointerEvents="none"
        />

        <Container maxW="container.lg" position="relative" zIndex={2}>
          <MotionBox
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0}
          >
            <Badge
              colorScheme="blue"
              bg="whiteAlpha.200"
              color="blue.100"
              mb={6}
              px={4}
              py={1}
              borderRadius="full"
              fontSize="sm"
              border="1px solid"
              borderColor="whiteAlpha.300"
            >
              ✨ Yeni Nesil Otel Yönetim Sistemi
            </Badge>
          </MotionBox>

          <MotionBox variants={fadeUp} initial="hidden" animate="visible" custom={1}>
            <Heading
              as="h2"
              size={{ base: "2xl", md: "3xl" }}
              fontWeight="extrabold"
              mb={6}
              lineHeight="shorter"
            >
              Otelinizi Geleceğe Taşıyın,
              <br />
              Karlılığınızı Artırın.
            </Heading>
          </MotionBox>

          <MotionBox variants={fadeUp} initial="hidden" animate="visible" custom={2}>
            <Text fontSize={{ base: "lg", md: "xl" }} mb={10} color="blue.100" maxW="600px" mx="auto">
              Bulut tabanlı modern altyapı ile rezervasyonlarınızı, personelinizi ve finansınızı{" "}
              <Text as="span" color="white" fontWeight="semibold">
                tek bir cam panelden
              </Text>{" "}
              yönetin. Kurulum gerektirmez.
            </Text>
          </MotionBox>

          <MotionBox variants={fadeUp} initial="hidden" animate="visible" custom={3}>
            <HStack justify="center" spacing={4} flexWrap="wrap" mt={8}>
              <Button
                size="lg"
                bg="white"
                color="blue.700"
                px={10}
                h={14}
                borderRadius="full"
                fontSize="lg"
                fontWeight="bold"
                boxShadow="0 8px 32px rgba(0,0,0,0.25)"
                _hover={{ bg: "blue.50", transform: "translateY(-2px)", boxShadow: "0 12px 40px rgba(0,0,0,0.3)" }}
                transition="all 0.25s"
                onClick={() => router.push("/register")}
                rightIcon={<Icon as={ChevronRight} />}
              >
                14 Gün Ücretsiz Dene
              </Button>
              <Button
                size="lg"
                variant="outline"
                color="white"
                borderColor="whiteAlpha.400"
                px={8}
                h={14}
                borderRadius="full"
                fontSize="lg"
                _hover={{ bg: "whiteAlpha.100", borderColor: "white" }}
                transition="all 0.25s"
                onClick={() => router.push("/login")}
              >
                Demo İzle
              </Button>
            </HStack>

            <Text fontSize="sm" color="blue.200" mt={5}>
              Kredi kartı gerekmez · 14 gün sonra otomatik iptal
            </Text>
          </MotionBox>

          {/* Dashboard Mockup */}
          <MotionBox
            variants={{
              hidden: { opacity: 0, y: 60, scale: 0.97 },
              visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, delay: 0.5, ease: "easeOut" } },
            }}
            initial="hidden"
            animate="visible"
          >
            <DashboardMockup />
          </MotionBox>
        </Container>
      </Box>

      {/* ── Features Section ── */}
      <Container maxW="container.xl" py={24}>
        <RevealSection>
          <MotionBox variants={fadeUp} textAlign="center" mb={16}>
            <Text
              fontSize="sm"
              fontWeight="bold"
              color="blue.500"
              letterSpacing="widest"
              textTransform="uppercase"
              mb={3}
            >
              Neden HotelCloud?
            </Text>
            <Heading size="2xl" color="gray.800" mb={4}>
              Sektörün En Kapsamlı
              <Text as="span" color="blue.600">
                {" "}Yönetim Platformu
              </Text>
            </Heading>
            <Text fontSize="lg" color="gray.500" maxW="560px" mx="auto">
              Sektörün dinamiklerini anlayan, modern işletmeler için özel tasarlandı.
            </Text>
          </MotionBox>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
            {[
              {
                title: "Gelişmiş Dashboard",
                icon: LayoutDashboard,
                desc: "Gelir ve doluluk istatistiklerinizi canlı olarak modern grafiklerle takip edin. Anlık verilerle kararlarınızı hızlandırın.",
                color: "blue",
              },
              {
                title: "Kanban Check-in",
                icon: CalendarCheck,
                desc: "Sürükle-bırak hissiyatlı yenilikçi arayüz ile misafir hareketlerini saniyeler içinde listeleyin ve yönetin.",
                color: "purple",
              },
              {
                title: "Akıllı Güvenlik",
                icon: ShieldCheck,
                desc: "Bulut tabanlı eşsiz veritabanı yalıtımı ile her otelin verisi diğerlerinden tamamen izoledir. KVKK uyumlu.",
                color: "green",
              },
            ].map((feature, idx) => (
              <MotionVStack
                key={idx}
                variants={fadeUp}
                custom={idx}
                bg="white"
                p={8}
                borderRadius="2xl"
                boxShadow="sm"
                border="1px solid"
                borderColor="gray.100"
                align="start"
                transition="all 0.3s"
                _hover={{ transform: "translateY(-6px)", boxShadow: "lg" }}
              >
                <Box p={4} bg={`${feature.color}.50`} color={`${feature.color}.600`} borderRadius="xl" mb={4}>
                  <Icon as={feature.icon} boxSize={8} />
                </Box>
                <Heading size="md" mb={2} color="gray.800">
                  {feature.title}
                </Heading>
                <Text color="gray.500" lineHeight="tall">
                  {feature.desc}
                </Text>
              </MotionVStack>
            ))}
          </SimpleGrid>
        </RevealSection>
      </Container>

      {/* ── Social Proof Strip ── */}
      <Box bg="blue.600" py={10}>
        <Container maxW="container.xl">
          <RevealSection>
            <SimpleGrid columns={{ base: 2, md: 4 }} gap={8} textAlign="center">
              {[
                { value: "500+", label: "Aktif Otel" },
                { value: "₺2M+", label: "Aylık İşlem Hacmi" },
                { value: "99.9%", label: "Çalışma Süresi" },
                { value: "4.9★", label: "Ortalama Puanlama" },
              ].map(({ value, label }) => (
                <MotionBox key={label} variants={fadeUp}>
                  <Text fontSize={{ base: "2xl", md: "4xl" }} fontWeight="extrabold" color="white">
                    {value}
                  </Text>
                  <Text fontSize="sm" color="blue.200" mt={1}>
                    {label}
                  </Text>
                </MotionBox>
              ))}
            </SimpleGrid>
          </RevealSection>
        </Container>
      </Box>

      {/* ── Pricing Section ── */}
      <Box bg="white" py={24}>
        <Container maxW="container.xl">
          <RevealSection>
            <MotionBox variants={fadeUp} textAlign="center" mb={16}>
              <Text
                fontSize="sm"
                fontWeight="bold"
                color="blue.500"
                letterSpacing="widest"
                textTransform="uppercase"
                mb={3}
              >
                Fiyatlandırma
              </Text>
              <Heading size="2xl" color="gray.800" mb={4}>
                Otelinize En Uygun Paketi Seçin
              </Heading>
              <Text fontSize="lg" color="gray.500">
                Anında kullanmaya başlayın, büyüdükçe geçiş yapın.
              </Text>
            </MotionBox>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} alignItems="stretch">
              {/* Butik */}
              <MotionVStack
                variants={fadeUp}
                custom={0}
                p={8}
                bg="gray.50"
                borderRadius="2xl"
                border="1px solid"
                borderColor="gray.100"
                align="stretch"
                justify="space-between"
                _hover={{ boxShadow: "md", transform: "translateY(-4px)" }}
                transition="all 0.3s"
              >
                <Box>
                  <Text fontWeight="bold" color="gray.500" letterSpacing="widest" fontSize="xs">
                    BUTİK
                  </Text>
                  <Heading size="2xl" my={4}>
                    ₺1,490
                    <Text as="span" fontSize="lg" color="gray.500">
                      /ay
                    </Text>
                  </Heading>
                  <Text color="gray.500" mb={6}>
                    0-20 odaya sahip butik oteller için ideal başlangıç.
                  </Text>
                  <List spacing={3} mb={8}>
                    {["Maks. 20 Oda Yönetimi", "Temel Rezervasyon Takibi", "1 Yönetici Hesabı", "Standart E-posta Desteği"].map(
                      (item) => (
                        <ListItem key={item} display="flex" alignItems="center" gap={2}>
                          <Icon as={Check} color="blue.500" boxSize={4} />
                          <Text color="gray.600" fontSize="sm">{item}</Text>
                        </ListItem>
                      )
                    )}
                  </List>
                </Box>
                <Button size="lg" variant="outline" colorScheme="blue" borderRadius="full">
                  14 Gün Dene
                </Button>
              </MotionVStack>

              {/* Standart – highlighted */}
              <MotionVStack
                variants={fadeUp}
                custom={1}
                p={10}
                bg="blue.600"
                color="white"
                borderRadius="3xl"
                boxShadow="0 20px 60px rgba(43,108,176,0.45)"
                align="stretch"
                transform={{ md: "scale(1.05)" }}
                position="relative"
                justify="space-between"
                zIndex={2}
                _hover={{ boxShadow: "0 28px 80px rgba(43,108,176,0.55)", transform: { md: "scale(1.07)" } }}
                transition="all 0.3s"
              >
                <Box>
                  <Badge
                    position="absolute"
                    top="-4"
                    left="50%"
                    transform="translateX(-50%)"
                    colorScheme="green"
                    bg="green.400"
                    color="white"
                    px={4}
                    py={1}
                    borderRadius="full"
                    fontSize="xs"
                    fontWeight="bold"
                  >
                    EN POPÜLER
                  </Badge>
                  <Text fontWeight="bold" color="blue.200" letterSpacing="widest" fontSize="xs">
                    STANDART
                  </Text>
                  <Heading size="2xl" my={4}>
                    ₺3,990
                    <Text as="span" fontSize="lg" color="blue.200">
                      /ay
                    </Text>
                  </Heading>
                  <Text color="blue.100" mb={6}>
                    20-80 oda arası oteller için tüm premium özellikler.
                  </Text>
                  <List spacing={3} mb={8} color="white">
                    {[
                      "Maks. 80 Oda Yönetimi",
                      "Kanban Check-in / Check-out",
                      "5 Kullanıcıya Kadar",
                      "Gelişmiş Dinamik İstatistik",
                      "14 Saat Canlı Destek",
                    ].map((item) => (
                      <ListItem key={item} display="flex" alignItems="center" gap={2}>
                        <Icon as={Check} color="green.300" boxSize={4} />
                        <Text fontSize="sm">{item}</Text>
                      </ListItem>
                    ))}
                  </List>
                </Box>
                <Button
                  size="lg"
                  bg="white"
                  color="blue.600"
                  borderRadius="full"
                  fontWeight="bold"
                  _hover={{ bg: "blue.50" }}
                  onClick={() => router.push("/register")}
                >
                  Hemen Başla
                </Button>
              </MotionVStack>

              {/* Premium */}
              <MotionVStack
                variants={fadeUp}
                custom={2}
                p={8}
                bg="gray.50"
                borderRadius="2xl"
                border="1px solid"
                borderColor="gray.100"
                align="stretch"
                justify="space-between"
                _hover={{ boxShadow: "md", transform: "translateY(-4px)" }}
                transition="all 0.3s"
              >
                <Box>
                  <Text fontWeight="bold" color="gray.500" letterSpacing="widest" fontSize="xs">
                    PREMİUM
                  </Text>
                  <Heading size="2xl" my={4}>
                    ₺8,990
                    <Text as="span" fontSize="lg" color="gray.500">
                      /ay
                    </Text>
                  </Heading>
                  <Text color="gray.500" mb={6}>
                    80+ odaya sahip büyük oteller ve zincirler için sınırsız erişim.
                  </Text>
                  <List spacing={3} mb={8}>
                    {[
                      "Sınırsız Oda Kapasitesi",
                      "Sınırsız Kullanıcı ve Alt Roller",
                      "Temizlik Görevlisi Arayüzü",
                      "Çoklu-Şube (Tenant) Desteği",
                      "7/24 VIP Müşteri Temsilcisi",
                    ].map((item) => (
                      <ListItem key={item} display="flex" alignItems="center" gap={2}>
                        <Icon as={Check} color="blue.500" boxSize={4} />
                        <Text color="gray.600" fontSize="sm">{item}</Text>
                      </ListItem>
                    ))}
                  </List>
                </Box>
                <Button size="lg" variant="outline" colorScheme="blue" borderRadius="full">
                  Müşteri Temsilcisine Ulaş
                </Button>
              </MotionVStack>
            </SimpleGrid>
          </RevealSection>
        </Container>
      </Box>

      {/* ── Footer CTA ── */}
      <Box
        bg="linear-gradient(135deg, #1a365d 0%, #2b6cb0 100%)"
        py={20}
        textAlign="center"
        color="white"
      >
        <RevealSection>
          <Container maxW="container.md">
            <MotionBox variants={fadeUp}>
              <Icon as={Star} boxSize={10} color="yellow.300" mb={4} />
              <Heading size="xl" mb={4}>
                Bugün Başlamaya Hazır mısınız?
              </Heading>
              <Text color="blue.100" mb={8} fontSize="lg">
                500'den fazla otel HotelCloud ile karlılığını artırdı. Siz de katılın.
              </Text>
              <Button
                size="lg"
                bg="white"
                color="blue.700"
                px={12}
                h={14}
                borderRadius="full"
                fontSize="lg"
                fontWeight="bold"
                boxShadow="0 8px 32px rgba(0,0,0,0.25)"
                _hover={{ bg: "blue.50", transform: "translateY(-2px)" }}
                transition="all 0.25s"
                onClick={() => router.push("/register")}
              >
                14 Gün Ücretsiz Dene
              </Button>
              <Text fontSize="sm" color="blue.200" mt={4}>
                Kredi kartı gerekmez · İstediğiniz zaman iptal edin
              </Text>
            </MotionBox>
          </Container>
        </RevealSection>
      </Box>
    </Box>
  );
}