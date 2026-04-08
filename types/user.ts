import { Timestamp } from "firebase/firestore";

export type SubscriptionPlan = 'Butik' | 'standard' | 'premium';

export interface User {
    uid: string;
    name: string;
    email: string;
    title: string; // E.g. "Genel Müdür", "Şef"
    team: 'management' | 'reception' | 'housekeeping' | 'kitchen' | 'technical' | 'owner'; // Functional role
    role: 'owner' | 'manager' | 'employee'; // Top level role
    subscriptionPlan: SubscriptionPlan;
    trialExpiresAt?: string; // ISO String
    hotelIds: string[]; // List of unique hotel IDs owned/managed
    createdAt: Timestamp;
}

export const PLAN_LIMITS: Record<SubscriptionPlan, number> = {
    Butik: 1,
    standard: 2,
    premium: 5
};
