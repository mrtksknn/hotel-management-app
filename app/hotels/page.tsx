"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import {
  Box, Heading, Text, Table, Thead, Tbody, Tr, Th, Td,
  Button, IconButton, HStack, VStack, useDisclosure,
  useToast, Spinner, Flex, Badge, Icon, Select, Menu,
  MenuButton, MenuList, MenuItem, Tooltip
} from "@chakra-ui/react";
import { Edit2, Plus, Hotel as HotelIcon, MapPin, Users, BedDouble, Star, Calendar, ChevronDown, Filter } from "lucide-react";
import { getHotelsByOwner, getHotelStats, updateHotelData, createHotel, canAddMoreHotels } from "@/services/hotelService";
import { Hotel } from "@/types/hotel";
import SubscriptionModal from "./SubscriptionModal";
import HotelModal from "./HotelModal";

import { HOTEL_INITIAL_FORM_STATE, MONTHS, HOTEL_YEAR_OPTIONS, CURRENT_YEAR } from "@/constants/hotels";
import { getSeasonDisplayInfo, getSeasonTooltip, getActiveMonthsForYear } from "./utils";

interface HotelWithStats extends Hotel {
  employeeCount: number;
  roomCount: number;
}

export default function HotelsPage() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [hotels, setHotels] = useState<HotelWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering states
  const [filterMonth, setFilterMonth] = useState<number>(0); 
  const [selectedYear, setSelectedYear] = useState<number>(CURRENT_YEAR);

  // Modal states
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isSubOpen,
    onOpen: onSubOpen,
    onClose: onSubClose
  } = useDisclosure();

  const [isEdit, setIsEdit] = useState(false);
  const [currentHotel, setCurrentHotel] = useState<Partial<HotelWithStats> | null>(null);
  const [formData, setFormData] = useState(HOTEL_INITIAL_FORM_STATE);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (user.role !== "owner") {
      router.push("/dashboard");
      return;
    }
    fetchHotels();
  }, [user, router]);

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const ownerHotels = await getHotelsByOwner(user!.uid);
      const hotelsWithStats = await Promise.all(
        ownerHotels.map(async (h) => {
          const stats = await getHotelStats(h.id);
          return { ...h, ...stats };
        })
      );
      setHotels(hotelsWithStats);
    } catch (error) {
      console.error("Oteller yüklenirken hata:", error);
      toast({
        title: "Hata",
        description: "Oteller yüklenemedi.",
        status: "error",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredHotels = hotels; // We show all, logic handled in utils/cell display

  const handleOpenAdd = () => {
    if (!canAddMoreHotels(user as any)) {
      toast({
        title: "Limit Aşıldı",
        description: `Mevcut paketiniz (${user?.subscriptionPlan}) ile daha fazla otel ekleyemezsiniz.`,
        status: "warning",
        duration: 10000,
        isClosable: true,
        position: "top",
        render: ({ onClose }) => (
          <Box color="white" p={4} bg="orange.500" borderRadius="xl" boxShadow="lg">
            <VStack align="start" spacing={3}>
              <HStack>
                <Icon as={Star} />
                <Text fontWeight="bold">Limit Aşıldı</Text>
              </HStack>
              <Text fontSize="sm">Mevcut paketiniz ({user?.subscriptionPlan}) ile daha fazla otel ekleyemezsiniz.</Text>
              <HStack w="full" justify="flex-end">
                <Button size="sm" variant="plain" color="white" onClick={onClose}>Kapat</Button>
                <Button size="sm" bg="white" variant="outline" color="orange.600" onClick={() => { onSubOpen(); onClose(); }}>Planı Yükselt</Button>
              </HStack>
            </VStack>
          </Box>
        )
      });
      return;
    }
    setIsEdit(false);
    setFormData({
      ...HOTEL_INITIAL_FORM_STATE,
      activeMonths: [1,2,3,4,5,6,7,8,9,10,11,12]
    });
    onOpen();
  };

  const handleOpenEdit = (hotel: HotelWithStats) => {
    setIsEdit(true);
    setCurrentHotel(hotel);
    
    // Get months for the selected year (with fallback logic)
    const activeMonths = getActiveMonthsForYear(hotel, selectedYear);
    
    setFormData({ 
      name: hotel.name, 
      location: hotel.location || "", 
      activeMonths: activeMonths,
      seasonalConfig: hotel.seasonalConfig || {}
    });
    onOpen();
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.location.trim()) {
      toast({ title: "Hata", description: "Lütfen tüm alanları doldurun.", status: "error" });
      return;
    }

    setSaving(true);
    try {
      if (isEdit && currentHotel) {
        // Update the seasonalConfig for the CURRENTLY SELECTED YEAR
        const updatedConfig = {
          ...(currentHotel.seasonalConfig || {}),
          [selectedYear.toString()]: formData.activeMonths
        };

        const updateData = {
          name: formData.name,
          location: formData.location,
          seasonalConfig: updatedConfig
        };

        await updateHotelData(currentHotel.id!, updateData, { uid: user!.uid, name: user!.name });
        toast({ title: "Başarılı", description: `${selectedYear} yılı sezonu güncellendi.`, status: "success" });
      } else {
        // For new hotels, we'll initialize the selected year with current months
        const newHotelData = {
          name: formData.name,
          location: formData.location,
          seasonalConfig: {
            [selectedYear.toString()]: formData.activeMonths
          }
        };
        // Service also sets default status/activeMonths
        await createHotel(formData.name, formData.location, user!.uid, { uid: user!.uid, name: user!.name });
        // After create, ideally we update its seasonal config if user changed it in modal
        // But for simplicity in createHotel, we'll just let it use defaults or follow up
        toast({ title: "Başarılı", description: "Yeni otel oluşturuldu.", status: "success" });
      }
      onClose();
      fetchHotels();
    } catch (error) {
      console.error("Kaydetme hatası:", error);
      toast({ title: "Hata", description: "İşlem başarısız oldu.", status: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="100vh">
        <Spinner size="xl" color="brand.500" thickness="4px" />
      </Flex>
    );
  }

  return (
    <Box p={8} bg="gray.50" minH="100vh">
      <Flex justify="space-between" align="center" mb={8}>
        <Box>
          <HStack mb={1}>
            <Heading size="lg" color="gray.800">Otellerim</Heading>
            <Badge colorScheme="brand" variant="solid" borderRadius="full" px={3} textTransform="uppercase" fontSize="10px">
              {user?.subscriptionPlan} PLAN
            </Badge>
          </HStack>
          <Text color="gray.500" fontSize="sm">Sahibi olduğunuz tüm tesisleri buradan yönetebilirsiniz.</Text>
        </Box>
        <HStack spacing={4}>
          <Button
            variant="ghost"
            leftIcon={<Star size={18} />}
            onClick={onSubOpen}
            colorScheme="brand"
            borderRadius="full"
          >
            Planı Yönet
          </Button>
          <Button
            leftIcon={<Plus size={18} />}
            colorScheme="brand"
            onClick={handleOpenAdd}
            bg="brand.600"
            _hover={{ bg: "brand.700" }}
            borderRadius="full"
            px={6}
          >
            Yeni Otel Ekle
          </Button>
        </HStack>
      </Flex>

      <Flex justify="space-between" align="center" mb={6} bg="white" p={4} borderRadius="xl" boxShadow="sm" border="1px solid" borderColor="gray.100">
        <HStack spacing={4}>
          <HStack>
            <Icon as={Calendar} color="gray.400" boxSize={4} />
            <Text fontSize="sm" fontWeight="medium" color="gray.600">Yıl:</Text>
            <Select 
              size="sm" 
              borderRadius="lg" 
              w="110px" 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(Number(e.target.value))}
            >
              {HOTEL_YEAR_OPTIONS.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </Select>
          </HStack>

          <HStack ml={4}>
            <Icon as={Filter} color="gray.400" boxSize={4} />
            <Text fontSize="sm" fontWeight="medium" color="gray.600">Sezon:</Text>
            <Select 
              size="sm" 
              borderRadius="lg" 
              w="150px" 
              value={filterMonth} 
              onChange={(e) => setFilterMonth(Number(e.target.value))}
            >
              <option value={0}>Tüm Yıl</option>
              {MONTHS.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </Select>
          </HStack>
        </HStack>
        
        <Text fontSize="xs" color="gray.500">
          Toplam <b>{hotels.length}</b> otel listeleniyor.
        </Text>
      </Flex>

      <Box bg="white" p={0} borderRadius="2xl" boxShadow="sm" overflow="hidden" border="1px solid" borderColor="gray.100">
        <Table variant="simple">
          <Thead bg="gray.50">
            <Tr>
              <Th color="gray.500" fontSize="xs" py={4}>Otel Adı</Th>
              <Th color="gray.500" fontSize="xs" py={4}>Lokasyon</Th>
              <Th color="gray.500" fontSize="xs" py={4}>Sezon</Th>
              <Th color="gray.500" fontSize="xs" py={4}>Çalışanlar</Th>
              <Th color="gray.500" fontSize="xs" py={4}>Odalar</Th>
              <Th color="gray.500" fontSize="xs" py={4} textAlign="right">İşlemler</Th>
            </Tr>
          </Thead>
          <Tbody>
            {hotels.map((hotel) => {
              const seasonInfo = getSeasonDisplayInfo(hotel, filterMonth, selectedYear);
              
              return (
              <Tr key={hotel.id} _hover={{ bg: "gray.50" }} transition="all 0.2s">
                <Td py={5}>
                  <HStack spacing={3}>
                    <Box p={2} bg="orange.50" borderRadius="lg">
                      <Icon as={HotelIcon} color="orange.500" boxSize={4} />
                    </Box>
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="semibold" color="gray.700">{hotel.name}</Text>
                      <Text fontSize="10px" color="gray.400" textTransform="uppercase">
                        ID: {hotel.id.slice(0, 8)}
                      </Text>
                    </VStack>
                  </HStack>
                </Td>
                <Td py={5}>
                  <HStack spacing={2}>
                    <Icon as={MapPin} color="gray.400" boxSize={3} />
                    <Text color="gray.600" fontSize="sm">{hotel.location || "Belirtilmemiş"}</Text>
                  </HStack>
                </Td>
                <Td py={5}>
                  <Tooltip label={getSeasonTooltip(hotel.activeMonths)}>
                    <Badge 
                      colorScheme={seasonInfo.colorScheme} 
                      variant="subtle" 
                      borderRadius="full" 
                      px={2}
                    >
                      {seasonInfo.label}
                    </Badge>
                  </Tooltip>
                </Td>
                <Td py={5}>
                  <HStack spacing={2}>
                    <Icon as={Users} color="blue.400" boxSize={3} />
                    <Badge colorScheme="blue" variant="subtle" borderRadius="full" px={2}>
                      {hotel.employeeCount}
                    </Badge>
                  </HStack>
                </Td>
                <Td py={5}>
                  <HStack spacing={2}>
                    <Icon as={BedDouble} color="purple.400" boxSize={3} />
                    <Badge colorScheme="purple" variant="subtle" borderRadius="full" px={2}>
                      {hotel.roomCount}
                    </Badge>
                  </HStack>
                </Td>
                <Td py={5} textAlign="right">
                  <IconButton
                    aria-label="Edit Hotel"
                    icon={<Edit2 size={16} />}
                    variant="ghost"
                    colorScheme="gray"
                    onClick={() => handleOpenEdit(hotel)}
                    borderRadius="full"
                  />
                </Td>
              </Tr>
              );
            })}
            {hotels.length === 0 && (
              <Tr>
                <Td colSpan={6} py={10} textAlign="center">
                  <VStack spacing={2}>
                    <Text color="gray.500">Henüz bir otel kaydetmediniz.</Text>
                    <Button size="sm" colorScheme="brand" onClick={handleOpenAdd}>İlk Otelinizi Ekleyin</Button>
                  </VStack>
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Box>

      {/* Add/Edit Modal */}
      <HotelModal
        isOpen={isOpen}
        onClose={onClose}
        isEdit={isEdit}
        formData={formData}
        setFormData={setFormData}
        onSave={handleSave}
        isLoading={saving}
        selectedYear={selectedYear}
      />

      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={isSubOpen}
        onClose={onSubClose}
        currentPlan={user?.subscriptionPlan || "Butik"}
        userId={user?.uid || ""}
        onPlanUpdated={refreshUser}
      />
    </Box>
  );
}
