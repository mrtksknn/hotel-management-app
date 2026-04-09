import { Hotel } from "@/types/hotel";
import { MONTHS } from "@/constants/hotels";

/**
 * Extracts the year from a hotel's createdAt timestamp or returns a default year.
 */
export const getHotelYear = (hotel: Hotel): number => {
    if (!hotel.createdAt) return new Date().getFullYear();
    // Assuming Firebase Timestamp
    return (hotel.createdAt as any).toDate ? (hotel.createdAt as any).toDate().getFullYear() : new Date().getFullYear();
};

/**
 * Checks if a hotel is active during a specific month and year.
 */
export const isHotelActiveInPeriod = (hotel: Hotel, filterMonth: number, selectedYear: number): boolean => {
    // Month filter
    if (filterMonth !== 0 && !hotel.activeMonths?.includes(filterMonth)) {
        return false;
    }

    // Year filter logic
    const hotelYear = getHotelYear(hotel);
    if (selectedYear !== 0 && hotelYear > selectedYear) {
        return false;
    }

    return true;
};

/**
 * Filters a list of hotels based on seasonal and annual criteria.
 */
export const filterHotels = (hotels: any[], filterMonth: number, selectedYear: number) => {
    return hotels.filter(h => isHotelActiveInPeriod(h, filterMonth, selectedYear));
};

/**
 * Returns the active months for a specific year, implementing fallback logic.
 */
export const getActiveMonthsForYear = (hotel: Hotel, year: number): number[] => {
    const config = hotel.seasonalConfig || {};
    
    // 1. Check specific year
    if (config[year.toString()]) {
        return config[year.toString()];
    }

    // 2. Check previous year
    const prevYear = year - 1;
    if (config[prevYear.toString()]) {
        return config[prevYear.toString()];
    }

    // 3. Fallback to default activeMonths or all year
    return hotel.activeMonths || [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
};

/**
 * Generates seasonal info for display purposes, respecting current filters.
 */
export const getSeasonDisplayInfo = (hotel: Hotel, filterMonth: number, selectedYear: number) => {
    const hotelYear = getHotelYear(hotel);
    
    // If hotel was created in a future year relative to selection
    if (selectedYear < hotelYear) {
        return {
            label: "Kayıt Öncesi",
            colorScheme: "gray",
            isFullYear: false,
            isEmpty: true,
            currentMonths: []
        };
    }

    const activeMonths = getActiveMonthsForYear(hotel, selectedYear);
    const activeCount = activeMonths.length;
    const isFullYear = activeCount === 12;

    // If a specific month is selected
    if (filterMonth !== 0) {
        const isActiveThisMonth = activeMonths.includes(filterMonth);
        return {
            label: isActiveThisMonth ? "Bu Ay Aktif" : "Bu Ay Kapalı",
            colorScheme: isActiveThisMonth ? "green" : "red",
            isFullYear: false,
            isEmpty: false,
            currentMonths: activeMonths
        };
    }

    // Default view (All year or no month filter)
    return {
        label: isFullYear ? "Tüm Yıl" : `${activeCount} Ay Aktif`,
        colorScheme: isFullYear ? "green" : "orange",
        isFullYear,
        isEmpty: false,
        currentMonths: activeMonths
    };
};

/**
 * Generates a descriptive tooltip of active months.
 */
export const getSeasonTooltip = (activeMonths: number[]) => {
    if (!activeMonths || activeMonths.length === 0) return "Aktif mevsim belirtilmemiş";
    return activeMonths
        .map(m => MONTHS.find(mon => mon.value === m)?.label)
        .filter(Boolean)
        .join(", ");
};
