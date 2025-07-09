"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Celebrity {
  id: number;
  name: string;
  category: string;
  country: string;
  fanbase: string;
  instagram: string;
}

function normalizeName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

export default function Home() {
  const [celebrities, setCelebrities] = useState<Celebrity[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [followedIds, setFollowedIds] = useState<number[]>([]);

  useEffect(() => {
    const fetchCelebrities = async () => {
      try {
        const res = await fetch("http://localhost:3001/celebrities");
        const data: Celebrity[] = await res.json();

        const uniqueMap = new Map<string, Celebrity>();
        data.forEach((celeb) => {
          const normalized = normalizeName(celeb.name);
          if (!uniqueMap.has(normalized)) {
            uniqueMap.set(normalized, celeb);
          }
        });

        setCelebrities(Array.from(uniqueMap.values()));
      } catch (err: unknown) {
  if (err instanceof Error) {
    console.error("Failed to fetch celebrities:", err.message);
  } else {
    console.error("Failed to fetch celebrities.");
  }
}
    };

    fetchCelebrities();
  }, []);

  const handleFollow = async (celebrityId: number) => {
    const fanId = localStorage.getItem("fanId");
    if (!fanId) return alert("Fan not logged in");

    try {
      const res = await fetch("http://localhost:3001/fan/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fanId, celebrityId }),
      });

      if (!res.ok) throw new Error("Failed to follow");

      alert("Followed successfully!");
      setFollowedIds((prev) => [...prev, celebrityId]);
    } catch (err: unknown) {
  if (err instanceof Error) {
    alert(err.message);
  } else {
    alert("Error following celebrity.");
  }
}
  };

  const filteredCelebs = celebrities.filter((c) =>
    [c.name, c.category, c.country].some((field) =>
      field.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-zinc-900 p-6 sm:p-12 font-sans">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-gray-100">
        Celebrity List
      </h1>

      <input
        type="text"
        placeholder="Search celebrities..."
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-6 w-full p-2 border rounded dark:bg-zinc-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-400"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {filteredCelebs.map((celebrity) => (
          <div
            key={celebrity.id}
            className="bg-white dark:bg-zinc-800 p-6 rounded-xl shadow hover:shadow-lg hover:scale-105 transition-transform border dark:border-zinc-700"
          >
            <Link href={`/celebrity/${celebrity.id}`}>
              <div>
                <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
                  {celebrity.name}
                </h2>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
                  {celebrity.category}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                  <span className="font-semibold">Country:</span> {celebrity.country}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  <span className="font-semibold">Fanbase:</span> {celebrity.fanbase}
                </p>
                <span className="inline-block text-blue-600 dark:text-blue-400 underline text-sm">
                  View Profile
                </span>
              </div>
            </Link>

            <button
              onClick={() => handleFollow(celebrity.id)}
              disabled={followedIds.includes(celebrity.id)}
              className={`mt-3 px-4 py-2 rounded text-white font-medium ${
                followedIds.includes(celebrity.id)
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {followedIds.includes(celebrity.id) ? "Following" : "Follow"}
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
