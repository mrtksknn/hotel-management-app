import { Users, UserCheck, ShieldCheck, Home, Utensils, Wrench } from "lucide-react";

import { USER_TEAMS, USER_INITIAL_FORM_STATE } from "@/constants/users";

export { USER_TEAMS, USER_INITIAL_FORM_STATE };

export const getStatsArray = (stats: any) => [
    { title: "Toplam Personel", count: stats?.totalStaffs || 0, icon: Users, color: "blue" },
    { title: "Yöneticiler", count: stats?.managers || 0, icon: ShieldCheck, color: "purple" },
    { title: "Resepsiyon", count: stats?.receptionists || 0, icon: UserCheck, color: "green" },
    { title: "Kat Hizmetleri", count: stats?.housekeepers || 0, icon: Home, color: "orange" },
    { title: "Mutfak / Restoran", count: stats?.kitchen || 0, icon: Utensils, color: "red" },
    { title: "Teknik Servis", count: stats?.technical || 0, icon: Wrench, color: "teal" },
];
