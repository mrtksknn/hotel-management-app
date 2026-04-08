// lib/firebaseClient.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

// Firebase'den aldığınız resmi yapılandırma
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Yapılandırma verilerinin eksik olup olmadığını kontrol et (Güvenlik ve Hata Ayıklama için)
Object.entries(firebaseConfig).forEach(([key, value]) => {
    if (!value && key !== 'measurementId') { // measurementId opsiyonel olabilir
        console.error(`Firebase yapılandırma hatası: ${key} eksik! .env.local dosyasını kontrol edin.`);
    }
});

// Uygulamanın birden fazla kez başlatılmasını engellemek için kontrol (Next.js için standart)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Servisleri başlat
const db = getFirestore(app);
const auth = getAuth(app);

// Analytics'i sadece tarayıcıda başlatan güvenli yapı
if (typeof window !== "undefined") {
    isSupported().then((supported) => {
        if (supported) getAnalytics(app);
    });
}

export { app, db, auth };
