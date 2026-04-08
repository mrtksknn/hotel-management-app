// services/userService.ts
import { db, auth } from "@/lib/firebaseClient";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, updateDoc, getDoc, query, collection, where, getDocs, setDoc, deleteDoc, getCountFromServer } from "firebase/firestore";
import { logActivity } from "./activityService";


export interface User {
    id?: string;
    uid: string;
    name: string;
    email: string;
    title: string;
    team: string;
    role: string;
    hotelIds: string[];
    subscriptionPlan: string;
    trialExpiresAt?: string;
}

// 🔹 Kullanıcı istatistiklerini getir (getCountFromServer ile optimize edildi)
export async function getUsersStats(hotelId?: string) {
    if (!hotelId) return { totalStaffs: 0, managers: 0, receptionists: 0, housekeepers: 0, kitchen: 0, technical: 0 };

    const usersRef = collection(db, "users");
    const baseQuery = query(usersRef, where("hotelIds", "array-contains", hotelId));

    // Her ekip için ayrı sayfa indirmeden 'count' bilgisini çekiyoruz
    const [totalSnap, managersSnap, receptionistsSnap, housekeepersSnap, kitchenSnap, technicalSnap] = await Promise.all([
        getCountFromServer(baseQuery),
        getCountFromServer(query(baseQuery, where("team", "==", "management"))),
        getCountFromServer(query(baseQuery, where("team", "==", "reception"))),
        getCountFromServer(query(baseQuery, where("team", "==", "housekeeping"))),
        getCountFromServer(query(baseQuery, where("team", "==", "kitchen"))),
        getCountFromServer(query(baseQuery, where("team", "==", "technical")))
    ]);

    return {
        totalStaffs: totalSnap.data().count,
        managers: managersSnap.data().count,
        receptionists: receptionistsSnap.data().count,
        housekeepers: housekeepersSnap.data().count,
        kitchen: kitchenSnap.data().count,
        technical: technicalSnap.data().count
    };
}

// 🔹 Kullanıcı listesini getir
export async function getUsersList(hotelId?: string): Promise<User[]> {
    const usersRef = collection(db, "users");

    // hotelId parametresi varsa filtrele
    const q = hotelId
        ? query(usersRef, where("hotelIds", "array-contains", hotelId))
        : usersRef;

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    })) as User[];
}

// 🔹 Yeni kullanıcı ekle (Auth + Firestore)
export async function addUser(name: string, email: string, password: string, team: string, title: string, hotelId: string, performer?: { uid: string, name: string }) {
    try {
        // 1️⃣ Auth'a ekle
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const uid = userCredential.user.uid;

        // 2️⃣ Firestore'a aynı UID ile kaydet
        const userData: User = {
            uid,
            name,
            email,
            team,
            title,
            role: 'employee', // User eklerken varsayılan employee
            hotelIds: [hotelId],
            subscriptionPlan: 'Butik'
        };
        await setDoc(doc(db, "users", uid), userData);

        // 3️⃣ Logla
        if (performer) {
            await logActivity(
                hotelId,
                performer.uid,
                performer.name,
                'CREATE_USER',
                `${name} (${team}) personeli sisteme eklendi.`
            );
        }

        return userData;
    } catch (error) {
        console.error("Kullanıcı eklenirken hata:", error);
        throw error;
    }
}

// 🔹 Kullanıcı bilgilerini güncelle
export async function updateUser(docIdOrUid: string, updates: Partial<User>, performer?: { uid: string, name: string }) {
    try {
        // 1) Deneme: doğrudan doc id ile update etmeye çalış
        const directRef = doc(db, "users", docIdOrUid);

        // check if exists
        const snap = await getDoc(directRef);
        if (snap.exists()) {
            await updateDoc(directRef, updates);
            // Logla
            if (performer) {
                const hotelId = snap.data().hotelIds?.[0];
                await logActivity(
                    hotelId,
                    performer.uid,
                    performer.name,
                    'UPDATE_USER',
                    `${snap.data().name} isimli personelin bilgileri güncellendi.`
                );
            }
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
export async function deleteUserFromFirestore(userId: string, hotelId: string, performer?: { uid: string, name: string }) {
    const userRef = doc(db, "users", userId);
    const snap = await getDoc(userRef);
    const userName = snap.exists() ? snap.data().name : "Bilinmeyen Kullanıcı";

    await deleteDoc(userRef);

    if (performer && hotelId) {
        await logActivity(
            hotelId,
            performer.uid,
            performer.name,
            'DELETE_USER',
            `${userName} isimli personel sistemden silindi.`
        );
    }
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
            uid: docData.uid,
            name: docData.name,
            email: docData.email,
            role: docData.role,
            team: docData.team || 'management',
            title: docData.title || '',
            hotelIds: docData.hotelIds || [],
            subscriptionPlan: docData.subscriptionPlan,
            trialExpiresAt: docData.trialExpiresAt
        } as User;
    }
    return null;
}
