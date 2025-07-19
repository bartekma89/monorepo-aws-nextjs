"use client";

import { useState } from "react";
import {
  ITranslateRequest,
  ITranslateResponse,
  ITranslateDbObject,
} from "@sff/shared-types";

import { fetchAuthSession, getCurrentUser } from "aws-amplify/auth";

const URL = process.env.NEXT_PUBLIC_GATEAWAY_URL as string;

async function translatePublicText(body: {
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

    const result = await fetch(`${URL}/public`, {
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

async function translateUserText(body: {
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

    const authToken = (await fetchAuthSession()).tokens?.idToken?.toString();

    const result = await fetch(`${URL}/user`, {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    const data = (await result.json()) as ITranslateResponse;

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.toString());
    }
  }
}

async function getUserTranslations() {
  try {
    const authToken = (await fetchAuthSession()).tokens?.idToken?.toString();

    const result = await fetch(`${URL}/user`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    const data = (await result.json()) as ITranslateDbObject[];

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.toString());
    }
  }
}

async function deleteUserTranslation(item: {
  requestId: string;
  username: string;
}) {
  try {
    const authToken = (await fetchAuthSession()).tokens?.idToken?.toString();

    const result = await fetch(`${URL}/user`, {
      method: "DELETE",
      body: JSON.stringify(item),
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    return (await result.json()) as ITranslateDbObject[];
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
  const [translations, setTranslations] = useState<ITranslateDbObject[]>();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center-safe p-24">
      <form
        onSubmit={async (e) => {
          e.preventDefault();

          let result;
          try {
            const user = await getCurrentUser();

            console.log(user);

            if (user) {
              result = await translateUserText({
                inputLang,
                inputText,
                outputLang,
              });
            } else {
              throw new Error("user is not logged in");
            }
          } catch {
            result = await translatePublicText({
              inputLang,
              inputText,
              outputLang,
            });
          }

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
        <button className="btn bg-blue-200 p-2 mt-3 rounded-xl" type="submit">
          Translate
        </button>
      </form>
      {outputText && <pre>{JSON.stringify(outputText, null, 2)}</pre>}
      <hr />
      <button
        className="btn bg-blue-200 p-2 mt-2 rounded-xl"
        type="button"
        onClick={async () => {
          const data = await getUserTranslations();
          if (data) {
            setTranslations(data);
          }
        }}>
        Get Translations
      </button>
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
                const data = await deleteUserTranslation({
                  requestId: item.requestId,
                  username: item.username,
                });
                if (data) {
                  setTranslations(data);
                }
              }}>
              X
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
