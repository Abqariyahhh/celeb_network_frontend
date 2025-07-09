"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
  e.preventDefault();
  setMessage(null);
  setLoading(true);

  try {
    // Step 1: Login user
    const res = await fetch("https://xl2ro1gduf.execute-api.ap-south-1.amazonaws.com/dev/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Login failed");
    }

    const data = await res.json();
    const token = data.access_token;

    // Step 2: Save user and token in context + localStorage
    login(username, token);

    // Step 3: Fetch fan profile using token (fan/me)
    const fanRes = await fetch("https://xl2ro1gduf.execute-api.ap-south-1.amazonaws.com/dev/fan/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!fanRes.ok) {
      throw new Error("Fan profile not found");
    }

    const fanData = await fanRes.json();
    localStorage.setItem("fanId", fanData.id); // ✅ Store fanId

    // Step 4: Redirect
    router.push("/fan-dashboard");
  } catch (error: unknown) {
  if (error instanceof Error) setMessage(error.message || "Something went wrong");
}

  setLoading(false);
}

  return (
    <main className="max-w-md mx-auto p-6 bg-white dark:bg-zinc-900 rounded-lg shadow-lg mt-10">
      <h1 className="text-2xl font-bold mb-4 text-center text-gray-900 dark:text-gray-100">
        Fan Login
      </h1>

      <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="text"
          name="username"
          placeholder="Username"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded dark:bg-zinc-800 dark:border-zinc-700 dark:text-gray-100"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded dark:bg-zinc-800 dark:border-zinc-700 dark:text-gray-100"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      {message && (
        <p className="mt-4 text-center text-red-600 dark:text-red-400">
          {message}
        </p>
      )}
    </main>
  );
}
