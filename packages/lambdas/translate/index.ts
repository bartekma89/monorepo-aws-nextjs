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

const {
  TRANSLATION_TABLE_NAME,
  TRANSLATION_PARTITION_KEY,
  TRANSLATION_SORT_KEY,
} = process.env;

if (!TRANSLATION_PARTITION_KEY) {
  throw new exceptions.MissingEnvVariableError(
    "TRANSLATION_PARTITION_KEY is empty"
  );
}

if (!TRANSLATION_SORT_KEY) {
  throw new exceptions.MissingEnvVariableError("TRANSLATION_SORT_KEY is empty");
}

if (!TRANSLATION_TABLE_NAME) {
  throw new exceptions.MissingEnvVariableError(
    "TRANSLATION_TABLE_NAME is empty"
  );
}

const translationTable = new TranslationTable({
  tableName: TRANSLATION_TABLE_NAME,
  partitionKey: TRANSLATION_PARTITION_KEY,
  sortKey: TRANSLATION_SORT_KEY,
});

const getUsername = (event: lambda.APIGatewayProxyEvent) => {
  const claims = event.requestContext.authorizer?.claims;
  if (!claims) {
    throw new Error("user not authorized");
  }

  return claims["cognito:username"];
};

export const userTranslate: lambda.APIGatewayProxyHandler = async function (
  event: lambda.APIGatewayProxyEvent,
  context: lambda.Context
) {
  try {
    const username = getUsername(event);

    if (!username) {
      throw new Error("username does not exist");
    }

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
      username,
      requestId: context.awsRequestId,
    };

    await translationTable.insertTranslation(tableObj);

    return gateway.gatewaySuccessJsonResponse(data);
  } catch (e: any) {
    return gateway.gatewayErrorJsonResponse(e);
  }
};

export const getUserTranslations: lambda.APIGatewayProxyHandler =
  async function (event: lambda.APIGatewayProxyEvent) {
    try {
      const username = getUsername(event);

      const data = await translationTable.queryTranslation({ username });

      return gateway.gatewaySuccessJsonResponse(data);
    } catch (e: any) {
      return gateway.gatewayErrorJsonResponse(e);
    }
  };

export const publicTranslate: lambda.APIGatewayProxyHandler = async function (
  event: lambda.APIGatewayProxyEvent
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

    return gateway.gatewaySuccessJsonResponse(data);
  } catch (e: any) {
    return gateway.gatewayErrorJsonResponse(e);
  }
};

export const deleteUserTranslation: lambda.APIGatewayProxyHandler =
  async function (event: lambda.APIGatewayProxyEvent, context: lambda.Context) {
    try {
      const username = getUsername(event);

      if (!username) {
        throw new Error("username does not exist");
      }

      if (!event.body) {
        throw new exceptions.MissingBodyError();
      }

      let body = JSON.parse(event.body) as { requestId: string };

      if (!body.requestId) {
        throw new exceptions.MissingParameters("requestId");
      }

      let requestId = body.requestId;

      const data = await translationTable.deleteTranslation({
        username,
        requestId,
      });

      return gateway.gatewaySuccessJsonResponse(data);
    } catch (e: any) {
      return gateway.gatewayErrorJsonResponse(e);
    }
  };
