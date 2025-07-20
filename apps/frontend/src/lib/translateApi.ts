import {
  ITranslatePrimaryKey,
  ITranslateRequest,
  ITranslateResult,
  TTranslateResultList,
} from "@sff/shared-types";

import { fetchAuthSession } from "aws-amplify/auth";

const URL = process.env.NEXT_PUBLIC_GATEAWAY_URL as string;

export async function translatePublicText(request: ITranslateRequest) {
  try {
    const result = await fetch(`${URL}/public`, {
      method: "POST",
      body: JSON.stringify(request),
    });

    const data = (await result.json()) as ITranslateResult;

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.toString());
    }
  }
}

export async function translateUserText(request: ITranslateRequest) {
  try {
    const authToken = (await fetchAuthSession()).tokens?.idToken?.toString();

    const result = await fetch(`${URL}/user`, {
      method: "POST",
      body: JSON.stringify(request),
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    const data = (await result.json()) as ITranslateResult;

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.toString());
    }
  }
}

export async function getUserTranslations() {
  try {
    const authToken = (await fetchAuthSession()).tokens?.idToken?.toString();

    const result = await fetch(`${URL}/user`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    const data = (await result.json()) as TTranslateResultList;

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.toString());
    }
  }
}

export async function deleteUserTranslation(item: ITranslatePrimaryKey) {
  try {
    const authToken = (await fetchAuthSession()).tokens?.idToken?.toString();

    const result = await fetch(`${URL}/user`, {
      method: "DELETE",
      body: JSON.stringify(item),
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    return (await result.json()) as ITranslatePrimaryKey;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.toString());
    }
  }
}
