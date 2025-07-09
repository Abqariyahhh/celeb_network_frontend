"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface FollowedCelebrity {
  celebrityId: number;
  celebrityName: string;
  followedAt: string;
}

export default function FanDashboardPage() {
  const router = useRouter();
  const [celebrities, setCelebrities] = useState<FollowedCelebrity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fanId = localStorage.getItem("fanId");

    if (!fanId) {
      setError("Fan ID not found. Please log in again.");
      router.push("/login");
      return;
    }

    const fetchFollowed = async () => {
      try {
        const res = await fetch(`http://localhost:3001/fan/${fanId}/dashboard`);

        if (!res.ok) throw new Error("Failed to load fan dashboard");

        const data: FollowedCelebrity[] = await res.json();
        setCelebrities(data);
      } catch (err: unknown) {
  if (err instanceof Error) {
    setError(err.message || "Something went wrong");
  } else {
    setError("Something went wrong");
  }
}
      
      finally {
        setLoading(false);
      }
    };

    fetchFollowed();
  }, [router]);

  // ✅ Unfollow logic
  const handleUnfollow = async (celebrityId: number) => {
    const fanId = localStorage.getItem("fanId");
    if (!fanId) return;

    try {
      const res = await fetch("http://localhost:3001/fan/unfollow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fanId, celebrityId }),
      });

      if (!res.ok) throw new Error("Unfollow failed");

      // Remove from UI
      setCelebrities((prev) =>
        prev.filter((c) => c.celebrityId !== celebrityId)
      );
    } catch (err: unknown) {
  if (err instanceof Error) {
    setError(err.message || "Something went wrong");
  } else {
    setError("Something went wrong");
  }
}
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="mt-2 text-gray-600 dark:text-gray-300">Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return <p className="p-6 text-red-600 text-center">{error}</p>;
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-zinc-900 p-6">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-900 dark:text-white">
        Fan Dashboard
      </h1>

      {typeof window !== "undefined" && (
        <p className="text-center text-gray-600 dark:text-gray-300 mb-4">
          👋 Welcome, {localStorage.getItem("user") || "Fan"}!
        </p>
      )}

      <div className="text-center mb-4">
        <Link
          href="/"
          className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800"
        >
          ⬅ Back to Discover Celebrities
        </Link>
      </div>

      {celebrities.length === 0 ? (
        <p className="text-center text-gray-600 dark:text-gray-300">
          🧐 You&apos;re not following any celebrities yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {celebrities.map((celeb) => (
            <div
              key={celeb.celebrityId}
              className="bg-white dark:bg-zinc-800 p-6 rounded-xl shadow hover:shadow-lg hover:scale-105 transition-transform border dark:border-zinc-700"
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {celeb.celebrityName}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Followed on {new Date(celeb.followedAt).toLocaleDateString()}
              </p>
              <div className="mt-2 flex space-x-4">
                <Link
                  href={`/celebrity/${celeb.celebrityId}`}
                  className="text-blue-600 dark:text-blue-400 underline"
                >
                  View Profile
                </Link>
                <button
                  onClick={() => handleUnfollow(celeb.celebrityId)}
                  className="text-red-600 dark:text-red-400 underline"
                >
                  Unfollow
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
