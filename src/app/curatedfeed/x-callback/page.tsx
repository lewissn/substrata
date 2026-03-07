"use client";

import { useEffect } from "react";

const APP_CALLBACK_URL = "curatedfeed://oauth-callback";

export default function XCallbackPage() {
  useEffect(() => {
    const query = window.location.search || "";
    window.location.replace(`${APP_CALLBACK_URL}${query}`);
  }, []);

  return (
    <main className="min-h-screen bg-[#0B1117] text-[#F0F0EE] grid place-items-center px-6">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-2xl font-semibold">Returning to CuratedFeed</h1>
        <p className="text-sm text-zinc-400">
          If the app does not open automatically, tap the button below.
        </p>
        <a
          href={APP_CALLBACK_URL}
          className="inline-flex items-center justify-center rounded-full bg-[#89CDD1] px-5 py-3 text-sm font-semibold text-[#0B1117]"
        >
          Open CuratedFeed
        </a>
      </div>
    </main>
  );
}
