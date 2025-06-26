import * as clientTranslate from "@aws-sdk/client-translate";

import { ITranslateRequest } from "@sff/shared-types";

export async function makeTranslation({
  sourceLang,
  sourceText,
  targetLang,
}: ITranslateRequest): Promise<clientTranslate.TranslateTextCommandOutput> {
  const translateClient = new clientTranslate.TranslateClient({});

  const translateCmd = new clientTranslate.TranslateTextCommand({
    SourceLanguageCode: sourceLang,
    TargetLanguageCode: targetLang,
    Text: sourceText,
  });

  return await translateClient.send(translateCmd);
}
