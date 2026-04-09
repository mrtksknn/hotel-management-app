import { Timestamp } from "firebase/firestore";
import { SubscriptionPlan } from "./user";

export interface Hotel {
    id: string;
    name: string;
    location?: string; // New field
    ownerId: string; // User ID of the owner
    status: 'active' | 'inactive' | 'suspended';
    settings: {
        currency: string;
        checkInTime: string;
        checkOutTime: string;
        timezone: string;
    };
    activeMonths: number[]; // Array of months (1-12) the hotel is active
    createdAt: Timestamp;
}

export interface Season {
    id: string;
    name: string;
    startDate: Timestamp;
    endDate: Timestamp;
    priceMultiplier: number;
    baseRates?: Record<string, number>; // roomId/typeId -> basePrice
}
