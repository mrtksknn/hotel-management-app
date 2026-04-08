import { db } from "../lib/firebaseClient";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { Room } from "@/app/rooms/types";
import { CheckInOutData } from "./checkInOutService";

export interface DashboardStats {
    todayRevenue: number;
    activeGuests: number;
    occupancyRate: number;
    pendingCheckIns: number;
    vipArrivals: { name: string; room: string; time: string; note: string; country: string }[];
    urgentRooms: { room: string; issue: string; level: "warning" | "error"; icon: string }[];
}

/**
 * Dashboard verilerini gerçek zamanlı olarak dinler
 */
export const subscribeToDashboardStats = (hotelId: string, callback: (stats: DashboardStats) => void) => {
    const roomsRef = collection(db, "rooms");
    const resRef = collection(db, "reservations");

    const roomsQuery = query(roomsRef, where("hotel", "==", hotelId));
    const resQuery = query(resRef, where("hotel", "==", hotelId));

    let rooms: Room[] = [];
    let reservations: CheckInOutData[] = [];

    const calculate = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const safeToDate = (field: any): Date => {
            if (!field) return new Date();
            if (field.toDate) return field.toDate();
            if (typeof field === 'string') return new Date(field);
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
            const ucret = parseFloat(String(res.ucret).replace(/[^\d.]/g, "").replace(".", "")) || 0;

            // Bugün içeride olanlar
            if (res.checked_in && !res.checked_out) {
                activeGuests += (res.pax || 0);
                occupiedRoomsCount++;
                
                // Bugün konaklayanların günlük ortalama ücretini gelire ekleyelim (basit mantık)
                const totalNights = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
                todayRevenue += (ucret / totalNights);
            }

            // Bugün check-in yapacaklar
            if (start === todayTime && !res.checked_in) {
                pendingCheckIns++;
            }
        });

        const totalRooms = rooms.length || 1;
        const occupancyRate = Math.round((occupiedRoomsCount / totalRooms) * 100);

        // 2. VIP Gelişler (Bugün gelen ve VIP paket/notu olanlar)
        const vipArrivals = reservations
            .filter(res => {
                const start = normalizeDate(safeToDate(res.baslangic_tarihi)).getTime();
                return start === todayTime && !res.checked_in && (String(res.tur).includes("VIP") || (res.pax && res.pax > 3));
            })
            .map(res => ({
                name: res.isim,
                room: `${res.room_code || "---"}`,
                time: "14:00", // Gerçek datada yoksa default
                note: res.tur || "Standart Rezervasyon",
                country: "🇹🇷" // Default
            }));

        // 3. Acil Odalar (KİRLİ olanlar)
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
        rooms = snap.docs.map(d => ({ id: d.id, ...d.data() } as unknown as Room));
        calculate();
    });

    const unsubRes = onSnapshot(resQuery, (snap) => {
        reservations = snap.docs.map(d => ({ docId: d.id, ...d.data() } as CheckInOutData));
        calculate();
    });

    return () => {
        unsubRooms();
        unsubRes();
    };
};
