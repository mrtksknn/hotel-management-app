import { db } from "../lib/firebaseClient";
import { addDoc, collection, getDocs, Timestamp } from "firebase/firestore";
import { blockRoomDates } from "./roomsService";

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
    tur: string;
    room_code?: string;
}

export const getReservationsByYear = async (year: number) => {
    const snapshot = await getDocs(collection(db, "reservations"));
    const reservations = snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
            docId: docSnap.id,
            id: data.id,
            isim: data.isim,
            giris_tarihi: data.giris_tarihi.toDate(),
            baslangic_tarihi: data.baslangic_tarihi.toDate(),
            bitis_tarihi: data.bitis_tarihi.toDate(),
            pax: data.pax,
            cocuk_sayisi: data.cocuk_sayisi,
            bebek_sayisi: data.bebek_sayisi,
            ucret: data.ucret,
            tur: data.tur || "Normal",
            room_code: data.room_code || null
        };
    });

    return reservations.filter(
        r => new Date(r.baslangic_tarihi).getFullYear() === year
    );
};

export const addReservation = async (reservation: Omit<ReservationData, "id">) => {
    try {
        const newDoc = await addDoc(collection(db, "reservations"), {
            ...reservation,
            id: Date.now(),
            giris_tarihi: Timestamp.fromDate(reservation.baslangic_tarihi),
            baslangic_tarihi: Timestamp.fromDate(reservation.baslangic_tarihi),
            bitis_tarihi: Timestamp.fromDate(reservation.bitis_tarihi),
        });

        // 🔥 Rezervasyon kaydedildikten sonra odayı blokla
        await blockRoomDates(
            Number(reservation.room_code),
            reservation.baslangic_tarihi,
            reservation.bitis_tarihi
        );

        return newDoc.id;
    } catch (error) {
        console.error("Rezervasyon eklenirken hata:", error);
        throw error;
    }
};
export const summarizeByTur = (reservations: ReservationData[]) => {
    const parseUcret = (ucretStr: string): number => {
        if (!ucretStr) return 0;
        const n = ucretStr.replace(/\./g, "").replace(",", ".");
        return parseFloat(n) || 0;
    };

    const result: Record<string, { totalGeceleme: number; totalUcret: number }> = {};

    reservations.forEach((res) => {
        const turName = res.tur || "Diğer";

        const nights =
            Math.ceil(
                (new Date(res.bitis_tarihi).getTime() -
                    new Date(res.baslangic_tarihi).getTime()) /
                (1000 * 60 * 60 * 24)
            ) || 0;

        const totalGuests =
            res.pax + res.cocuk_sayisi * 0.5 + res.bebek_sayisi * 0;

        const geceleme = nights * totalGuests;

        if (!result[turName]) {
            result[turName] = { totalGeceleme: 0, totalUcret: 0 };
        }

        result[turName].totalGeceleme += geceleme;
        result[turName].totalUcret += parseUcret(res.ucret);
    });

    return result;
};
