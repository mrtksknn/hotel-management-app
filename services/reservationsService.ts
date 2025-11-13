import { db } from "../lib/firebaseClient";
import { addDoc, collection, getDocs, Timestamp } from "firebase/firestore";

export interface ReservationData {
    id: number;
    giris_tarihi: Date;
    isim: string;
    baslangic_tarihi: Date;
    bitis_tarihi: Date;
    pax: number;
    cocuk_sayisi: number;
    bebek_sayisi: number;
    ucret: string;
    tur: string; // 🔹 Yeni alan
}

export const getReservations = async (): Promise<ReservationData[]> => {
    const snapshot = await getDocs(collection(db, "reservations"));
    const reservations = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
            id: data.id,
            isim: data.isim,
            giris_tarihi: data.giris_tarihi.toDate ? data.giris_tarihi.toDate() : new Date(data.giris_tarihi),
            baslangic_tarihi: data.baslangic_tarihi.toDate ? data.baslangic_tarihi.toDate() : new Date(data.baslangic_tarihi),
            bitis_tarihi: data.bitis_tarihi.toDate ? data.bitis_tarihi.toDate() : new Date(data.bitis_tarihi),
            pax: data.pax,
            cocuk_sayisi: data.cocuk_sayisi,
            bebek_sayisi: data.bebek_sayisi,
            ucret: data.ucret,
            tur: data.tur || "Normal", // 🔹 Eski kayıtlarda boşsa varsayılan “Normal”
        } as ReservationData;
    });
    return reservations;
};

// 🔹 Yeni kayıt ekleme servisi
export const addReservation = async (reservation: Omit<ReservationData, "id">) => {
    try {
        const newDoc = await addDoc(collection(db, "reservations"), {
            ...reservation,
            id: Date.now(),
            giris_tarihi: Timestamp.fromDate(reservation.giris_tarihi),
            baslangic_tarihi: Timestamp.fromDate(reservation.baslangic_tarihi),
            bitis_tarihi: Timestamp.fromDate(reservation.bitis_tarihi),
        });
        return newDoc.id;
    } catch (error) {
        console.error("Rezervasyon eklenirken hata:", error);
        throw error;
    }
};
