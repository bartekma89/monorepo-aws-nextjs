"use client";

import { useState } from "react";

import { useTranslation } from "./hooks/useTranslation";

export default function Home() {
  const [inputText, setInputText] = useState<string>("");
  const [inputLang, setInputLang] = useState<string>("");
  const [outputLang, setOutputLang] = useState<string>("");

  const {
    translations,
    isLoading,
    isTranslating,
    translate,
    deleteTranslation,
    isDeleting,
  } = useTranslation();

  if (isLoading) {
    return <p>loading...</p>;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center-safe p-24">
      <form
        onSubmit={async (e) => {
          e.preventDefault();

          await translate({
            sourceLang: inputLang,
            sourceText: inputText,
            targetLang: outputLang,
          });
        }}>
        <div className="flex flex-col">
          <label htmlFor="inputText">Input text</label>
          <textarea
            className="bg-white mb-2"
            name="inputText"
            id="inputText"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="inputLang">Input Lang</label>
          <input
            className="bg-white mb-2"
            name="inputLang"
            id="inputLang"
            value={inputLang}
            onChange={(e) => setInputLang(e.target.value)}
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="outputLang">Output Lang</label>
          <input
            className="bg-white mb-2"
            name="outputLang"
            id="outputLang"
            value={outputLang}
            onChange={(e) => setOutputLang(e.target.value)}
          />
        </div>
        <button className="btn bg-blue-200 p-2 mt-3 rounded-xl" type="submit">
          {isTranslating ? "translating..." : "translate"}
        </button>
      </form>

      <div className="flex flex-col w-full mt-3 space-y-2">
        {translations?.map((item) => (
          <div
            key={item.requestId}
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
