"use client";

import { db } from "../lib/firebaseClient";
import { collection, getDocs } from "firebase/firestore";

// 🔹 Rezervasyon tipi
export interface ReservationData {
    id: number;
    giris_tarihi: Date;
    isim: string;
    baslangic_tarihi: Date;
    bitis_tarihi: Date;
    gece_sayisi: number;
    pax: number;
    cocuk_sayisi: number;
    bebek_sayisi: number;
    ucret: string;
}

// 🔹 Firestore'dan rezervasyonları çeken fonksiyon
export const getReservations = async (): Promise<ReservationData[]> => {
    const snapshot = await getDocs(collection(db, "reservations"));

    const reservations = snapshot.docs.map((doc) => {
        const data = doc.data();

        return {
            id: data.id,
            isim: data.isim,
            giris_tarihi: data.giris_tarihi.toDate ? data.giris_tarihi.toDate() : new Date(data.giris_tarihi),
            baslangic_tarihi: data.baslangic_tarihi.toDate ? data.baslangic_tarihi.toDate() : new Date(data.baslangic_tarihi),
            bitis_tarihi: data.bitis_tarihi.toDate ? data.bitis_tarihi.toDate() : new Date(data.bitis_tarihi),
            gece_sayisi: data.gece_sayisi,
            pax: data.pax,
            cocuk_sayisi: data.cocuk_sayisi,
            bebek_sayisi: data.bebek_sayisi,
            ucret: data.ucret,
        } as ReservationData;
    });
    return reservations;
};
