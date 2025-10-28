"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Text } from "@chakra-ui/react";
import { AuthLayout, AuthCard, CustomButton, CustomInput } from "@/components";


export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/dashboard");
  };

  return (
    <AuthLayout>
      <AuthCard title="Giriş Yap">
        <form onSubmit={handleLogin} style={{ width: "100%" }}>
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
          <CustomButton type="submit">Giriş Yap</CustomButton>
        </form>

        <Text mt={4} textAlign="center" fontSize="sm">
          Henüz hesabın yok mu?{" "}
          <a
            href="/register"
            color="blue.500"
            style={{ color: "#3182CE", textDecoration: "underline" }}>
            Kayıt Ol
          </a>
        </Text>
      </AuthCard>
    </AuthLayout>
  );
}
