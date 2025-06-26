import * as lambda from "aws-lambda";
import {
  ITranslateRequest,
  ITranslateResponse,
  ITranslateDbObject,
} from "@sff/shared-types";

import {
  gateway,
  makeTranslation,
  exceptions,
  TranslationTable,
} from "/opt/nodejs/utils-lambda-layer";

const { TRANSLATION_TABLE_NAME, TRANSLATION_PARTITION_KEY } = process.env;

if (!TRANSLATION_PARTITION_KEY) {
  throw new exceptions.MissingEnvVariableError(
    "TRANSLATION_PARTITION_KEY is empty"
  );
}

if (!TRANSLATION_TABLE_NAME) {
  throw new exceptions.MissingEnvVariableError(
    "TRANSLATION_TABLE_NAME is empty"
  );
}

const translationTable = new TranslationTable({
  tableName: TRANSLATION_TABLE_NAME,
  partitionKey: TRANSLATION_PARTITION_KEY,
});

export const translate: lambda.APIGatewayProxyHandler = async function (
  event: lambda.APIGatewayProxyEvent,
  context: lambda.Context
) {
  try {
    if (!event.body) {
      throw new exceptions.MissingBodyError();
    }

    const body = JSON.parse(event.body) as ITranslateRequest;

    if (!body.sourceLang) {
      throw new exceptions.MissingParameters("sourceLang");
    }

    if (!body.targetLang) {
      throw new exceptions.MissingParameters("targetLang");
    }

    if (!body.sourceText) {
      throw new exceptions.MissingParameters("sourceText");
    }

    const now = new Date(Date.now()).toString();

    const result = await makeTranslation(body);

    if (!result.TranslatedText) {
      throw new exceptions.MissingParameters("translation");
    }

    const data: ITranslateResponse = {
      timestamp: now,
      targetText: result.TranslatedText,
    };

    // save the translation into our translation table
    // the table object that is saved to the database
    const tableObj: ITranslateDbObject = {
      ...body,
      ...data,
      requestId: context.awsRequestId,
    };

    await translationTable.insertTranslation(tableObj);

    return gateway.gatewaySuccessJsonResponse(data);
  } catch (e: any) {
    return gateway.gatewayErrorJsonResponse(e);
  }
};

export const getTranslations: lambda.APIGatewayProxyHandler =
  async function () {
    try {
      const data = await translationTable.getAllTranslations();

      return gateway.gatewaySuccessJsonResponse(data);
    } catch (e: any) {
      return gateway.gatewayErrorJsonResponse(e);
    }
  };
