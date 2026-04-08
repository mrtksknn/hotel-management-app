import { db } from "../lib/firebaseClient";
import { collection, onSnapshot, query, where } from "firebase/firestore";

export interface DashboardStats {
    todayRevenue: number;
    activeGuests: number;
    occupancyRate: number;
    pendingCheckIns: number;
    vipArrivals: { name: string; room: string; time: string; note: string; country: string }[];
    urgentRooms: { room: string; issue: string; level: "warning" | "error"; icon: string }[];
}

// 🔹 Eksik tipler burada tanımlandı (veya merkezi bir dosyadan çekilebilir)
interface Room {
    id: string;
    no: string | number;
    status: string;
    hotelId: string;
}

interface ReservationData {
    isim: string;
    ucret: string | number;
    pax?: number;
    tur?: string;
    room_code?: string;
    baslangic_tarihi: any;
    bitis_tarihi: any;
    checked_in?: boolean;
    checked_out?: boolean;
    hotelId: string;
}

/**
 * Dashboard verilerini gerçek zamanlı olarak dinler
 */
export const subscribeToDashboardStats = (hotelId: string, callback: (stats: DashboardStats) => void) => {
    const roomsRef = collection(db, "rooms");
    const resRef = collection(db, "reservations");

    // 🔹 Sorgu alanları "hotelId" olarak güncellendi
    const roomsQuery = query(roomsRef, where("hotelId", "==", hotelId));
    const resQuery = query(resRef, where("hotelId", "==", hotelId));

    let rooms: Room[] = [];
    let reservations: ReservationData[] = [];

    const calculate = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const safeToDate = (field: any): Date => {
            if (!field) return new Date();
            if (field.toDate) return field.toDate();
            if (typeof field === 'string') return new Date(field);
            if (typeof field === 'number') return new Date(field);
            return new Date();
        };

        const normalizeDate = (d: Date) => {
            const n = new Date(d);
            n.setHours(0, 0, 0, 0);
            return n;
        };

        const todayTime = today.getTime();

        // 1. Metrikler
        let todayRevenue = 0;
        let activeGuests = 0;
        let pendingCheckIns = 0;
        let occupiedRoomsCount = 0;

        reservations.forEach(res => {
            const start = normalizeDate(safeToDate(res.baslangic_tarihi)).getTime();
            const end = normalizeDate(safeToDate(res.bitis_tarihi)).getTime();
            
            // 💰 Ücreti sayıya çevir (Format farklarını temizle)
            let ucretStr = String(res.ucret || "0");
            // Eğer "1.500,00 ₺" ise -> "1500.00"
            const cleanedUcret = ucretStr
                .replace(/\s|[^\d,.-]/g, "") // Para birimi ve boşlukları temizle
                .replace(/\./g, "")           // Binlik ayracı (.) temizle
                .replace(",", ".");           // Ondalık ayracı (,) düzelt
            const ucret = parseFloat(cleanedUcret) || 0;

            // Bugün içeride olanlar
            if (res.checked_in && !res.checked_out) {
                activeGuests += (res.pax || 0);
                occupiedRoomsCount++;
                
                // Günlük ortalama geliri ekle
                const totalNights = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
                todayRevenue += (ucret / totalNights);
            }

            // Bugün check-in yapacaklar (Gelire dahil edilmemiş olabilir, isteğe bağlı eklenebilir)
            if (start === todayTime && !res.checked_in) {
                pendingCheckIns++;
            }
        });

        const totalRoomsArr = rooms.length || 1;
        const occupancyRate = Math.round((occupiedRoomsCount / (rooms.length || 1)) * 100);

        // 2. VIP Gelişler
        const vipArrivals = reservations
            .filter(res => {
                const start = normalizeDate(safeToDate(res.baslangic_tarihi)).getTime();
                return start === todayTime && !res.checked_in && (String(res.tur || "").includes("VIP") || (res.pax && res.pax > 3));
            })
            .map(res => ({
                name: res.isim,
                room: `${res.room_code || "---"}`,
                time: "14:00",
                note: res.tur || "Standart Rezervasyon",
                country: "🇹🇷"
            }));

        // 3. Acil Odalar
        const urgentRooms = rooms
            .filter(r => r.status === "KİRLİ")
            .map(r => ({
                room: String(r.no),
                issue: "Temizlik Bekliyor",
                level: "warning" as const,
                icon: "Brush"
            }));

        callback({
            todayRevenue: Math.round(todayRevenue),
            activeGuests,
            occupancyRate,
            pendingCheckIns,
            vipArrivals,
            urgentRooms
        });
    };

    const unsubRooms = onSnapshot(roomsQuery, (snap) => {
        rooms = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
        calculate();
    });

    const unsubRes = onSnapshot(resQuery, (snap) => {
        reservations = snap.docs.map(d => ({ docId: d.id, ...d.data() } as any));
        calculate();
    });

    return () => {
        unsubRooms();
        unsubRes();
    };
};
