// services/userService.ts
import { db, auth } from "@/lib/firebaseClient";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, updateDoc, getDoc, query, collection, where, getDocs, setDoc, deleteDoc } from "firebase/firestore";


export interface User {
    id?: string;
    name: string;
    email: string;
    role: string;
    hotel?: string;
}

// 🔹 Kullanıcı istatistiklerini getir
export async function getUsersStats() {
    const usersRef = collection(db, "users");
    const snapshot = await getDocs(usersRef);
    const users: User[] = snapshot.docs.map((doc) => doc.data() as User);

    const stats = {
        totalStaffs: users.length,
        managers: users.filter((u) => u.role === "manager").length,
        receptionists: users.filter((u) => u.role === "receptionist").length,
        housekeepers: users.filter((u) => u.role === "housekeeper").length,
    };

    return stats;
}

// 🔹 Kullanıcı listesini getir
export async function getUsersList(): Promise<User[]> {
    const usersRef = collection(db, "users");
    const snapshot = await getDocs(usersRef);
    return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    })) as User[];
}

// 🔹 Yeni kullanıcı ekle (Auth + Firestore)
export async function addUser(name: string, email: string, password: string, role: string, hotel: string) {
    try {
        // 1️⃣ Auth'a ekle
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const uid = userCredential.user.uid;

        // 2️⃣ Firestore'a aynı UID ile kaydet
        const userData: User = { id: uid, name, email, role, hotel };
        await setDoc(doc(db, "users", uid), userData);

        return userData;
    } catch (error) {
        console.error("Kullanıcı eklenirken hata:", error);
        throw error;
    }
}

// 🔹 Kullanıcı bilgilerini güncelle
export async function updateUser(docIdOrUid: string, updates: Partial<User>) {
    try {
        // 1) Deneme: doğrudan doc id ile update etmeye çalış
        const directRef = doc(db, "users", docIdOrUid);

        // check if exists
        const snap = await getDoc(directRef);
        if (snap.exists()) {
            await updateDoc(directRef, updates);
            return true;
        }

        // 2) Eğer doc yoksa, 'id' alanı veya 'email' ile ara (esnek fallback)
        const usersRef = collection(db, "users");

        // Öncelik: dokümanda id alanı varsa (ör. id alanı uid ise)
        const qByIdField = query(usersRef, where("id", "==", docIdOrUid));
        let qSnap = await getDocs(qByIdField);
        if (!qSnap.empty) {
            const docRef = qSnap.docs[0].ref;
            await updateDoc(docRef, updates);
            return true;
        }

        // 3) Eğer updates.email varsa e-postaya göre arama
        if (updates.email) {
            const qByEmail = query(usersRef, where("email", "==", updates.email));
            qSnap = await getDocs(qByEmail);
            if (!qSnap.empty) {
                const docRef = qSnap.docs[0].ref;
                await updateDoc(docRef, updates);
                return true;
            }
        }

        // 4) Son çare: upsert (doküman yoksa oluştur)
        // Burada document id olarak docIdOrUid kullanıyoruz — production'da dikkatli ol.
        const fallbackRef = doc(db, "users", docIdOrUid);
        await setDoc(fallbackRef, { ...updates, id: docIdOrUid }, { merge: true });
        return true;
    } catch (err: any) {
        console.error("updateUser hata:", err);
        throw err;
    }
}

// 🔹 Kullanıcıyı sil (Firestore + Auth)
export async function deleteUserFromFirestore(userId: string) {
    const userRef = doc(db, "users", userId);
    await deleteDoc(userRef);
}

// 🔹 E-posta adresine göre kullanıcıyı ara
export async function findUserByEmail(email: string): Promise<User | null> {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
        const docData = snapshot.docs[0].data();
        return {
            id: snapshot.docs[0].id,
            name: docData.name,
            email: docData.email,
            role: docData.role,
            hotel: docData.hotel
        } as User;
    }
    return null;
}
