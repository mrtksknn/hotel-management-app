"use client";

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Button,
  VStack,
  Checkbox,
  CheckboxGroup,
  SimpleGrid,
  Text,
  Box,
  HStack,
  Badge,
} from "@chakra-ui/react";
import { MONTHS } from "@/constants/hotels";

interface HotelModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEdit: boolean;
  formData: { 
    name: string; 
    location: string; 
    activeMonths: number[];
    seasonalConfig?: Record<string, number[]>;
  };
  setFormData: (data: any) => void;
  onSave: () => void;
  isLoading: boolean;
  selectedYear: number;
}

export default function HotelModal({
  isOpen,
  onClose,
  isEdit,
  formData,
  setFormData,
  onSave,
  isLoading,
  selectedYear,
}: HotelModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay backdropFilter="blur(5px)" bg="blackAlpha.300" />
      <ModalContent borderRadius="2xl" boxShadow="xl">
        <ModalHeader color="gray.800">{isEdit ? "Oteli Düzenle" : "Yeni Otel Ekle"}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel fontSize="sm" color="gray.600">Otel Adı</FormLabel>
              <Input
                placeholder="Ör: Grand Resort"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                borderRadius="xl"
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel fontSize="sm" color="gray.600">Lokasyon (Şehir, Ülke)</FormLabel>
              <Input
                placeholder="Ör: Antalya, Türkiye"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                borderRadius="xl"
              />
            </FormControl>

            <Box w="full" p={4} bg="gray.50" borderRadius="xl" border="1px solid" borderColor="gray.100">
              <HStack justify="space-between" mb={3}>
                <Text fontSize="sm" color="gray.700" fontWeight="bold">
                  Sektörel Takvim ({selectedYear})
                </Text>
                <Badge colorScheme="brand" variant="outline" fontSize="xs" borderRadius="full">
                  Sezon Ayarları
                </Badge>
              </HStack>
              <Text fontSize="xs" color="gray.500" mb={4}>
                Bu otelin <b>{selectedYear}</b> yılındaki aktif çalışma aylarını belirleyin.
              </Text>
              <CheckboxGroup 
                colorScheme="brand" 
                value={formData.activeMonths}
                onChange={(values) => setFormData({ ...formData, activeMonths: values.map(Number) })}
              >
                <SimpleGrid columns={3} spacing={3}>
                  {MONTHS.map((month) => (
                    <Checkbox key={month.value} value={month.value} fontSize="sm">
                      {month.label}
                    </Checkbox>
                  ))}
                </SimpleGrid>
              </CheckboxGroup>
            </Box>
          </VStack>
        </ModalBody>
        <ModalFooter borderTop="1px solid" borderColor="gray.100">
          <Button variant="ghost" mr={3} onClick={onClose} borderRadius="full">İptal</Button>
          <Button
            colorScheme="brand"
            bg="brand.600"
            _hover={{ bg: "brand.700" }}
            onClick={onSave}
            isLoading={isLoading}
            borderRadius="full"
            px={8}
          >
            Kaydet
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
