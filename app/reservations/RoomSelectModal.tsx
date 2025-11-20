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
    Box,
    Text,
    Spinner,
    SimpleGrid,
    Divider,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { getRooms } from "../../services/roomsService";
import { getReservationsByYear, ReservationData } from "@/services/reservationsService";
import { Room } from "@/app/rooms/types";

interface RoomSelectModalProps {
    isOpen: boolean;
    onClose: () => void;
    reservation: ReservationData;
    onConfirm: (room: any) => void; // sadece oda bilgisini gönderecek
}

export default function RoomSelectModal({ isOpen, onClose, reservation, onConfirm }: RoomSelectModalProps) {
    const [rooms, setRooms] = useState<Room[] | any[]>([]);
    const [availableRooms, setAvailableRooms] = useState<Room[] | any[]>([]);
    const [loading, setLoading] = useState(false);

    const start = new Date(reservation.baslangic_tarihi);
    const end = new Date(reservation.bitis_tarihi);

    // TARİH ÇAKIŞMASI KONTROLÜ
    const isOverlap = (rStart: Date, rEnd: Date, s: Date, e: Date) => {
        return rStart <= e && rEnd >= s;
    };

    // ODA IDENTIFIER ÇIKARICI (her türlü key'i destekler)
    const extractRoomIdentifier = (r: any): string | null => {
        if (!r) return null;

        const possibleKeys = ["room_code", "oda_no", "roomNumber", "room", "oda", "code", "no"];

        for (const key of possibleKeys) {
            if (r[key] !== undefined && r[key] !== null) return String(r[key]);
        }

        return null;
    };

    // ROOM LOAD + AVAILABLE ROOM HESAPLAMA
    const loadData = async () => {
        setLoading(true);
        try {
            const allRooms = await getRooms();
            setRooms(allRooms);

            const year = start.getFullYear();
            const allRes = await getReservationsByYear(year);

            // Çakışan rezervasyonları bul
            const conflicting = allRes.filter((r: any) =>
                isOverlap(new Date(r.baslangic_tarihi), new Date(r.bitis_tarihi), start, end)
            );

            const usedSet = new Set<string>();

            // Çakışan odaları usedSet'e ekle
            conflicting.forEach((r: any) => {
                const id = extractRoomIdentifier(r);
                if (id) usedSet.add(id);
            });

            // 🔥 REZERVASYONUN KENDİ ODASINI DA LİSTEDEN KALDIR
            const currentRoomId = extractRoomIdentifier(reservation);
            if (currentRoomId) {
                usedSet.add(String(currentRoomId));
            }

            // Müsait odaları filtrele
            const free = (allRooms || []).filter((room: any) => {
                const roomId =
                    room.code ??
                    room.kod ??
                    room.no ??
                    room.number ??
                    null;

                if (!roomId) return true; // id yoksa yine göster

                return !usedSet.has(String(roomId));
            });

            setAvailableRooms(free);
        } catch (err) {
            console.error("RoomSelectModal load error:", err);
            setAvailableRooms([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) loadData();
    }, [isOpen, reservation?.baslangic_tarihi, reservation?.bitis_tarihi]);

    // KATLARA GÖRE GRUPLAMA
    const groupedByFloor = availableRooms.reduce((acc: any, room: any) => {
        const floor = room.floor ?? "Kat Yok";
        if (!acc[floor]) acc[floor] = [];
        acc[floor].push(room);
        return acc;
    }, {});

    // ODA SEÇİLDİĞİNDE
    const handleSelectRoom = (room: any) => {
        onConfirm(room); // sadece oda bilgisi
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="4xl">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Uygun Odalar – {reservation.isim ?? "—"}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Box mb={4}>
                        <Text>
                            <b>Tarih:</b>{" "}
                            {new Date(reservation.baslangic_tarihi).toLocaleDateString("tr-TR")} –{" "}
                            {new Date(reservation.bitis_tarihi).toLocaleDateString("tr-TR")}
                        </Text>

                        <Text>
                            <b>Pax / Çocuk / Bebek:</b>{" "}
                            {reservation.pax} / {reservation.cocuk_sayisi} / {reservation.bebek_sayisi}
                        </Text>
                    </Box>

                    {loading ? (
                        <Box textAlign="center" py={6}>
                            <Spinner />
                            <Text mt={2}>Uygun odalar yükleniyor...</Text>
                        </Box>
                    ) : (
                        <>
                            {availableRooms.length === 0 ? (
                                <Text color="red.500">Bu tarih aralığında uygun oda bulunamadı.</Text>
                            ) : (
                                Object.keys(groupedByFloor).map((floor) => (
                                    <Box key={floor} mb={6}>
                                        <Text fontWeight="bold" mb={2}>
                                            {floor}. Kat
                                        </Text>

                                        <SimpleGrid columns={{ base: 2, md: 3, lg: 6 }} spacing={3}>
                                            {groupedByFloor[floor].map((room: any) => (
                                                <Box
                                                    key={`${room.floor}-${room.no}-${room.code}`}
                                                    borderWidth="1px"
                                                    borderRadius="md"
                                                    p={2}
                                                    display="flex"
                                                    alignItems="center"
                                                    gap={2}
                                                    _hover={{ bg: "gray.50", cursor: "pointer" }}
                                                    onClick={() => handleSelectRoom(room)}
                                                >
                                                    <Text fontWeight="bold">{room.no}</Text>

                                                    {room.code && (
                                                        <Text fontSize="sm" color="gray.600">
                                                            Kod: {room.code}
                                                        </Text>
                                                    )}
                                                </Box>
                                            ))}
                                        </SimpleGrid>

                                        <Divider mt={4} />
                                    </Box>
                                ))
                            )}
                        </>
                    )}
                </ModalBody>

                <ModalFooter>
                    <Button onClick={onClose}>Kapat</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
