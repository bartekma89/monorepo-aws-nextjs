"use client";

import { useTranslation } from "./hooks/useTranslation";
import { TranslateForm } from "@/components";

export default function Home() {
  const { translations, isLoading, deleteTranslation, isDeleting } =
    useTranslation();

  if (isLoading) {
    return <p>loading...</p>;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center-safe p-24">
      <TranslateForm />
      <div className="flex flex-col w-full mt-3 space-y-2">
        {translations?.map((item) => (
          <div
            key={item.timestamp}
            className="flex flex-row space-x-2 justify-between bg-slate-400">
            <p className="mr-6">
              {item.sourceLang}/{item.sourceText}
            </p>
            |
            <p className="ml-6">
              {item.targetLang}/{item.targetText}
            </p>
            <button
              className="btn p-2 bg-red-500 hover:bg-red-300 cursor-pointer rounded-md"
              type="button"
              onClick={async () => {
                await deleteTranslation(item);
              }}>
              {isDeleting ? "..." : "X"}
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
