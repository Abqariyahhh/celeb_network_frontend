"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

interface CelebrityDetail {
  id: number;
  name: string;
  category: string;
  country: string;
  fanbase: number;
  instagram: string;
  genre: string;
}

export default function CelebrityProfilePage() {
  const { id } = useParams();
  const { token } = useAuth();
  const [celebrity, setCelebrity] = useState<CelebrityDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      if (!id) return;
      try {
        const res = await fetch(`https://xl2ro1gduf.execute-api.ap-south-1.amazonaws.com/dev/celebrities/${id}`);
        if (!res.ok) throw new Error("Failed to fetch celebrity profile");
        const data: CelebrityDetail = await res.json();
        setCelebrity(data);
      } catch (err: unknown) {
  if (err instanceof Error) {
    setError(err.message);
  } else {
    setError("Error loading profile");
  }
}finally {
      setLoading(false); // ✅ Mark loading complete
    }
    }

    fetchProfile();
  }, [id]);

  async function handleDownloadPDF() {
    if (!celebrity || !celebrity.name || !token) {
      alert("You must be logged in to download the PDF");
      return;
    }

    setDownloading(true);
    try {
      const res = await fetch(
        `https://xl2ro1gduf.execute-api.ap-south-1.amazonaws.com/dev/pdf/celebrity/name/${encodeURIComponent(celebrity.name)}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to generate PDF");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${celebrity.name}_profile.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: unknown) {
  if (err instanceof Error) {
    alert(err.message);
  } else {
    alert("Failed to download PDF");
  }
}
    finally {
      setDownloading(false);
    }
  }

 if (loading) {
  return (
    <div className="p-6 text-center">
      <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
      <p className="mt-2 text-gray-600 dark:text-gray-300">Loading profile...</p>
    </div>
  );
}
  if (error) return <p className="p-6 text-red-600">{error}</p>;
  if (!celebrity) return <p className="p-6">Celebrity not found.</p>;

  return (
    <main className="max-w-3xl mx-auto p-6 bg-white dark:bg-zinc-900 rounded-lg shadow-lg">
      <Link href="/" className="text-blue-600 dark:text-blue-400 underline mb-4 inline-block">
  ⬅ Back to List
</Link>
      <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">
        {celebrity.name}
      </h1>
      <p><strong>Category:</strong> {celebrity.category}</p>
      <p><strong>Country:</strong> {celebrity.country}</p>
      <p><strong>Fanbase:</strong> {celebrity.fanbase.toLocaleString()}</p>
      <p><strong>Genre:</strong> {celebrity.genre}</p>
      <p>
        <strong>Instagram:</strong>{" "}
        <a
          href={celebrity.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 underline"
        >
          {celebrity.instagram}
        </a>
      </p>

      {token ? (
  <button
    onClick={handleDownloadPDF}
    disabled={downloading}
    className="mt-6 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded disabled:opacity-50"
  >
    {downloading ? "Generating PDF..." : "Download Profile PDF"}
  </button>
) : (
  <p className="mt-6 text-sm text-red-500">
    You must be logged in to download the profile PDF.
  </p>
)}
      
    </main>
  );
}
