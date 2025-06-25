import * as lambda from "aws-lambda";

const createGatewayResponse = ({
  body,
  statusCode,
}: {
  body: string;
  statusCode: number;
}): lambda.APIGatewayProxyResult => ({
  statusCode,
  body,
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": true,
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Methods": "*",
  },
});

export const gatewaySuccessJsonResponse = (body: object) =>
  createGatewayResponse({ body: JSON.stringify(body), statusCode: 200 });
export const gatewayErrorJsonResponse = (body: object) =>
  createGatewayResponse({ body: JSON.stringify(body), statusCode: 500 });
