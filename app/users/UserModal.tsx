"use client";

import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Input,
    Select,
    Text,
} from "@chakra-ui/react";
import { CustomButton } from "@/components";
import { TEAMS } from "./utils";

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode: "add" | "edit";
    form: any;
    setForm: (form: any) => void;
    onSave: () => void;
    saving?: boolean;
}

export default function UserModal({
    isOpen,
    onClose,
    mode,
    form,
    setForm,
    onSave,
    saving = false,
}: UserModalProps) {
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent borderRadius="xl">
                <ModalHeader>
                    {mode === "add" ? "Yeni Kullanıcı Ekle" : "Kullanıcıyı Güncelle"}
                </ModalHeader>
                <ModalBody display="flex" flexDirection="column" gap={3}>
                    <Input
                        placeholder="İsim"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        borderRadius="lg"
                    />
                    <Input
                        placeholder="Email"
                        value={form.email}
                        isReadOnly={mode === "edit"} // 🔒 Güncellemede e-posta değiştirilemez
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        borderRadius="lg"
                    />
                    {mode === "add" && (
                        <Input
                            placeholder="Şifre"
                            type="password"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            borderRadius="lg"
                        />
                    )}
                    <Input
                        placeholder="Unvan (Örn: Genel Müdür, Kat Şefi)"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        borderRadius="lg"
                    />
                    <Text fontSize="xs" color="gray.500" mb={-2}>
                        Çalışacağı Ekip / Departman:
                    </Text>
                    <Select
                        value={form.team}
                        onChange={(e) => setForm({ ...form, team: e.target.value })}
                        borderRadius="lg"
                    >
                        {TEAMS.map((team) => (
                            <option key={team.value} value={team.value}>
                                {team.label}
                            </option>
                        ))}
                    </Select>
                </ModalBody>

                <ModalFooter display="flex" gap={2}>
                    <CustomButton variant="ghost" onClick={onClose}>
                        Vazgeç
                    </CustomButton>
                    <CustomButton
                        bg="brand.500"
                        color="white"
                        _hover={{ bg: "brand.600" }}
                        onClick={onSave}
                        isLoading={saving}
                    >
                        {mode === "add" ? "Ekle" : "Güncelle"}
                    </CustomButton>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
