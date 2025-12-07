import {
    Box, Text, Badge, Flex, Icon, Divider, VStack, HStack, IconButton
} from "@chakra-ui/react";
import { CheckInOutData } from "@/services/checkInOutService";
import { Calendar, Users, Moon, DoorOpen, DoorClosed, ArrowRight, Check, X } from "lucide-react";
import { getTurColor } from "../reservations/utils";

/**
 * Tarihi uzun formatta formatlar (örn: "12 Temmuz 2018")
 */
export const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat("tr-TR", {
        day: "2-digit",
        month: "long",
        year: "numeric"
    }).format(date);
};

/**
 * Tarihi kısa formatta formatlar (örn: "12 Tem")
 */
export const formatShortDate = (date: Date): string => {
    return new Intl.DateTimeFormat("tr-TR", {
        day: "2-digit",
        month: "short"
    }).format(date);
};

/**
 * Misafir istatistiklerini hesaplar
 */
export const calculateGuestStats = (reservations: CheckInOutData[]) => {
    return {
        total: reservations.reduce((sum, res) => sum + res.pax + res.cocuk_sayisi + res.bebek_sayisi, 0),
        pax: reservations.reduce((sum, res) => sum + res.pax, 0),
        children: reservations.reduce((sum, res) => sum + res.cocuk_sayisi, 0),
        babies: reservations.reduce((sum, res) => sum + res.bebek_sayisi, 0)
    };
};

/**
 * Rezervasyon kartı componenti
 */
interface ReservationCardProps {
    reservation: CheckInOutData;
    type: 'checkin' | 'checkout';
    onCheckIn: (docId: string, currentStatus: boolean) => void;
    onCheckOut: (docId: string, currentStatus: boolean) => void;
}

export const ReservationCard = ({ reservation, type, onCheckIn, onCheckOut }: ReservationCardProps) => {
    const isCheckIn = type === 'checkin';
    const nights = Math.ceil(
        (new Date(reservation.bitis_tarihi).getTime() - new Date(reservation.baslangic_tarihi).getTime()) / (1000 * 60 * 60 * 24)
    );

    const isCompleted = isCheckIn ? reservation.checked_in : reservation.checked_out;

    return (
        <Box
            bg="white"
            borderRadius="xl"
            p={5}
            boxShadow="soft"
            border="2px solid"
            borderColor={isCompleted ? (isCheckIn ? "accent.300" : "orange.300") : "neutral.100"}
            transition="all 0.2s ease-in-out"
            opacity={isCompleted ? 0.7 : 1}
            _hover={{
                boxShadow: "md",
                transform: "translateY(-2px)",
                borderColor: isCheckIn ? "accent.200" : "orange.200"
            }}
        >
            <Flex justify="space-between" align="flex-start" mb={3}>
                <VStack align="flex-start" spacing={1} flex={1}>
                    <Flex align="center" gap={2}>
                        <Text fontSize="lg" fontWeight="bold" color="neutral.800" textTransform="capitalize">
                            {reservation.isim}
                        </Text>
                        {isCompleted && (
                            <Badge colorScheme={isCheckIn ? "green" : "orange"} variant="solid" borderRadius="full" px={2}>
                                <Flex align="center" gap={1}>
                                    <Icon as={Check} boxSize={3} />
                                    <Text fontSize="xs">Tamamlandı</Text>
                                </Flex>
                            </Badge>
                        )}
                    </Flex>
                    <HStack spacing={2}>
                        <Badge colorScheme={getTurColor(reservation.tur)} variant="subtle" borderRadius="md" fontSize="xs">
                            {reservation.tur}
                        </Badge>
                        {reservation.room_code && (
                            <Badge colorScheme="purple" variant="solid" borderRadius="md" fontSize="xs">
                                ODA {reservation.room_code}
                            </Badge>
                        )}
                    </HStack>
                </VStack>
                <HStack spacing={2}>
                    <IconButton
                        aria-label={isCheckIn ? "Giriş yaptı" : "Çıkış yaptı"}
                        icon={<Icon as={isCompleted ? X : Check} boxSize={5} />}
                        size="md"
                        colorScheme={isCheckIn ? "green" : "orange"}
                        variant={isCompleted ? "outline" : "solid"}
                        borderRadius="lg"
                        onClick={() => {
                            if (isCheckIn) {
                                onCheckIn(reservation.docId!, reservation.checked_in || false);
                            } else {
                                onCheckOut(reservation.docId!, reservation.checked_out || false);
                            }
                        }}
                        _hover={{
                            transform: "scale(1.05)"
                        }}
                    />
                    <Icon
                        as={isCheckIn ? DoorOpen : DoorClosed}
                        boxSize={6}
                        color={isCheckIn ? "accent.500" : "orange.500"}
                    />
                </HStack>
            </Flex>

            <Divider my={3} borderColor="neutral.100" />

            <VStack align="stretch" spacing={2} fontSize="sm">
                <Flex justify="space-between" align="center">
                    <HStack spacing={2} color="neutral.600">
                        <Icon as={Calendar} boxSize={4} />
                        <Text fontWeight="medium">Tarih Aralığı</Text>
                    </HStack>
                    <HStack spacing={1} fontSize="xs">
                        <Badge variant="outline" colorScheme="blue" borderRadius="md">
                            {formatShortDate(new Date(reservation.baslangic_tarihi))}
                        </Badge>
                        <Icon as={ArrowRight} boxSize={3} color="neutral.400" />
                        <Badge variant="outline" colorScheme="blue" borderRadius="md">
                            {formatShortDate(new Date(reservation.bitis_tarihi))}
                        </Badge>
                    </HStack>
                </Flex>

                <Flex justify="space-between" align="center">
                    <HStack spacing={2} color="neutral.600">
                        <Icon as={Moon} boxSize={4} />
                        <Text fontWeight="medium">Gece Sayısı</Text>
                    </HStack>
                    <Badge colorScheme="purple" variant="subtle" borderRadius="md">
                        {nights} Gece
                    </Badge>
                </Flex>

                <Flex justify="space-between" align="center">
                    <HStack spacing={2} color="neutral.600">
                        <Icon as={Users} boxSize={4} />
                        <Text fontWeight="medium">Misafir</Text>
                    </HStack>
                    <HStack spacing={2} fontSize="xs">
                        <Badge colorScheme="green" variant="subtle" borderRadius="md">
                            {reservation.pax} Yetişkin
                        </Badge>
                        {reservation.cocuk_sayisi > 0 && (
                            <Badge colorScheme="blue" variant="subtle" borderRadius="md">
                                {reservation.cocuk_sayisi} Çocuk
                            </Badge>
                        )}
                        {reservation.bebek_sayisi > 0 && (
                            <Badge colorScheme="gray" variant="subtle" borderRadius="md">
                                {reservation.bebek_sayisi} Bebek
                            </Badge>
                        )}
                    </HStack>
                </Flex>
            </VStack>
        </Box>
    );
};
