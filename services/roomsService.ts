import { db } from "../lib/firebaseClient";
import { collection, getDocs } from "firebase/firestore";
import { Room } from "../app/rooms/types";

export const getRooms = async (): Promise<Room[]> => {
    try {
        const roomsCollection = collection(db, "rooms");
        const snapshot = await getDocs(roomsCollection);

        // Firestore'dan gelen raw veriler
        let rooms: Room[] = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                floor: data.floor,
                no: data.no,
                code: data.kod || undefined
            } as Room;
        });

        // 🔹 Katlara göre gruplandır ve her katı kendi içinde no değerine göre sırala
        const grouped: Record<number, Room[]> = {};

        rooms.forEach(room => {
            if (!grouped[room.floor]) grouped[room.floor] = [];
            grouped[room.floor].push(room);
        });

        // Kat sırasına göre (1'den 5'e) ve her kat içinde no'ya göre sırala
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
