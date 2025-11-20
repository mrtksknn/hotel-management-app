import { ReservationData } from "../../services/reservationsService";

export const calculateNights = (start: Date, end: Date) => {
    const diff = new Date(end).getTime() - new Date(start).getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export const calculateGeceleme = (res: ReservationData) => {
    const nights = calculateNights(res.baslangic_tarihi, res.bitis_tarihi);
    return (res.pax + res.cocuk_sayisi * 0.5 + res.bebek_sayisi * 0) * nights;
};

export const formatDate = (date: Date) => {
    if (!date) return "";
    return new Intl.DateTimeFormat("tr-TR").format(new Date(date));
};

export const getDateColors = (res: ReservationData) => {
    const today = new Date();
    const start = new Date(res.baslangic_tarihi);
    const end = new Date(res.bitis_tarihi);

    // Reset hours to compare dates only
    today.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    if (today.getTime() === start.getTime()) return { bg: "orange.50", color: "orange.600" };
    if (today > start && today <= end) return { bg: "green.50", color: "green.600" };
    if (today > end) return { bg: "red.50", color: "red.600" };
    return { bg: "blue.50", color: "blue.600" };
};

export const parseUcret = (ucretStr: string) => {
    if (!ucretStr) return 0;
    const normalized = ucretStr.replace(/\./g, '').replace(',', '.');
    return parseFloat(normalized) || 0;
};

export const getTurColor = (tur: string) => {
    const colors: Record<string, string> = {
        "ETS": "green",
        "Otelz": "blue",
        "Jolly": "red",
        "TatilBudur": "orange",
        "Setur": "purple",
        "Booking": "cyan",
        "Expedia": "yellow",
        "HotelRunner": "pink",
        "Kapı": "teal",
        "Telefon": "indigo",
    };

    if (colors[tur]) return colors[tur];

    const palette = [
        "red", "orange", "yellow", "green", "teal", "blue", "cyan",
        "purple", "pink", "gray"
    ];

    let hash = 0;
    for (let i = 0; i < tur.length; i++) {
        hash = tur.charCodeAt(i) + ((hash << 5) - hash);
    }

    return palette[Math.abs(hash) % palette.length];
};
