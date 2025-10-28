"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Text } from "@chakra-ui/react";
import { AuthLayout, AuthCard, CustomButton, CustomInput } from "@/components";


export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/login");
  };

  return (
    <AuthLayout>
      <AuthCard title="Kayıt Ol">
        <form onSubmit={handleRegister} style={{ width: "100%" }}>
          <CustomInput
            placeholder="Ad Soyad"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <CustomInput
            placeholder="E-posta"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <CustomInput
            placeholder="Şifre"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <CustomButton type="submit" colorScheme="green">
            Kayıt Ol
          </CustomButton>
        </form>

        <Text mt={4} textAlign="center" fontSize="sm">
          Zaten hesabın var mı?{" "}
          <a
            href="/login"
            color="blue.500"
            style={{ color: "#3182CE", textDecoration: "underline" }}>
            Giriş Yap
          </a>
        </Text>
      </AuthCard>
    </AuthLayout>
  );
}
