"use client";

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
    NumberInput,
    NumberInputField,
    Select,
    useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import CustomButton from "../../components/common/CustomButton";
import { addReservation } from "../../services/reservationsService";

interface ReservationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function ReservationModal({ isOpen, onClose, onSuccess }: ReservationModalProps) {
    const toast = useToast();

    const [formData, setFormData] = useState({
        isim: "",
        giris_tarihi: "",
        baslangic_tarihi: "",
        bitis_tarihi: "",
        pax: 1,
        cocuk_sayisi: 0,
        bebek_sayisi: 0,
        ucret: "",
        tur: "Normal", // 🔹 Varsayılan değer
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        try {
            await addReservation({
                isim: formData.isim,
                giris_tarihi: new Date(formData.giris_tarihi),
                baslangic_tarihi: new Date(formData.baslangic_tarihi),
                bitis_tarihi: new Date(formData.bitis_tarihi),
                pax: Number(formData.pax),
                cocuk_sayisi: Number(formData.cocuk_sayisi),
                bebek_sayisi: Number(formData.bebek_sayisi),
                ucret: formData.ucret,
                tur: formData.tur, // 🔹 Firestore’a gönder
            });

            toast({
                title: "Rezervasyon eklendi 🎉",
                status: "success",
                duration: 2500,
                isClosable: true,
            });

            onClose();
            if (onSuccess) onSuccess();

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
            });
        } catch (error) {
            toast({
                title: "Kayıt başarısız!",
                description: "Bir hata oluştu. Lütfen tekrar deneyin.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Yeni Rezervasyon Oluştur</ModalHeader>

                <ModalBody display="flex" flexDirection="column" gap={3}>
                    <FormControl>
                        <FormLabel>İsim</FormLabel>
                        <Input name="isim" value={formData.isim} onChange={handleChange} />
                    </FormControl>

                    <FormControl>
                        <FormLabel>Tur</FormLabel>
                        <Select name="tur" value={formData.tur} onChange={handleChange}>
                            <option value="Normal">Normal</option>
                            <option value="ETS">ETS</option>
                            <option value="ECC">ECC</option>
                            <option value="VALS">VALS</option>
                            <option value="TATİL.COM">TATİL.COM</option>
                            <option value="GEZİNOMİ">GEZİNOMİ</option>
                            <option value="JOLLY">JOLLY</option>
                        </Select>
                    </FormControl>

                    <FormControl>
                        <FormLabel>Giriş Tarihi</FormLabel>
                        <Input type="date" name="giris_tarihi" value={formData.giris_tarihi} onChange={handleChange} />
                    </FormControl>

                    <FormControl>
                        <FormLabel>Başlangıç Tarihi</FormLabel>
                        <Input type="date" name="baslangic_tarihi" value={formData.baslangic_tarihi} onChange={handleChange} />
                    </FormControl>

                    <FormControl>
                        <FormLabel>Bitiş Tarihi</FormLabel>
                        <Input type="date" name="bitis_tarihi" value={formData.bitis_tarihi} onChange={handleChange} />
                    </FormControl>

                    <FormControl>
                        <FormLabel>Pax</FormLabel>
                        <NumberInput min={1}>
                            <NumberInputField name="pax" value={formData.pax} onChange={handleChange} />
                        </NumberInput>
                    </FormControl>

                    <FormControl>
                        <FormLabel>Çocuk Sayısı</FormLabel>
                        <NumberInput min={0}>
                            <NumberInputField name="cocuk_sayisi" value={formData.cocuk_sayisi} onChange={handleChange} />
                        </NumberInput>
                    </FormControl>

                    <FormControl>
                        <FormLabel>Bebek Sayısı</FormLabel>
                        <NumberInput min={0}>
                            <NumberInputField name="bebek_sayisi" value={formData.bebek_sayisi} onChange={handleChange} />
                        </NumberInput>
                    </FormControl>

                    <FormControl>
                        <FormLabel>Ücret (₺)</FormLabel>
                        <Input name="ucret" value={formData.ucret} onChange={handleChange} />
                    </FormControl>
                </ModalBody>

                <ModalFooter display="flex" gap={2}>
                    <CustomButton onClick={onClose}>Vazgeç</CustomButton>
                    <CustomButton bg="#1e2532" color="#fff" onClick={handleSubmit}>
                        Ekle
                    </CustomButton>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
