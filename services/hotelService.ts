import { db } from "../lib/firebaseClient";
import { collection, doc, setDoc, serverTimestamp, getDoc, query, where, getDocs, updateDoc, arrayUnion, getCountFromServer } from "firebase/firestore";
import { logActivity } from "./activityService";
import { PLAN_LIMITS, User } from "../types/user";
import { Hotel } from "../types/hotel";
import { v4 as uuidv4 } from "uuid";

// 🔹 Basit Önbellek (Hızlı ve Verimli Okuma için)
const statsCache: Record<string, { employeeCount: number, roomCount: number, timestamp: number }> = {};
const CACHE_DURATION = 30000; // 30 saniye

/**
 * Kullanıcının planına göre yeni bir otel ekleyip ekleyemeyeceğini kontrol eder.
 */
export const canAddMoreHotels = (user: User): boolean => {
    const limit = PLAN_LIMITS[user.subscriptionPlan] || 1;
    return (user.hotelIds?.length || 0) < limit;
};

/**
 * Sahibine göre otelleri getirir.
 */
export const getHotelsByOwner = async (ownerId: string): Promise<Hotel[]> => {
    const hotelsRef = collection(db, "hotels");
    const q = query(hotelsRef, where("ownerId", "==", ownerId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Hotel[];
};

/**
 * Otel istatistiklerini (Çalışan ve Oda sayısı) getirir.
 * getCountFromServer() kullanarak sadece sayı bilgisini çeker (Read Token tasarrufu sağlar).
 */
export const getHotelStats = async (hotelId: string) => {
    // Önbellek kontrolü
    const now = Date.now();
    if (statsCache[hotelId] && (now - statsCache[hotelId].timestamp < CACHE_DURATION)) {
        return statsCache[hotelId];
    }

    // Çalışan sayısı (Metadata bazlı hızlı sorgu)
    const usersRef = collection(db, "users");
    const usersQuery = query(usersRef, where("hotelIds", "array-contains", hotelId));
    const usersCountSnap = await getCountFromServer(usersQuery);
    
    // Oda sayısı (Metadata bazlı hızlı sorgu)
    const roomsRef = collection(db, "rooms");
    const roomsQuery = query(roomsRef, where("hotelId", "==", hotelId));
    const roomsCountSnap = await getCountFromServer(roomsQuery);

    const stats = {
        employeeCount: usersCountSnap.data().count,
        roomCount: roomsCountSnap.data().count,
        timestamp: now
    };

    statsCache[hotelId] = stats;
    return stats;
};

/**
 * Otel bilgilerini günceller.
 */
export const updateHotelData = async (hotelId: string, data: Partial<Hotel>, performer?: { uid: string, name: string }) => {
    const hotelRef = doc(db, "hotels", hotelId);
    const snap = await getDoc(hotelRef);
    const oldName = snap.exists() ? snap.data().name : "Otel";

    await updateDoc(hotelRef, data);

    if (performer) {
        await logActivity(
            hotelId,
            performer.uid,
            performer.name,
            'UPDATE_HOTEL',
            `${oldName} bilgileri ve lokasyonu güncellendi.`
        );
    }
};

/**
 * Yeni bir otel dökümanı oluşturur ve kullanıcıyla ilişkilendirir.
 */
export const createHotel = async (hotelName: string, location: string, ownerId: string, performer?: { uid: string, name: string }) => {
    const hotelId = uuidv4();
    const hotelRef = doc(db, "hotels", hotelId);
    
    const newHotel: Partial<Hotel> = {
        id: hotelId,
        name: hotelName.trim(),
        location: location.trim(),
        ownerId: ownerId,
        status: 'active',
        activeMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], // Default all
        settings: {
            currency: "TRY",
            checkInTime: "14:00",
            checkOutTime: "12:00",
            timezone: "Europe/Istanbul"
        },
        createdAt: serverTimestamp() as any
    };

    // 1️⃣ Oteli oluştur
    await setDoc(hotelRef, newHotel);

    // 2️⃣ Kullanıcının hotelIds dizisini güncelle
    const userRef = doc(db, "users", ownerId);
    await updateDoc(userRef, {
        hotelIds: arrayUnion(hotelId)
    });

    // 3️⃣ Logla
    if (performer) {
        await logActivity(
            hotelId,
            performer.uid,
            performer.name,
            'CREATE_HOTEL',
            `Yeni otel/tesis kaydı yapıldı: ${hotelName}`
        );
    }

    return hotelId;
};
