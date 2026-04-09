"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import {
  Box, Heading, Text, Table, Thead, Tbody, Tr, Th, Td,
  Button, IconButton, HStack, VStack, useDisclosure, Modal,
  ModalOverlay, ModalContent, ModalHeader, ModalFooter,
  ModalBody, ModalCloseButton, FormControl, FormLabel,
  Input, useToast, Spinner, Flex, Badge, Icon
} from "@chakra-ui/react";
import { Edit2, Plus, Hotel as HotelIcon, MapPin, Users, BedDouble, Star } from "lucide-react";
import { getHotelsByOwner, getHotelStats, updateHotelData, createHotel, canAddMoreHotels } from "@/services/hotelService";
import { Hotel } from "@/types/hotel";
import SubscriptionModal from "./SubscriptionModal";
import HotelModal from "./HotelModal";

import { HOTEL_INITIAL_FORM_STATE } from "@/constants/hotels";

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
    setFormData(HOTEL_INITIAL_FORM_STATE);
    onOpen();
  };

  const handleOpenEdit = (hotel: HotelWithStats) => {
    setIsEdit(true);
    setCurrentHotel(hotel);
    setFormData({ name: hotel.name, location: hotel.location || "" });
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
        await updateHotelData(currentHotel.id!, formData, { uid: user!.uid, name: user!.name });
        toast({ title: "Başarılı", description: "Otel güncellendi.", status: "success" });
      } else {
        await createHotel(formData.name, formData.location, user!.uid, { uid: user!.uid, name: user!.name });
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

      <Box bg="white" p={0} borderRadius="2xl" boxShadow="sm" overflow="hidden" border="1px solid" borderColor="gray.100">
        <Table variant="simple">
          <Thead bg="gray.50">
            <Tr>
              <Th color="gray.500" fontSize="xs" py={4}>Otel Adı</Th>
              <Th color="gray.500" fontSize="xs" py={4}>Lokasyon</Th>
              <Th color="gray.500" fontSize="xs" py={4}>Çalışanlar</Th>
              <Th color="gray.500" fontSize="xs" py={4}>Odalar</Th>
              <Th color="gray.500" fontSize="xs" py={4} textAlign="right">İşlemler</Th>
            </Tr>
          </Thead>
          <Tbody>
            {hotels.map((hotel) => (
              <Tr key={hotel.id} _hover={{ bg: "gray.50" }} transition="all 0.2s">
                <Td py={5}>
                  <HStack spacing={3}>
                    <Box p={2} bg="orange.50" borderRadius="lg">
                      <Icon as={HotelIcon} color="orange.500" boxSize={4} />
                    </Box>
                    <Text fontWeight="semibold" color="gray.700">{hotel.name}</Text>
                  </HStack>
                </Td>
                <Td py={5}>
                  <HStack spacing={2}>
                    <Icon as={MapPin} color="gray.400" boxSize={3} />
                    <Text color="gray.600" fontSize="sm">{hotel.location || "Belirtilmemiş"}</Text>
                  </HStack>
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
            ))}
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
