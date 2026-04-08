import { db } from "@/lib/firebaseClient";
import { collection, addDoc, serverTimestamp, query, where, orderBy, limit, getDocs, Timestamp } from "firebase/firestore";

export interface ActivityLog {
    id?: string;
    hotelId: string;
    userId: string;
    userName: string;
    action: 'CREATE_USER' | 'UPDATE_USER' | 'DELETE_USER' | 'CREATE_HOTEL' | 'UPDATE_HOTEL' | 'LOGIN' | 'LOGOUT';
    description: string;
    timestamp: Timestamp;
}

/**
 * 🔹 Yeni bir aktivite kaydet
 */
export async function logActivity(
    hotelId: string,
    userId: string,
    userName: string,
    action: ActivityLog['action'],
    description: string
) {
    try {
        const logsRef = collection(db, "activityLogs");
        await addDoc(logsRef, {
            hotelId,
            userId,
            userName,
            action,
            description,
            timestamp: serverTimestamp(),
        });
    } catch (error) {
        console.error("Aktivite loglanırken hata oluştu:", error);
    }
}

/**
 * 🔹 Son aktiviteleri getir
 */
export async function getActivityLogs(hotelId: string, maxLogs: number = 10): Promise<ActivityLog[]> {
    try {
        const logsRef = collection(db, "activityLogs");
        const q = query(
            logsRef,
            where("hotelId", "==", hotelId),
            orderBy("timestamp", "desc"),
            limit(maxLogs)
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as ActivityLog[];
    } catch (error) {
        console.error("Aktivite logları getirilirken hata oluştu:", error);
        return [];
    }
}
