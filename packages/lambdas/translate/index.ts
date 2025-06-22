import * as clientTranslate from "@aws-sdk/client-translate";
import * as lambda from "aws-lambda";
import * as dynamodb from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import {
  ITranslateRequest,
  ITranslateResponse,
  ITranslateDbObject,
} from "@sff/shared-types";

const translateClient = new clientTranslate.TranslateClient({});
const dynamodbClient = new dynamodb.DynamoDBClient({});

const { TRANSLATION_TABLE_NAME, TRANSLATION_PARTITION_KEY } = process.env;

console.log("process env", {
  TRANSLATION_TABLE_NAME,
  TRANSLATION_PARTITION_KEY,
});

if (!TRANSLATION_PARTITION_KEY) {
  throw new Error("TRANSLATION_PARTITION_KEY is empty");
}

if (!TRANSLATION_TABLE_NAME) {
  throw new Error("TRANSLATION_TABLE_NAME is empty");
}

export const translate: lambda.APIGatewayProxyHandler = async function (
  event: lambda.APIGatewayProxyEvent,
  context: lambda.Context
) {
  try {
    if (!event.body) {
      throw new Error("body is empty");
    }

    const body = JSON.parse(event.body) as ITranslateRequest;

    if (!body.sourceLang) {
      throw new Error("sourceLang is missing");
    }

    if (!body.targetLang) {
      throw new Error("targetLang is missing");
    }

    if (!body.sourceText) {
      throw new Error("sourceText is missing");
    }

    const { sourceLang, targetLang, sourceText } = body;

    const now = new Date(Date.now()).toString();

    const translateCmd = new clientTranslate.TranslateTextCommand({
      SourceLanguageCode: sourceLang,
      TargetLanguageCode: targetLang,
      Text: sourceText,
    });

    const result = await translateClient.send(translateCmd);

    if (!result.TranslatedText) {
      throw new Error("translation is empty");
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

    const tableInsetCmd: dynamodb.PutItemCommandInput = {
      TableName: TRANSLATION_TABLE_NAME,
      Item: marshall(tableObj),
    };

    await dynamodbClient.send(new dynamodb.PutItemCommand(tableInsetCmd));

    return {
      statusCode: 200,
      body: JSON.stringify(data),
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Methods": "*",
      },
    };
  } catch (e) {
    let error;
    if (e instanceof Error) {
      error = e.message;
    }

    return {
      statusCode: 500,
      body: JSON.stringify(error),
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Methods": "*",
      },
    };
  }
};

export const getTranslations: lambda.APIGatewayProxyHandler =
  async function () {
    try {
      const tableScanCmd: dynamodb.ScanCommandInput = {
        TableName: TRANSLATION_TABLE_NAME,
      };

      console.log("scan table", tableScanCmd);

      const { Items } = await dynamodbClient.send(
        new dynamodb.ScanCommand(tableScanCmd)
      );

      if (!Items) {
        throw new Error("no items found");
      }

      const data = Items.map((item) => unmarshall(item) as ITranslateDbObject);

      return {
        statusCode: 200,
        body: JSON.stringify(data),
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
          "Access-Control-Allow-Headers": "*",
          "Access-Control-Allow-Methods": "*",
        },
      };
    } catch (e) {
      let error;
      if (e instanceof Error) {
        error = e.message;
      }

      return {
        statusCode: 500,
        body: JSON.stringify(error),
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
          "Access-Control-Allow-Headers": "*",
          "Access-Control-Allow-Methods": "*",
        },
      };
    }
  };
