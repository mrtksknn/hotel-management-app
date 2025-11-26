import { db } from "@/lib/firebaseClient";
import { collection, addDoc, getDocs, query, where, Timestamp, deleteDoc, doc, updateDoc } from "firebase/firestore";

export interface TourPriceDefinition {
    id?: string;
    hotel: string;
    tourName: string;
    startDate: Date;
    endDate: Date;
    adultPrice: string | number;
    childDiscount: number; // Örn: 0.7 (Yetişkin fiyatının %70'i)
}

const COLLECTION_NAME = "tour_prices";

export const getTourPrices = async (hotel: string, year?: number): Promise<TourPriceDefinition[]> => {
    try {
        const q = query(
            collection(db, COLLECTION_NAME),
            where("hotel", "==", hotel)
        );

        const snapshot = await getDocs(q);
        let data = snapshot.docs.map(doc => {
            const d = doc.data();
            return {
                id: doc.id,
                ...d,
                startDate: d.startDate.toDate(),
                endDate: d.endDate.toDate()
            };
        }) as TourPriceDefinition[];

        // Yıla göre filtrele
        if (year) {
            data = data.filter(d => d.startDate.getFullYear() === year);
        }

        // İstemci tarafında sıralama (Tur adı ve Tarihe göre)
        return data.sort((a, b) => {
            if (a.tourName === b.tourName) {
                return a.startDate.getTime() - b.startDate.getTime();
            }
            return a.tourName.localeCompare(b.tourName);
        });
    } catch (error) {
        console.error("Error fetching tour prices:", error);
        return [];
    }
};

export const addTourPrice = async (priceDef: Omit<TourPriceDefinition, 'id'>) => {
    try {
        await addDoc(collection(db, COLLECTION_NAME), {
            ...priceDef,
            startDate: Timestamp.fromDate(priceDef.startDate),
            endDate: Timestamp.fromDate(priceDef.endDate)
        });
    } catch (error) {
        console.error("Error adding tour price:", error);
        throw error;
    }
};

export const deleteTourPrice = async (id: string) => {
    try {
        await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (error) {
        console.error("Error deleting tour price:", error);
        throw error;
    }
};

export const updateTourPrice = async (id: string, priceDef: Partial<TourPriceDefinition>) => {
    try {
        const dataToUpdate: any = { ...priceDef };
        if (priceDef.startDate) dataToUpdate.startDate = Timestamp.fromDate(priceDef.startDate);
        if (priceDef.endDate) dataToUpdate.endDate = Timestamp.fromDate(priceDef.endDate);

        await updateDoc(doc(db, COLLECTION_NAME, id), dataToUpdate);
    } catch (error) {
        console.error("Error updating tour price:", error);
        throw error;
    }
};
