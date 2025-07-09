"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();
  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // 1. Register the user
      const registerRes = await fetch("http://localhost:3001/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!registerRes.ok) throw new Error("Registration failed");

      // 2. Login the user
      const loginRes = await fetch("http://localhost:3001/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!loginRes.ok) throw new Error("Login failed");

      const loginData = await loginRes.json();
      const token = loginData.access_token;

      // 3. Register fan profile (requires token)
      const fanProfileRes = await fetch("http://localhost:3001/fan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.username, // or ask for fan name separately
          email: `${form.username}@fanmail.com`, // mock email or collect separately
          password: form.password, // optional depending on your backend
        }),
      });

      if (!fanProfileRes.ok) throw new Error("Fan profile creation failed");

      const fanData = await fanProfileRes.json();

      // ✅ Store everything
      login(form.username, token); // sets context + localStorage
      localStorage.setItem("fanId", fanData.id); // fan profile ID
      router.push("/fan-dashboard");
    } catch (err: any) {
      setMessage(err.message || "Something went wrong");
    }

    setLoading(false);
  };

  return (
    <main className="max-w-md mx-auto p-6 bg-white dark:bg-zinc-900 rounded shadow">
      <h1 className="text-xl font-bold mb-4 text-center text-gray-900 dark:text-gray-100">
        Fan Registration
      </h1>

      <form onSubmit={handleRegister} className="space-y-4">
        <input
          name="username"
          type="text"
          value={form.username}
          onChange={handleChange}
          placeholder="Username"
          required
          className="w-full p-2 border rounded dark:bg-zinc-800 dark:text-gray-100"
        />
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Password"
          required
          className="w-full p-2 border rounded dark:bg-zinc-800 dark:text-gray-100"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded disabled:opacity-50"
        >
          {loading ? "Registering..." : "Register & Login"}
        </button>
      </form>

      {message && (
        <p className="mt-4 text-red-600 dark:text-red-400 text-center">{message}</p>
      )}
    </main>
  );
}
