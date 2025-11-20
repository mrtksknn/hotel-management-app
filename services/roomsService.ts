import { db } from "../lib/firebaseClient";
import { collection, getDocs, doc, updateDoc, arrayUnion, Timestamp } from "firebase/firestore";
import { Room } from "../app/rooms/types";

export const getRooms = async (): Promise<Room[]> => {
    try {
        const roomsCollection = collection(db, "rooms");
        const snapshot = await getDocs(roomsCollection);

        let rooms: Room[] = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                floor: data.floor,
                no: data.no,
                code: data.kod || undefined,
                docId: doc.id
            } as Room & { docId: string };
        });

        const grouped: Record<number, Room[]> = {};
        rooms.forEach(room => {
            if (!grouped[room.floor]) grouped[room.floor] = [];
            grouped[room.floor].push(room);
        });

        const sortedRooms: Room[] = [];
        [1, 2, 3, 4, 5].forEach(floor => {
            if (grouped[floor]) {
                const sortedFloor = grouped[floor].sort((a, b) => a.no - b.no);
                sortedRooms.push(...sortedFloor);
            }
        });

        return sortedRooms;
    } catch (error) {
        console.error("Rooms fetch error:", error);
        return [];
    }
};

export const getAvailableRooms = async (start: Date, end: Date): Promise<Room[]> => {

    // 🔹 tüm odalar
    const roomsSnap = await getDocs(collection(db, "rooms"));
    const allRooms: Room[] = roomsSnap.docs.map(d => ({
        floor: d.data().floor,
        no: d.data().no,
        code: d.data().kod || d.data().code
    }));

    // 🔹 tüm rezervasyonlar
    const resSnap = await getDocs(collection(db, "reservations"));
    const reservations = resSnap.docs.map(doc => {
        const data = doc.data();
        return {
            room_no: Number(data.room_code),
            start: data.baslangic_tarihi.toDate(),
            end: data.bitis_tarihi.toDate()
        };
    });

    // 🔥 tarih çakışması kontrolü room.no üzerinden
    const isBlocked = (roomNo: number) => {
        return reservations.some(r =>
            r.room_no === roomNo &&
            !(end <= r.start || start >= r.end)
        );
    };

    return allRooms.filter(room => !isBlocked(room.no));
};

// 🔥 Rezervasyon sonrası odanın tarihlerini işleme fonksiyonu
export const blockRoomDates = async (
    roomNo: number,          // 🔥 Artık no üzerinden çalışıyor
    start: Date,
    end: Date
) => {
    const roomsRef = collection(db, "rooms");
    const snapshot = await getDocs(roomsRef);

    // 🔥 doğru oda dokümanını no üzerinden bul
    const roomDoc = snapshot.docs.find(doc => doc.data().no === roomNo);

    if (!roomDoc) {
        console.error("Oda bulunamadı (room.no):", roomNo);
        return;
    }

    // Firestore'da tarihleri ekle (blockedDates array'i)
    await updateDoc(roomDoc.ref, {
        blockedDates: arrayUnion({
            start: Timestamp.fromDate(start),
            end: Timestamp.fromDate(end)
        })
    });

    console.log("blockedDates güncellendi → Oda:", roomNo);
};