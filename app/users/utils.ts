import { Users, UserCheck, ShieldCheck, Home, Utensils, Wrench } from "lucide-react";

export const TEAMS = [
    { value: "owner", label: "Sahip (Owner)" },
    { value: "management", label: "Yönetim (Management)" },
    { value: "reception", label: "Resepsiyon (Reception)" },
    { value: "housekeeping", label: "Kat Hizmetleri (Housekeeping)" },
    { value: "kitchen", label: "Mutfak / Restoran (Kitchen)" },
    { value: "technical", label: "Teknik Servis (Technical)" },
];

export const INITIAL_FORM_STATE = {
    name: "",
    email: "",
    password: "",
    team: "reception",
    title: "",
    hotel: "",
};

export const getStatsArray = (stats: any) => [
    { title: "Toplam Personel", count: stats?.totalStaffs || 0, icon: Users, color: "blue" },
    { title: "Yöneticiler", count: stats?.managers || 0, icon: ShieldCheck, color: "purple" },
    { title: "Resepsiyon", count: stats?.receptionists || 0, icon: UserCheck, color: "green" },
    { title: "Kat Hizmetleri", count: stats?.housekeepers || 0, icon: Home, color: "orange" },
    { title: "Mutfak / Restoran", count: stats?.kitchen || 0, icon: Utensils, color: "red" },
    { title: "Teknik Servis", count: stats?.technical || 0, icon: Wrench, color: "teal" },
];
