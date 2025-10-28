"use client";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardPage() {
    const { user } = useAuth();

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Hoşgeldin 👋</h2>
            <p className="text-gray-700">
                {user?.email} olarak giriş yaptın.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="p-4 bg-white shadow rounded">📊 İstatistikler</div>
                <div className="p-4 bg-white shadow rounded">📅 Etkinlikler</div>
                <div className="p-4 bg-white shadow rounded">💬 Bildirimler</div>
            </div>
        </div>
    );
}
