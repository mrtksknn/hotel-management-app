import { Users, UserCheck, ShieldCheck, Home } from "lucide-react";

export const getStatsArray = (stats: any) => [
    { title: "Total Staffs", count: stats?.totalStaffs || 0, icon: Users, color: "blue" },
    { title: "Managers", count: stats?.managers || 0, icon: ShieldCheck, color: "purple" },
    { title: "Receptionists", count: stats?.receptionists || 0, icon: UserCheck, color: "green" },
    { title: "Housekeepers", count: stats?.housekeepers || 0, icon: Home, color: "orange" },
];
