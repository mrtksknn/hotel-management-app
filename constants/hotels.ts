export const HOTEL_INITIAL_FORM_STATE = {
    name: "",
    location: "",
    activeMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    seasonalConfig: {} as Record<string, number[]>,
};

export const HOTEL_YEAR_OPTIONS = [2024, 2025, 2026];
export const CURRENT_YEAR = new Date().getFullYear();

export const MONTHS = [
    { value: 1, label: "Ocak" },
    { value: 2, label: "Şubat" },
    { value: 3, label: "Mart" },
    { value: 4, label: "Nisan" },
    { value: 5, label: "Mayıs" },
    { value: 6, label: "Haziran" },
    { value: 7, label: "Temmuz" },
    { value: 8, label: "Ağustos" },
    { value: 9, label: "Eylül" },
    { value: 10, label: "Ekim" },
    { value: 11, label: "Kasım" },
    { value: 12, label: "Aralık" },
];
