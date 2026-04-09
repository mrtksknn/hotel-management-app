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
 * Generates seasonal info for display purposes.
 */
export const getSeasonInfo = (activeMonths: number[]) => {
    const activeCount = activeMonths?.length || 0;
    const isFullYear = activeCount === 12;

    return {
        label: isFullYear ? "Tüm Yıl" : `${activeCount} Ay Aktif`,
        colorScheme: isFullYear ? "green" : "orange",
        isFullYear
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
