"use client";

import { useState } from "react";
import {
  ITranslateRequest,
  ITranslateResponse,
  ITranslateDbObject,
} from "@sff/shared-types";

const URL = "https://uvf4gmcin8.execute-api.eu-central-1.amazonaws.com/prod/";

async function translateText(body: {
  inputLang: string;
  outputLang: string;
  inputText: string;
}) {
  try {
    const requestBody: ITranslateRequest = {
      sourceLang: body.inputLang,
      targetLang: body.outputLang,
      sourceText: body.inputText,
    };

    const result = await fetch(URL, {
      method: "POST",
      body: JSON.stringify(requestBody),
    });

    const data = (await result.json()) as ITranslateResponse;

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.toString());
    }
  }
}

async function getTranslations() {
  try {
    const result = await fetch(URL, {
      method: "GET",
    });

    const data = (await result.json()) as ITranslateDbObject[];

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.toString());
    }
  }
}

export default function Home() {
  const [inputText, setInputText] = useState<string>("");
  const [inputLang, setInputLang] = useState<string>("");
  const [outputLang, setOutputLang] = useState<string>("");
  const [outputText, setOutputText] = useState<ITranslateResponse | null>(null);
  const [translations, setTranslations] = useState<ITranslateDbObject[]>([]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-around p-24">
      <form
        onSubmit={async (e) => {
          e.preventDefault();

          const result = await translateText({
            inputLang,
            inputText,
            outputLang,
          });

          if (result) {
            setOutputText(result);
          }
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
        <button className="btn bg-blue-200 p-2 mt-2 rounded-xl" type="submit">
          Translate
        </button>
      </form>
      {outputText && <pre>{JSON.stringify(outputText, null, 2)}</pre>}
      <hr />
      <button
        className="btn bg-blue-200 p-2 mt-2 rounded-xl"
        type="button"
        onClick={async () => {
          const data = await getTranslations();
          if (data) {
            setTranslations(data);
          }
        }}>
        Get Translations
      </button>
      <pre>{JSON.stringify(translations, null, 2)}</pre>
    </main>
  );
}
