import * as clientTranslate from "@aws-sdk/client-translate";

import { ITranslateRequest } from "@sff/shared-types";
import { MissingParameters } from "./exceptions";

export async function makeTranslation({
  sourceLang,
  sourceText,
  targetLang,
}: ITranslateRequest): Promise<string> {
  const translateClient = new clientTranslate.TranslateClient({});

  const translateCmd = new clientTranslate.TranslateTextCommand({
    SourceLanguageCode: sourceLang,
    TargetLanguageCode: targetLang,
    Text: sourceText,
  });

  const result = await translateClient.send(translateCmd);

  if (!result.TranslatedText) {
    throw new MissingParameters("translation");
  }

  return result.TranslatedText;
}
