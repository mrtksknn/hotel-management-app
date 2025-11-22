"use client";

import { useState } from "react";
import { Text } from "@chakra-ui/react";
import { useAuth } from "@/hooks/useAuth";
import { AuthLayout, AuthCard, CustomButton, CustomInput } from "@/components";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(email); // login fonksiyonunu çağır
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
          />
          <CustomInput
            placeholder="Şifre"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <CustomButton
            style={{ width: '100%' }}
            type="submit"
            bg="brand.500"
            color="white"
            size="lg"
            _hover={{ bg: "brand.600", transform: "translateY(-1px)", boxShadow: "md" }}
          >
            Giriş Yap
          </CustomButton>
        </form>
      </AuthCard>
    </AuthLayout>
  );
}
