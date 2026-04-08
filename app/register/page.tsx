"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Text } from "@chakra-ui/react";
import { AuthLayout, AuthCard, CustomButton, CustomInput } from "@/components";
import { auth, db } from "../../lib/firebaseClient";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { checkHotelNameAvailability } from "@/services/tenantService";
import { v4 as uuidv4 } from "uuid";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [hotelName, setHotelName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!hotelName.trim()) {
      setError("Lütfen tesis adını giriniz.");
      setLoading(false);
      return;
    }

    try {
      // 0️⃣ Otel Adı uygunluğunu kontrol et
      const isAvailable = await checkHotelNameAvailability(hotelName);
      if (!isAvailable) {
        setError("Bu tesis adı zaten sisteme kayıtlı. Lütfen farklı bir isim deneyin.");
        setLoading(false);
        return;
      }

      // 1️⃣ Firebase Authentication’a kullanıcıyı ekle
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2️⃣ Kullanıcı adını güncelle (displayName olarak)
      await updateProfile(user, {
        displayName: name,
      });

      // 14 Günlük deneme süresi hesaplama
      const trialDurationDays = 14;
      const trialExpiresAt = new Date();
      trialExpiresAt.setDate(trialExpiresAt.getDate() + trialDurationDays);

      // 3️⃣ İlk oteli oluştur
      const hotelId = uuidv4();
      await setDoc(doc(db, "hotels", hotelId), {
        id: hotelId,
        name: hotelName.trim(),
        ownerId: user.uid,
        status: 'active',
        settings: {
          currency: "TRY",
          checkInTime: "14:00",
          checkOutTime: "12:00",
          timezone: "Europe/Istanbul"
        },
        createdAt: serverTimestamp()
      });

      // 4️⃣ Firestore’a "Owner / Tenant" verilerini ekle
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: name,
        email: email,
        hotelIds: [hotelId], // Artık dizi olarak tutuyoruz
        role: "owner",
        subscriptionPlan: "Butik", // Başlangıç paketi: Butik
        trialExpiresAt: trialExpiresAt.toISOString(),
        createdAt: serverTimestamp(),
      });

      // 5️⃣ İşlem tamam, login sayfasına yönlendir
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
          />
          <CustomInput
            placeholder="Otel / Tesis Adı"
            value={hotelName}
            onChange={(e) => setHotelName(e.target.value)}
          />
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
