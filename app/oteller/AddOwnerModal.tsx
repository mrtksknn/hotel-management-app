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
    useToast,
    VStack
} from "@chakra-ui/react";
import { useState } from "react";
import { addOwner } from "@/services/hotelOwnersService";

interface AddOwnerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AddOwnerModal({ isOpen, onClose, onSuccess }: AddOwnerModalProps) {
    const [name, setName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [hotel, setHotel] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    const handleSubmit = async () => {
        if (!name || !email || !hotel) {
            toast({
                title: "Tüm alanlar gerekli",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        setLoading(true);
        try {
            await addOwner({ name, email, hotel });
            toast({
                title: "Otel sahibi başarıyla eklendi",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            setName("");
            setEmail("");
            setHotel("");
            onSuccess();
            onClose();
        } catch (error) {
            toast({
                title: "Otel sahibi eklenirken hata oluştu",
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
                <ModalHeader>Yeni Otel Sahibi Ekle</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing={4}>
                        <FormControl isRequired>
                            <FormLabel>İsim</FormLabel>
                            <Input
                                placeholder="Otel sahibinin adı"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel>E-posta</FormLabel>
                            <Input
                                type="email"
                                placeholder="ornek@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel>Otel Adı</FormLabel>
                            <Input
                                placeholder="Otel adı"
                                value={hotel}
                                onChange={(e) => setHotel(e.target.value)}
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
