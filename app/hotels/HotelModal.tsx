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
} from "@chakra-ui/react";

interface HotelModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEdit: boolean;
  formData: { name: string; location: string };
  setFormData: (data: any) => void;
  onSave: () => void;
  isLoading: boolean;
}

export default function HotelModal({
  isOpen,
  onClose,
  isEdit,
  formData,
  setFormData,
  onSave,
  isLoading,
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
