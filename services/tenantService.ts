import { db } from "../lib/firebaseClient";
import { collection, query, where, getDocs } from "firebase/firestore";

/**
 * Verilen otel adının başka bir "owner" (patron) tarafından
 * kullanılıp kullanılmadığını kontrol eder.
 * @param hotelName Doğrulanacak otel ismi
 * @returns boolean Eğer kullanılabilirse (boşsa) true döner.
 */
export const checkHotelNameAvailability = async (hotelName: string): Promise<boolean> => {
    if (!hotelName || hotelName.trim().length === 0) return false;

    try {
        const hotelsCollection = collection(db, "hotels");
        
        // Bu isimde bir otel var mı test ediyoruz.
        const q = query(
            hotelsCollection, 
            where("name", "==", hotelName.trim())
        );
        
        const snapshot = await getDocs(q);
        return snapshot.empty; // Eğer kimse yoksa true dönecek.
    } catch (error) {
        console.error("Otel adı uygunluk kontrolünde hata:", error);
        throw new Error("Otel adı doğrulanırken sunucu hatası oluştu.");
    }
};
