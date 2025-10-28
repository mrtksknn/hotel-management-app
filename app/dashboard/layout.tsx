"use client";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading]);

  if (loading) return <p className="text-center mt-10">Yükleniyor...</p>;

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
        <h1 className="font-bold text-lg">Dashboard</h1>
        <button onClick={handleLogout} className="text-sm bg-red-500 px-3 py-1 rounded hover:bg-red-600">
          Çıkış Yap
        </button>
      </header>
      <main className="flex-1 p-6 bg-gray-50">{children}</main>
    </div>
  );
}
