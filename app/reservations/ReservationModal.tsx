"use client";

import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    Button,
    FormControl,
    FormLabel,
    Input,
    Select,
    SimpleGrid,
    Box,
    Text,
    Spinner,
    Accordion,
    AccordionButton,
    AccordionIcon,
    AccordionItem,
    AccordionPanel,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { addReservation } from "../../services/reservationsService";
import { getAvailableRooms } from "../../services/roomsService";
import { Room } from "@/app/rooms/types";
import { useAuth } from "@/hooks/useAuth";

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export default function ReservationModal({ isOpen, onClose }: Props) {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        isim: "",
        giris_tarihi: "",
        baslangic_tarihi: "",
        bitis_tarihi: "",
        pax: 1,
        cocuk_sayisi: 0,
        bebek_sayisi: 0,
        ucret: "",
        tur: "Normal",
        room_code: "",
    });

    const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
    const [loadingRooms, setLoadingRooms] = useState(false);

    const resetForm = () => {
        setFormData({
            isim: "",
            giris_tarihi: "",
            baslangic_tarihi: "",
            bitis_tarihi: "",
            pax: 1,
            cocuk_sayisi: 0,
            bebek_sayisi: 0,
            ucret: "",
            tur: "Normal",
            room_code: "",
        });
        setAvailableRooms([]);
    };

    const handleChange = async (e: any) => {
        const { name, value } = e.target;
        const updated = { ...formData, [name]: value };
        setFormData(updated);

        if (updated.baslangic_tarihi && updated.bitis_tarihi) {
            const start = new Date(updated.baslangic_tarihi);
            const end = new Date(updated.bitis_tarihi);

            if (start < end) {
                setLoadingRooms(true);
                let rooms = await getAvailableRooms(start, end);

                // Kapasiteye göre filtreleme
                rooms = rooms.filter((room) => {
                    let maxCapacity = 2;
                    switch (room.code) {
                        case "F":
                            maxCapacity = 2;
                            break;
                        case "FS":
                        case "FÇ":
                            maxCapacity = 3;
                            break;
                        case "FSÇÇ":
                            maxCapacity = 5;
                            break;
                    }

                    let totalPeople = Number(updated.pax) + Number(updated.cocuk_sayisi);
                    if (Number(updated.bebek_sayisi) >= 2) totalPeople += 1;

                    return totalPeople <= maxCapacity;
                });

                // Kat ve oda numarasına göre sırala
                rooms.sort((a, b) => a.floor - b.floor || a.no - b.no);
                setAvailableRooms(rooms);
                setLoadingRooms(false);
            }
        }
    };

    const handleSubmit = async () => {
        if (!formData.room_code) {
            alert("Lütfen bir oda seçin.");
            return;
        }

        await addReservation({
            isim: formData.isim,
            giris_tarihi: new Date(formData.giris_tarihi),
            baslangic_tarihi: new Date(formData.baslangic_tarihi),
            bitis_tarihi: new Date(formData.bitis_tarihi),
            pax: Number(formData.pax),
            cocuk_sayisi: Number(formData.cocuk_sayisi),
            bebek_sayisi: Number(formData.bebek_sayisi),
            ucret: formData.ucret,
            tur: formData.tur,
            room_code: formData.room_code,
            hotel: user?.hotel || "Keskin Prestij", // Kullanıcı oteli veya varsayılan
        });

        resetForm();
        onClose();
    };

    useEffect(() => {
        if (!isOpen) resetForm();
    }, [isOpen]);

    // Katlara göre grupla
    const groupedRooms: Record<number, Room[]> = {};
    availableRooms.forEach((room) => {
        if (!groupedRooms[room.floor]) groupedRooms[room.floor] = [];
        groupedRooms[room.floor].push(room);
    });

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="3xl">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Yeni Rezervasyon Ekle</ModalHeader>
                <ModalCloseButton />
                <ModalBody pb={6}>
                    <SimpleGrid columns={2} spacing={4}>
                        <Box>
                            <FormControl mb={3}>
                                <FormLabel>İsim</FormLabel>
                                <Input name="isim" value={formData.isim} onChange={handleChange} />
                            </FormControl>

                            <SimpleGrid columns={2} spacing={2} mb={3}>
                                <FormControl>
                                    <FormLabel>Başlangıç Tarihi</FormLabel>
                                    <Input type="date" name="baslangic_tarihi" value={formData.baslangic_tarihi} onChange={handleChange} />
                                </FormControl>
                                <FormControl>
                                    <FormLabel>Bitiş Tarihi</FormLabel>
                                    <Input type="date" name="bitis_tarihi" value={formData.bitis_tarihi} onChange={handleChange} />
                                </FormControl>
                            </SimpleGrid>

                            <SimpleGrid columns={3} spacing={2} mb={3}>
                                <FormControl>
                                    <FormLabel>Pax</FormLabel>
                                    <Input type="number" name="pax" value={formData.pax} onChange={handleChange} />
                                </FormControl>
                                <FormControl>
                                    <FormLabel>Çocuk</FormLabel>
                                    <Input type="number" name="cocuk_sayisi" value={formData.cocuk_sayisi} onChange={handleChange} />
                                </FormControl>
                                <FormControl>
                                    <FormLabel>Bebek</FormLabel>
                                    <Input type="number" name="bebek_sayisi" value={formData.bebek_sayisi} onChange={handleChange} />
                                </FormControl>
                            </SimpleGrid>

                            <SimpleGrid columns={2} spacing={2} mb={3}>
                                <FormControl>
                                    <FormLabel>Ücret</FormLabel>
                                    <Input name="ucret" value={formData.ucret} onChange={handleChange} />
                                </FormControl>
                                <FormControl>
                                    <FormLabel>Tur</FormLabel>
                                    <Select name="tur" value={formData.tur} onChange={handleChange}>
                                        <option value="Normal">Normal</option>
                                        <option value="ETS">ETS</option>
                                        <option value="TATİL.COM">TATİL.COM</option>
                                        <option value="VALS TUR">VALS TUR</option>
                                        <option value="ECC">ECC</option>
                                        <option value="JOLLY">JOLLY</option>
                                        <option value="GEZİNOMİ">GEZİNOMİ</option>
                                    </Select>
                                </FormControl>
                            </SimpleGrid>
                        </Box>

                        <Box style={{ maxHeight: "400px", overflowY: "auto" }}>
                            <FormControl>
                                <FormLabel>Müsait Odalar</FormLabel>

                                {loadingRooms ? (
                                    <Spinner />
                                ) : availableRooms.length === 0 ? (
                                    <Text>Seçilen tarihlerde müsait oda yok.</Text>
                                ) : (
                                    <Accordion allowMultiple>
                                        {Object.entries(groupedRooms).map(([floor, rooms]) => (
                                            <AccordionItem key={floor} border="1px solid #E2E8F0" borderRadius="md" mb={2}>
                                                <AccordionButton>
                                                    <Box flex="1" textAlign="left" fontWeight="bold">
                                                        {`Kat ${floor}`}
                                                    </Box>
                                                    <AccordionIcon />
                                                </AccordionButton>

                                                <AccordionPanel pb={4}>
                                                    <SimpleGrid columns={3} spacing={3}>
                                                        {rooms.map((room) => (
                                                            <Box
                                                                key={room.no}
                                                                onClick={() =>
                                                                    setFormData(prev => ({ ...prev, room_code: room.no.toString() }))
                                                                }
                                                                cursor="pointer"
                                                                border="1px solid #CBD5E0"
                                                                borderRadius="md"
                                                                p={3}
                                                                textAlign="center"
                                                                bg={formData.room_code === room.no.toString() ? "blue.100" : "white"}
                                                                _hover={{ bg: "blue.50" }}
                                                            >
                                                                <Text fontWeight="bold">{room.no}</Text>
                                                                <Text fontSize="xs">{room.code}</Text>
                                                            </Box>
                                                        ))}
                                                    </SimpleGrid>
                                                </AccordionPanel>
                                            </AccordionItem>
                                        ))}
                                    </Accordion>
                                )}
                            </FormControl>
                        </Box>
                    </SimpleGrid>
                </ModalBody>

                <ModalFooter>
                    <Button colorScheme="blue" mr={3} onClick={handleSubmit}>Kaydet</Button>
                    <Button onClick={onClose}>İptal</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
