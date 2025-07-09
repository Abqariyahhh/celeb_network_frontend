"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function Navbar() {
  const { user, token, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);

  // Sync dark mode with class on <html>
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  // Restore saved theme on first render
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") setDarkMode(true);
  }, []);

  const linkStyle = (href: string) =>
    `hover:underline transition text-sm ${
      pathname === href ? "underline font-semibold text-blue-400" : ""
    }`;

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <nav className="bg-zinc-800 text-white px-6 py-4 flex justify-between items-center shadow-md">
      <Link href="/" className="text-xl font-bold hover:opacity-90">
        🎤 CelebConnect
      </Link>

      <div className="flex items-center space-x-6">
        <Link href="/" className={linkStyle("/")}>Home</Link>
        <Link href="/celebrity-signup" className={linkStyle("/celebrity-signup")}>Add Celebrity</Link>

        {token ? (
          <>
            <Link href="/fan-dashboard" className={linkStyle("/fan-dashboard")}>Dashboard</Link>
            <button onClick={handleLogout} className="text-sm text-red-400 hover:underline">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className={linkStyle("/login")}>Login</Link>
            <Link href="/register" className={linkStyle("/register")}>Register</Link>
          </>
        )}

     
      
      </div>
    </nav>
  );
}
