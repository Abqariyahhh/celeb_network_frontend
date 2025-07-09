"use client";

import { useState } from "react";
import Link from "next/link";

interface CelebritySuggestion {
  name: string;
  category: string;
  country: string;
  instagram?: string;
  fanbase?: number | string;
  genre?: string;
}

export default function CelebritySignup() {
  const [intro, setIntro] = useState("");
  const [suggestions, setSuggestions] = useState<CelebritySuggestion[]>([]);
  //const [selected, setSelected] = useState<CelebritySuggestion | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    country: "",
    instagram: "",
    fanbase: "",
    genre: "",
  });
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function fetchSuggestions() {
    if (!intro.trim()) return;
    setLoadingSuggestions(true);
    setMessage(null);
    try {
      const res = await fetch("https://xl2ro1gduf.execute-api.ap-south-1.amazonaws.com/dev/openrouter/celebrity-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: intro }),
      });
      if (!res.ok) throw new Error("Failed to fetch suggestions");
      const data = await res.json();
      setSuggestions(data.suggestions || []);
    } catch (error: unknown) {
  if (error instanceof Error) {
    setMessage(error.message || "Error fetching suggestions.");
  } else {
    setMessage("Error fetching suggestions.");
  }
}
    setLoadingSuggestions(false);
  }

  function selectSuggestion(suggestion: CelebritySuggestion) {
    //setSelected(suggestion);
    setFormData({
      name: suggestion.name || "",
      category: suggestion.category || "",
      country: suggestion.country || "",
      instagram: suggestion.instagram || "",
      fanbase: suggestion.fanbase ? String(suggestion.fanbase) : "",
      genre: suggestion.genre || "",
    });
    setSuggestions([]);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoadingSubmit(true);
    setMessage(null);
    try {
      const res = await fetch("https://xl2ro1gduf.execute-api.ap-south-1.amazonaws.com/dev/celebrities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          category: formData.category,
          country: formData.country,
          instagram: formData.instagram,
          fanbase: Number(formData.fanbase) || 0,
          genre: formData.genre,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to onboard celebrity");
      }
      setMessage("Celebrity onboarded successfully!");
      setFormData({
        name: "",
        category: "",
        country: "",
        instagram: "",
        fanbase: "",
        genre: "",
      });
      //setSelected(null);
      setIntro("");
    } 
    catch (error: unknown) {
  if (error instanceof Error) {
    setMessage(error.message || "Error submitting form.");
  } else {
    setMessage("Error submitting form.");
  }
}
    setLoadingSubmit(false);
  }

  return (
    <main className="max-w-xl mx-auto p-6 bg-white dark:bg-zinc-900 rounded-lg shadow-lg">
      <Link href="/" className="text-blue-600 dark:text-blue-400 underline mb-4 inline-block">
  ⬅ Cancel and go Home
</Link>
      <h1 className="text-2xl font-bold mb-4 text-center text-gray-900 dark:text-gray-100">
        Celebrity Signup
      </h1>

      <label className="block mb-1 text-gray-700 dark:text-gray-300" htmlFor="intro">
        Enter a one-line intro about the celebrity:
      </label>
      <input
        id="intro"
        type="text"
        value={intro}
        onChange={(e) => setIntro(e.target.value)}
        placeholder='e.g. "Punjabi singer from India who performed at Coachella"'
        className="w-full mb-2 p-2 border border-gray-300 rounded dark:bg-zinc-800 dark:border-zinc-700 dark:text-gray-100"
      />
      <button
        onClick={fetchSuggestions}
        disabled={!intro.trim() || loadingSuggestions}
        className="mb-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50"
      >
        {loadingSuggestions ? "Loading..." : "Get Suggestions"}
      </button>

      {/* Suggestions List */}
      {suggestions.length > 0 && (
        <div className="mb-4 bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded max-h-48 overflow-y-auto">
          {suggestions.map((sugg, idx) => (
            <div
              key={idx}
              onClick={() => selectSuggestion(sugg)}
              className="cursor-pointer p-2 hover:bg-blue-200 dark:hover:bg-blue-900"
            >
              {sugg.name} — {sugg.category} — {sugg.country}
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Name"
          required
          className="w-full p-2 border border-gray-300 rounded dark:bg-zinc-800 dark:border-zinc-700 dark:text-gray-100"
        />
        <input
          name="category"
          value={formData.category}
          onChange={handleInputChange}
          placeholder="Category (Singer, Actor, Speaker)"
          required
          className="w-full p-2 border border-gray-300 rounded dark:bg-zinc-800 dark:border-zinc-700 dark:text-gray-100"
        />
        <input
          name="country"
          value={formData.country}
          onChange={handleInputChange}
          placeholder="Country"
          required
          className="w-full p-2 border border-gray-300 rounded dark:bg-zinc-800 dark:border-zinc-700 dark:text-gray-100"
        />
        <input
          name="instagram"
          value={formData.instagram}
          onChange={handleInputChange}
          placeholder="Instagram URL"
          className="w-full p-2 border border-gray-300 rounded dark:bg-zinc-800 dark:border-zinc-700 dark:text-gray-100"
        />
        <input
          name="fanbase"
          value={formData.fanbase}
          onChange={handleInputChange}
          placeholder="Fanbase (number)"
          type="number"
          min={1000}
          className="w-full p-2 border border-gray-300 rounded dark:bg-zinc-800 dark:border-zinc-700 dark:text-gray-100"
        />
        <input
          name="genre"
          value={formData.genre}
          onChange={handleInputChange}
          placeholder="Genre"
          className="w-full p-2 border border-gray-300 rounded dark:bg-zinc-800 dark:border-zinc-700 dark:text-gray-100"
        />

        <button
          type="submit"
          disabled={loadingSubmit}
          className="w-full py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded disabled:opacity-50"
        >
          {loadingSubmit ? "Submitting..." : "Submit"}
        </button>
      </form>

      {message && (
        <p className="mt-4 text-center text-red-600 dark:text-red-400">{message}</p>
      )}
    </main>
  );
}
