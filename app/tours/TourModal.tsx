import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    FormControl,
    FormLabel,
    Input,
    Flex,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    Text,
    Button
} from "@chakra-ui/react";

interface TourModalProps {
    isOpen: boolean;
    onClose: () => void;
    tourName: string;
    setTourName: (value: string) => void;
    startDate: string;
    setStartDate: (value: string) => void;
    endDate: string;
    setEndDate: (value: string) => void;
    adultPrice: string;
    setAdultPrice: (value: string) => void;
    childDiscount: string;
    setChildDiscount: (value: string) => void;
    handleSubmit: () => void;
}

export default function TourModal({
    isOpen,
    onClose,
    tourName,
    setTourName,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    adultPrice,
    setAdultPrice,
    childDiscount,
    setChildDiscount,
    handleSubmit
}: TourModalProps) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Yeni Fiyat Tanımı Ekle</ModalHeader>
                <ModalBody display="flex" flexDirection="column" gap={4}>
                    <FormControl isRequired>
                        <FormLabel>Tur Şirketi</FormLabel>
                        <Input
                            placeholder="Tur Şirketi Adı"
                            value={tourName}
                            onChange={(e) => setTourName(e.target.value)}
                        />
                    </FormControl>

                    <Flex gap={4}>
                        <FormControl isRequired>
                            <FormLabel>Başlangıç Tarihi</FormLabel>
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </FormControl>
                        <FormControl isRequired>
                            <FormLabel>Bitiş Tarihi</FormLabel>
                            <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </FormControl>
                    </Flex>

                    <Flex gap={4}>
                        <FormControl isRequired>
                            <FormLabel>Yetişkin Fiyatı (₺)</FormLabel>
                            <Input
                                placeholder="Örn: 1.250,50"
                                value={adultPrice}
                                onChange={(e) => setAdultPrice(e.target.value)}
                            />
                        </FormControl>
                        <FormControl isRequired>
                            <FormLabel>Çocuk Katsayısı</FormLabel>
                            <NumberInput min={0} max={1} step={0.1} value={childDiscount} onChange={(val) => setChildDiscount(val)}>
                                <NumberInputField placeholder="Örn: 0.7" />
                                <NumberInputStepper>
                                    <NumberIncrementStepper />
                                    <NumberDecrementStepper />
                                </NumberInputStepper>
                            </NumberInput>
                            <Text fontSize="xs" color="gray.500" mt={1}>
                                0.7 = %70 Fiyat (Yetişkin fiyatının %70'i)
                            </Text>
                        </FormControl>
                    </Flex>
                </ModalBody>

                <ModalFooter>
                    <Button variant="ghost" mr={3} onClick={onClose}>İptal</Button>
                    <Button colorScheme="brand" onClick={handleSubmit}>Kaydet</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
