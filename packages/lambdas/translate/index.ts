import * as lambda from "aws-lambda";
import {
  ITranslateRequest,
  ITranslateResponse,
  ITranslateResult,
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

const parseTranslateRequest = (requestStr: string) => {
  const request = JSON.parse(requestStr) as ITranslateRequest;

  if (!request.sourceLang) {
    throw new exceptions.MissingParameters("sourceLang");
  }

  if (!request.targetLang) {
    throw new exceptions.MissingParameters("targetLang");
  }

  if (!request.sourceText) {
    throw new exceptions.MissingParameters("sourceText");
  }

  return request;
};

const parseDeleteRequest = (requestStr: string) => {
  let request = JSON.parse(requestStr) as { requestId: string };

  if (!request.requestId) {
    throw new exceptions.MissingParameters("requestId");
  }
  return request;
};

const getCurrentTime = () => Date.now();
const formatTime = (time: number) => new Date(time).toString();

export const userTranslate: lambda.APIGatewayProxyHandler = async function (
  event: lambda.APIGatewayProxyEvent
) {
  try {
    const username = getUsername(event);

    if (!username) {
      throw new Error("username does not exist");
    }

    if (!event.body) {
      throw new exceptions.MissingBodyError();
    }

    const request = parseTranslateRequest(event.body);

    const nowEpoch = getCurrentTime();

    const targetText = await makeTranslation(request);

    const response: ITranslateResponse = {
      timestamp: formatTime(nowEpoch),
      targetText,
    };

    // save the translation into our translation table
    // the table object that is saved to the database
    const result: ITranslateResult = {
      ...request,
      ...response,
      username: "",
      requestId: nowEpoch.toString(),
    };

    await translationTable.insertTranslation(result);

    return gateway.gatewaySuccessJsonResponse(response);
  } catch (e: any) {
    return gateway.gatewayErrorJsonResponse(e);
  }
};

export const getUserTranslations: lambda.APIGatewayProxyHandler =
  async function (event: lambda.APIGatewayProxyEvent) {
    try {
      const username = getUsername(event);

      const data = await translationTable.queryTranslation({
        username,
        requestId: "",
      });

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

    const request = parseTranslateRequest(event.body);

    const nowEpoch = getCurrentTime();

    const targetText = await makeTranslation(request);

    const response: ITranslateResponse = {
      timestamp: formatTime(nowEpoch),
      targetText,
    };

    return gateway.gatewaySuccessJsonResponse(response);
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

      const { requestId } = parseDeleteRequest(event.body);

      const data = await translationTable.deleteTranslation({
        username,
        requestId,
      });

      return gateway.gatewaySuccessJsonResponse(data);
    } catch (e: any) {
      return gateway.gatewayErrorJsonResponse(e);
    }
  };
