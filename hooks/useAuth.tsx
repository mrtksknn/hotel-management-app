"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { findUserByEmail, User } from "../services/userService";

interface AuthContextType {
  user: User | null;
  login: (email: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    // LocalStorage’dan kullanıcıyı oku
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string) => {
    try {
      // E-posta adresini tüm otel koleksiyonlarında ara
      const foundUser = await findUserByEmail(email);

      if (foundUser) {
        setUser(foundUser);
        localStorage.setItem("user", JSON.stringify(foundUser));
        router.push("/dashboard");
      } else {
        console.error("Kullanıcı sistemde bulunamadı!");
        alert("Kullanıcı sistemde bulunamadı! Lütfen e-posta adresinizi kontrol edin.");
      }
    } catch (error) {
      console.error("Giriş işlemi sırasında hata oluştu:", error);
      alert("Giriş işlemi sırasında bir hata oluştu.");
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
