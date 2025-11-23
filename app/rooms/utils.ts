import { ReservationData } from "@/services/reservationsService";

export const getReservationsForRoom = (
    reservations: ReservationData[],
    roomNo: number,
    year: number,
    monthIndex: number,
    startDay: number,
    dayCount: number
) => {
    return reservations.filter(res => {
        if (!res.room_code || res.room_code !== String(roomNo)) return false;

        const start = new Date(res.baslangic_tarihi);
        const end = new Date(res.bitis_tarihi);
        const monthStart = new Date(year, monthIndex, startDay);
        const monthEnd = new Date(year, monthIndex, startDay + dayCount - 1);

        return start <= monthEnd && end >= monthStart;
    });
};

export const getReservationStatusColor = (reservation: ReservationData, year: number) => {
    const today = new Date(year, 6, 12); // Demo tarihi
    today.setHours(0, 0, 0, 0);

    const start = new Date(reservation.baslangic_tarihi);
    start.setHours(0, 0, 0, 0);

    const end = new Date(reservation.bitis_tarihi);
    end.setHours(0, 0, 0, 0);

    if (end < today) return "red";
    if (start > today) return "blue";
    if (start.getTime() === today.getTime()) return "yellow";
    return "green";
};

export const getReservationPosition = (
    reservation: ReservationData,
    year: number,
    monthIndex: number,
    startDay: number,
    dayCount: number
) => {
    const start = new Date(reservation.baslangic_tarihi);
    start.setHours(0, 0, 0, 0);

    const end = new Date(reservation.bitis_tarihi);
    end.setHours(0, 0, 0, 0);

    const monthStart = new Date(year, monthIndex, startDay);
    monthStart.setHours(0, 0, 0, 0);

    const startDayOfMonth = start < monthStart ? startDay : start.getDate();
    const lastDayOfMonth = startDay + dayCount - 1;
    const endDayOfMonth = end.getDate() > lastDayOfMonth ? lastDayOfMonth : end.getDate();

    const startIndex = startDayOfMonth - startDay;
    const fullDays = endDayOfMonth - startDayOfMonth;
    const width = fullDays;

    return {
        startIndex: startIndex,
        width: width,
    };
};

export const calculateStats = (reservations: ReservationData[], year: number) => {
    const today = new Date(year, 6, 12);
    today.setHours(0, 0, 0, 0);

    let totalNights = 0;
    let todayNights = 0;
    let totalPax = 0;
    let totalChildren = 0;
    let totalBabies = 0;
    let todayPax = 0;
    let todayChildren = 0;
    let todayBabies = 0;

    reservations.forEach(res => {
        const start = new Date(res.baslangic_tarihi);
        start.setHours(0, 0, 0, 0);

        const end = new Date(res.bitis_tarihi);
        end.setHours(0, 0, 0, 0);

        const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        totalNights += nights;

        totalPax += res.pax || 0;
        totalChildren += res.cocuk_sayisi || 0;
        totalBabies += res.bebek_sayisi || 0;

        if (today >= start && today < end) {
            todayNights += 1;
            todayPax += res.pax || 0;
            todayChildren += res.cocuk_sayisi || 0;
            todayBabies += res.bebek_sayisi || 0;
        }
    });

    const totalOvernightValue = totalPax + (totalChildren * 0.5);
    const todayOvernightValue = todayPax + (todayChildren * 0.5);

    return {
        totalNights, todayNights,
        totalPax, totalChildren, totalBabies,
        todayPax, todayChildren, todayBabies,
        totalOvernightValue, todayOvernightValue,
    };
};
