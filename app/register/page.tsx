"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerUser } from "@/lib/authService";

export default function RegisterPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [error, setError] = useState("");

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await registerUser(name, email, password);
            router.push("/login"); // Kayıt sonrası login sayfasına yönlendir
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <form onSubmit={handleRegister} className="bg-white p-8 rounded-2xl shadow-md w-96 space-y-4">
                <h1 className="text-2xl font-semibold text-center mb-4">Kayıt Ol</h1>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <input
                    type="text"
                    placeholder="Ad Soyad"
                    className="w-full border p-2 rounded"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                <input
                    type="email"
                    placeholder="E-posta"
                    className="w-full border p-2 rounded"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Şifre"
                    className="w-full border p-2 rounded"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit" className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition">
                    Kayıt Ol
                </button>
                <p className="text-center text-sm mt-2">
                    Zaten hesabın var mı?{" "}
                    <Link href="/login" className="text-blue-600 hover:underline">
                        Giriş Yap
                    </Link>
                </p>
            </form>
        </div>
    );
}
