"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Text } from "@chakra-ui/react";
import { AuthLayout, AuthCard, CustomButton, CustomInput } from "@/components";
import { auth, db } from "../../lib/firebaseClient";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1️⃣ Firebase Authentication’a kullanıcıyı ekle
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2️⃣ Kullanıcı adını güncelle (displayName olarak)
      await updateProfile(user, {
        displayName: name,
      });

      // 3️⃣ Firestore’a user bilgilerini ekle
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: name,
        email: email,
        createdAt: serverTimestamp(),
      });

      // 4️⃣ İşlem tamam, login sayfasına yönlendir
      router.push("/login");
    } catch (err: any) {
      setError(err.message);
      console.error("Kayıt hatası:", err);
    } finally {
      setLoading(false);
    }
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

        {error && (
          <Text color="red.400" mt={3} textAlign="center">
            {error}
          </Text>
        )}

        <Text mt={4} textAlign="center" fontSize="sm">
          Zaten hesabın var mı?{" "}
          <a
            href="/login"
            style={{ color: "#3182CE", textDecoration: "underline" }}
          >
            Giriş Yap
          </a>
        </Text>
      </AuthCard>
    </AuthLayout>
  );
}
