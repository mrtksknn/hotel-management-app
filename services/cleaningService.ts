import { db } from "../lib/firebaseClient";
import { collection, getDocs } from "firebase/firestore";
import { CheckInOutData } from "./checkInOutService";

export type CleaningType = 'daily' | 'checkout';

export interface CleaningTask {
    room_code: string;
    room_no: number;
    cleaningType: CleaningType;
    guestName: string;
    checkOutDate?: Date;
    lastCleaningDate?: Date;
    reservation?: CheckInOutData;
}

/**
 * Belirli bir tarih için temizlik planını oluşturur
 * @param date - Temizlik planı tarihi
 * @param hotelName - Otel adı (opsiyonel)
 */
export const getCleaningPlanForDate = async (date: Date, hotelName?: string): Promise<CleaningTask[]> => {
    try {
        const reservationsRef = collection(db, "reservations");
        const snapshot = await getDocs(reservationsRef);

        const cleaningTasks: CleaningTask[] = [];
        const normalizeDate = (d: Date) => {
            const normalized = new Date(d);
            normalized.setHours(0, 0, 0, 0);
            return normalized;
        };

        const targetDate = normalizeDate(date);

        snapshot.docs.forEach(docSnap => {
            const data = docSnap.data();

            // Güvenli tarih dönüşümü
            const safeToDate = (field: any): Date => {
                if (!field) return new Date();
                if (field.toDate) return field.toDate();
                if (typeof field === 'string') return new Date(field);
                return new Date();
            };

            const baslangicTarihi = normalizeDate(safeToDate(data.baslangic_tarihi));
            const bitisTarihi = normalizeDate(safeToDate(data.bitis_tarihi));

            // Otel filtresi
            const hotelMatch = hotelName
                ? data.hotel?.toLowerCase().trim() === hotelName.toLowerCase().trim()
                : true;

            if (!hotelMatch || !data.room_code) return;

            // 1. Çıkış yapacak odalar - Tam temizlik
            if (bitisTarihi.getTime() === targetDate.getTime()) {
                cleaningTasks.push({
                    room_code: String(data.room_code),
                    room_no: Number(data.room_code),
                    cleaningType: 'checkout',
                    guestName: data.isim,
                    checkOutDate: bitisTarihi,
                    reservation: {
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
                        room_code: String(data.room_code),
                        room_no: Number(data.room_code),
                        hotel: data.hotel || null
                    }
                });
            }
            // 2. Aktif rezervasyonlar - 2 günde bir temizlik
            else if (targetDate >= baslangicTarihi && targetDate < bitisTarihi) {
                // Rezervasyon başlangıcından bugüne kadar kaç gün geçti
                const daysSinceCheckIn = Math.floor(
                    (targetDate.getTime() - baslangicTarihi.getTime()) / (1000 * 60 * 60 * 24)
                );

                // 2 günde bir temizlik (1. gün, 3. gün, 5. gün...)
                // Giriş günü temizlik yok, 2. gün ilk temizlik
                if (daysSinceCheckIn > 0 && daysSinceCheckIn % 2 === 1) {
                    cleaningTasks.push({
                        room_code: String(data.room_code),
                        room_no: Number(data.room_code),
                        cleaningType: 'daily',
                        guestName: data.isim,
                        lastCleaningDate: new Date(targetDate.getTime() - 2 * 24 * 60 * 60 * 1000),
                        reservation: {
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
                            room_code: String(data.room_code),
                            room_no: Number(data.room_code),
                            hotel: data.hotel || null
                        }
                    });
                }
            }
        });

        // Önce temizlik tipine göre (checkout önce), sonra oda numarasına göre sırala
        return cleaningTasks.sort((a, b) => {
            if (a.cleaningType !== b.cleaningType) {
                return a.cleaningType === 'checkout' ? -1 : 1;
            }
            return a.room_no - b.room_no;
        });
    } catch (error) {
        console.error("Cleaning plan fetch error:", error);
        return [];
    }
};

/**
 * Temizlik tipine göre açıklama döndürür
 */
export const getCleaningDescription = (type: CleaningType): string => {
    if (type === 'checkout') {
        return 'Tam Temizlik: Nevresim değişimi, havlu değişimi, toz alma, tuvalet temizliği, genel temizlik';
    }
    return 'Günlük Temizlik: Havlu değişimi, çöp boşaltma, ayak üstü temizlik';
};

/**
 * Temizlik tipine göre renk şeması döndürür
 */
export const getCleaningColorScheme = (type: CleaningType): string => {
    return type === 'checkout' ? 'red' : 'blue';
};
