import * as path from "path";
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNodeJs from "aws-cdk-lib/aws-lambda-nodejs";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as iam from "aws-cdk-lib/aws-iam";
import * as dynamoDb from "aws-cdk-lib/aws-dynamodb";

export class TempCdkStackStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // dynamodb
    const table = new dynamoDb.Table(this, "translationsTable", {
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

    const projectRoot = "../";
    const lambdasDirPath = path.join(projectRoot, "packages/lambdas");
    const translateLambdaPath = path.resolve(
      path.join(lambdasDirPath, "translate/index.ts")
    );

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
        environment: {
          TRANSLATION_TABLE_NAME: table.tableName,
          TRANSLATION_PARTITION_KEY: "requestId",
        },
      }
    );

    // gateway
    const translateRestApi = new apigateway.RestApi(this, "translateRestApi");

    translateRestApi.root.addResource("translate");

    translateRestApi.root.addMethod(
      "POST",
      new apigateway.LambdaIntegration(translateLambda)
    );

    translateRestApi.root.addMethod(
      "GET",
      new apigateway.LambdaIntegration(getTranslationsLambda)
    );
  }
}
