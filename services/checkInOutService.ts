import { db } from "../lib/firebaseClient";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { ReservationData } from "./reservationsService";

export interface CheckInOutData extends ReservationData {
    docId?: string;
    room_no?: number;
    checked_in?: boolean;
    checked_out?: boolean;
}

/**
 * Belirli bir tarihteki giriş yapacak rezervasyonları getirir
 * @param date - Kontrol edilecek tarih
 * @param hotelName - Otel adı (opsiyonel)
 */
export const getCheckInsForDate = async (date: Date, hotelName?: string): Promise<CheckInOutData[]> => {
    try {
        const reservationsRef = collection(db, "reservations");
        const snapshot = await getDocs(reservationsRef);

        const checkIns: CheckInOutData[] = [];

        snapshot.docs.forEach(docSnap => {
            const data = docSnap.data();

            // Güvenli tarih dönüşümü
            const safeToDate = (field: any): Date => {
                if (!field) return new Date();
                if (field.toDate) return field.toDate();
                if (typeof field === 'string') return new Date(field);
                return new Date();
            };

            const baslangicTarihi = safeToDate(data.baslangic_tarihi);
            const bitisTarihi = safeToDate(data.bitis_tarihi);

            // Tarihleri normalize et (sadece gün, ay, yıl karşılaştırması)
            const normalizeDate = (d: Date) => {
                const normalized = new Date(d);
                normalized.setHours(0, 0, 0, 0);
                return normalized;
            };

            const checkDate = normalizeDate(date);
            const startDate = normalizeDate(baslangicTarihi);

            // Otel filtresi
            const hotelMatch = hotelName
                ? data.hotel?.toLowerCase().trim() === hotelName.toLowerCase().trim()
                : true;

            // Başlangıç tarihi kontrol tarihine eşitse
            if (startDate.getTime() === checkDate.getTime() && hotelMatch) {
                checkIns.push({
                    docId: docSnap.id,
                    id: data.id,
                    isim: data.isim,
                    giris_tarihi: safeToDate(data.giris_tarihi || data.baslangic_tarihi),
                    baslangic_tarihi: baslangicTarihi,
                    bitis_tarihi: bitisTarihi,
                    pax: data.pax || 0,
                    cocuk_sayisi: data.cocuk_sayisi || 0,
                    bebek_sayisi: data.bebek_sayisi || 0,
                    ucret: data.ucret || "₺0.00",
                    tur: data.tur || "Normal",
                    room_code: data.room_code ? String(data.room_code) : null,
                    room_no: data.room_code ? Number(data.room_code) : undefined,
                    hotel: data.hotel || null,
                    checked_in: data.checked_in || false
                });
            }
        });

        // İsme göre sırala
        return checkIns.sort((a, b) =>
            a.isim.localeCompare(b.isim, "tr", { sensitivity: "base" })
        );
    } catch (error) {
        console.error("Check-ins fetch error:", error);
        return [];
    }
};

/**
 * Belirli bir tarihteki çıkış yapacak rezervasyonları getirir
 * @param date - Kontrol edilecek tarih
 * @param hotelName - Otel adı (opsiyonel)
 */
export const getCheckOutsForDate = async (date: Date, hotelName?: string): Promise<CheckInOutData[]> => {
    try {
        const reservationsRef = collection(db, "reservations");
        const snapshot = await getDocs(reservationsRef);

        const checkOuts: CheckInOutData[] = [];

        snapshot.docs.forEach(docSnap => {
            const data = docSnap.data();

            // Güvenli tarih dönüşümü
            const safeToDate = (field: any): Date => {
                if (!field) return new Date();
                if (field.toDate) return field.toDate();
                if (typeof field === 'string') return new Date(field);
                return new Date();
            };

            const baslangicTarihi = safeToDate(data.baslangic_tarihi);
            const bitisTarihi = safeToDate(data.bitis_tarihi);

            // Tarihleri normalize et (sadece gün, ay, yıl karşılaştırması)
            const normalizeDate = (d: Date) => {
                const normalized = new Date(d);
                normalized.setHours(0, 0, 0, 0);
                return normalized;
            };

            const checkDate = normalizeDate(date);
            const endDate = normalizeDate(bitisTarihi);

            // Otel filtresi
            const hotelMatch = hotelName
                ? data.hotel?.toLowerCase().trim() === hotelName.toLowerCase().trim()
                : true;

            // Bitiş tarihi kontrol tarihine eşitse
            if (endDate.getTime() === checkDate.getTime() && hotelMatch) {
                checkOuts.push({
                    docId: docSnap.id,
                    id: data.id,
                    isim: data.isim,
                    giris_tarihi: safeToDate(data.giris_tarihi || data.baslangic_tarihi),
                    baslangic_tarihi: baslangicTarihi,
                    bitis_tarihi: bitisTarihi,
                    pax: data.pax || 0,
                    cocuk_sayisi: data.cocuk_sayisi || 0,
                    bebek_sayisi: data.bebek_sayisi || 0,
                    ucret: data.ucret || "₺0.00",
                    tur: data.tur || "Normal",
                    room_code: data.room_code ? String(data.room_code) : null,
                    room_no: data.room_code ? Number(data.room_code) : undefined,
                    hotel: data.hotel || null,
                    checked_out: data.checked_out || false
                });
            }
        });

        // İsme göre sırala
        return checkOuts.sort((a, b) =>
            a.isim.localeCompare(b.isim, "tr", { sensitivity: "base" })
        );
    } catch (error) {
        console.error("Check-outs fetch error:", error);
        return [];
    }
};

/**
 * Rezervasyonun giriş yapıldı durumunu günceller
 * @param docId - Rezervasyon doküman ID'si
 * @param checkedIn - Giriş yapıldı mı?
 */
export const updateCheckInStatus = async (docId: string, checkedIn: boolean): Promise<void> => {
    try {
        const reservationRef = doc(db, "reservations", docId);
        await updateDoc(reservationRef, {
            checked_in: checkedIn
        });
    } catch (error) {
        console.error("Check-in status update error:", error);
        throw error;
    }
};

/**
 * Rezervasyonun çıkış yapıldı durumunu günceller
 * @param docId - Rezervasyon doküman ID'si
 * @param checkedOut - Çıkış yapıldı mı?
 */
export const updateCheckOutStatus = async (docId: string, checkedOut: boolean): Promise<void> => {
    try {
        const reservationRef = doc(db, "reservations", docId);
        await updateDoc(reservationRef, {
            checked_out: checkedOut
        });
    } catch (error) {
        console.error("Check-out status update error:", error);
        throw error;
    }
};
