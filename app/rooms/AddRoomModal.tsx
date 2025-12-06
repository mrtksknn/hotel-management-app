"use client";

import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    FormControl,
    FormLabel,
    Input,
    Select,
    useToast,
    VStack
} from "@chakra-ui/react";
import { useState } from "react";
import { addRoom } from "@/services/roomsService";

interface AddRoomModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    hotelId?: string;
}

export default function AddRoomModal({ isOpen, onClose, onSuccess, hotelId }: AddRoomModalProps) {
    const [floor, setFloor] = useState<number>(1);
    const [roomNo, setRoomNo] = useState<string>("");
    const [code, setCode] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    const handleSubmit = async () => {
        if (!roomNo) {
            toast({
                title: "Oda numarası gerekli",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        if (!hotelId) {
            toast({
                title: "Hotel bilgisi bulunamadı",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        setLoading(true);
        try {
            await addRoom(floor, parseInt(roomNo), hotelId, code || undefined);
            toast({
                title: "Oda başarıyla eklendi",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            setFloor(1);
            setRoomNo("");
            setCode("");
            onSuccess();
            onClose();
        } catch (error) {
            toast({
                title: "Oda eklenirken hata oluştu",
                description: error instanceof Error ? error.message : "Bilinmeyen hata",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="md">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Yeni Oda Ekle</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing={4}>
                        <FormControl isRequired>
                            <FormLabel>Kat</FormLabel>
                            <Select
                                value={floor}
                                onChange={(e) => setFloor(parseInt(e.target.value))}
                            >
                                <option value={1}>1. Kat</option>
                                <option value={2}>2. Kat</option>
                                <option value={3}>3. Kat</option>
                                <option value={4}>4. Kat</option>
                                <option value={5}>5. Kat</option>
                            </Select>
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel>Oda Numarası</FormLabel>
                            <Input
                                type="number"
                                placeholder="Örn: 101"
                                value={roomNo}
                                onChange={(e) => setRoomNo(e.target.value)}
                            />
                        </FormControl>

                        <FormControl>
                            <FormLabel>Oda Kodu (Opsiyonel)</FormLabel>
                            <Input
                                placeholder="Örn: AİLE, GENİŞ, SETLİ"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                            />
                        </FormControl>
                    </VStack>
                </ModalBody>

                <ModalFooter>
                    <Button variant="ghost" mr={3} onClick={onClose}>
                        İptal
                    </Button>
                    <Button
                        colorScheme="brand"
                        onClick={handleSubmit}
                        isLoading={loading}
                    >
                        Ekle
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
