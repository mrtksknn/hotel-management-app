import { db } from "../lib/firebaseClient";
import { collection, getDocs, addDoc, deleteDoc, doc, query, where, updateDoc } from "firebase/firestore";

export interface HotelOwner {
    id?: string;
    name: string;
    email: string;
    hotel: string;
    role: string;
    createdAt?: Date;
}

// Owner rolündeki kullanıcıları getir
export const getOwners = async (): Promise<HotelOwner[]> => {
    try {
        const usersCollection = collection(db, "users");
        const q = query(usersCollection, where("role", "==", "owner"));
        const snapshot = await getDocs(q);

        const owners: HotelOwner[] = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.name || "",
                email: data.email || "",
                hotel: data.hotel || "",
                role: data.role || "owner",
                createdAt: data.createdAt?.toDate() || new Date()
            };
        });

        return owners.sort((a, b) => a.hotel.localeCompare(b.hotel, "tr"));
    } catch (error) {
        console.error("Error fetching owners:", error);
        return [];
    }
};

// Yeni owner ekle
export const addOwner = async (ownerData: Omit<HotelOwner, 'id' | 'role'>): Promise<void> => {
    try {
        const usersCollection = collection(db, "users");
        await addDoc(usersCollection, {
            ...ownerData,
            role: "owner",
            createdAt: new Date()
        });
    } catch (error) {
        console.error("Error adding owner:", error);
        throw error;
    }
};

// Owner güncelle
export const updateOwner = async (id: string, ownerData: Partial<HotelOwner>): Promise<void> => {
    try {
        const ownerDoc = doc(db, "users", id);
        await updateDoc(ownerDoc, {
            ...ownerData,
            role: "owner" // Role her zaman owner kalmalı
        });
    } catch (error) {
        console.error("Error updating owner:", error);
        throw error;
    }
};

// Owner sil
export const deleteOwner = async (id: string): Promise<void> => {
    try {
        const ownerDoc = doc(db, "users", id);
        await deleteDoc(ownerDoc);
    } catch (error) {
        console.error("Error deleting owner:", error);
        throw error;
    }
};
