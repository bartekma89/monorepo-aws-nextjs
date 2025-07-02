import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as dynamoDb from "aws-cdk-lib/aws-dynamodb";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambdaNodeJs from "aws-cdk-lib/aws-lambda-nodejs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import path from "path";
import { RestApiService } from "./RestApiService";

interface ITranslationServiceProps extends cdk.StackProps {
  lambdasDirPath: string;
  lambdaLayersDirPath: string;
  restApi: RestApiService;
}

export class TranslationService extends Construct {
  constructor(
    scope: Construct,
    id: string,
    { lambdaLayersDirPath, lambdasDirPath, restApi }: ITranslationServiceProps
  ) {
    super(scope, id);

    const translateLambdaPath = path.resolve(
      path.join(lambdasDirPath, "translate/index.ts")
    );

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
    const translateLambda = new lambdaNodeJs.NodejsFunction(
      this,
      "translateLambda",
      {
        entry: translateLambdaPath,
        handler: "translate",
        runtime: lambda.Runtime.NODEJS_22_X,
        bundling: {
          forceDockerBundling: false,
        },
        initialPolicy: [translateServicePolicy, translateTablePolicy],
        layers: [utilsLambdaLayer],
        environment: {
          TRANSLATION_TABLE_NAME: table.tableName,
          TRANSLATION_PARTITION_KEY: "requestId",
        },
      }
    );

    // getTranslations lambda
    const getTranslationsLambda = new lambdaNodeJs.NodejsFunction(
      this,
      "getTranslationsLambda",
      {
        entry: translateLambdaPath,
        handler: "getTranslations",
        runtime: lambda.Runtime.NODEJS_22_X,
        bundling: {
          forceDockerBundling: false,
        },
        initialPolicy: [translateTablePolicy],
        layers: [utilsLambdaLayer],
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
