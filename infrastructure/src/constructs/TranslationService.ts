import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as dynamoDb from "aws-cdk-lib/aws-dynamodb";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambdaNodeJs from "aws-cdk-lib/aws-lambda-nodejs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import path from "path";
import { RestApiService } from "./RestApiService";
import { lambdasDirPath, lambdaLayersDirPath } from "../helpers";
import { createNodeJsLambda } from "../helpers/lambdaNodeJSWrapper";

interface ITranslationServiceProps extends cdk.StackProps {
  restApi: RestApiService;
}

export class TranslationService extends Construct {
  constructor(
    scope: Construct,
    id: string,
    { restApi }: ITranslationServiceProps
  ) {
    super(scope, id);

    // dynamodb
    const table = new dynamoDb.Table(this, "TranslationsTable", {
      partitionKey: { name: "requestId", type: dynamoDb.AttributeType.STRING },
      tableName: "translation",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // a policy that gets attached to the lambda
    // allowing it to acces the translation resource
    // translate access policy
    const translateServicePolicy = new iam.PolicyStatement({
      actions: ["translate:TranslateText"],
      resources: ["*"],
    });

    // translate table access policy
    const translateTablePolicy = new iam.PolicyStatement({
      actions: [
        "dynamodb:PutItem",
        "dynamodb:Scan",
        "dynamodb:GetItem",
        "dynamodb:DeleteItem",
      ],
      resources: ["*"],
    });

    const utilsLambdaLayer = new lambda.LayerVersion(this, "utilsLambdaLayer", {
      code: lambda.Code.fromAsset(lambdaLayersDirPath),
      compatibleRuntimes: [lambda.Runtime.NODEJS_22_X],
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // translate lambda
    const translateLambda = createNodeJsLambda(this, "translateLambda", {
      lambdaRelPath: "translate/index.ts",
      handler: "translate",
      initialPolicy: [translateServicePolicy, translateTablePolicy],
      lambdaLayers: [utilsLambdaLayer],
      environment: {
        TRANSLATION_TABLE_NAME: table.tableName,
        TRANSLATION_PARTITION_KEY: "requestId",
      },
    });

    // getTranslations lambda
    const getTranslationsLambda = createNodeJsLambda(
      this,
      "getTranslationsLambda",
      {
        lambdaRelPath: "translate/index.ts",
        handler: "getTranslations",
        initialPolicy: [translateTablePolicy],
        lambdaLayers: [utilsLambdaLayer],
        environment: {
          TRANSLATION_TABLE_NAME: table.tableName,
          TRANSLATION_PARTITION_KEY: "requestId",
        },
      }
    );

    restApi.addTranlateMethod({
      httpMethod: "POST",
      lambda: translateLambda,
    });

    restApi.addTranlateMethod({
      httpMethod: "GET",
      lambda: getTranslationsLambda,
    });
  }
}
