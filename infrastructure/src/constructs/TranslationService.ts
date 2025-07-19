import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as dynamoDb from "aws-cdk-lib/aws-dynamodb";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { RestApiService } from "./RestApiService";
import { lambdaLayersDirPath } from "../helpers";
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
      partitionKey: { name: "username", type: dynamoDb.AttributeType.STRING },
      sortKey: {
        name: "requestId",
        type: dynamoDb.AttributeType.STRING,
      },
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
        "dynamodb:Query",
      ],
      resources: ["*"],
    });

    const utilsLambdaLayer = new lambda.LayerVersion(this, "utilsLambdaLayer", {
      code: lambda.Code.fromAsset(lambdaLayersDirPath),
      compatibleRuntimes: [lambda.Runtime.NODEJS_22_X],
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const environment = {
      TRANSLATION_TABLE_NAME: table.tableName,
      TRANSLATION_PARTITION_KEY: "username",
      TRANSLATION_SORT_KEY: "requestId",
    };

    // translate user lambda
    const userTranslateLambda = createNodeJsLambda(this, "translateLambda", {
      lambdaRelPath: "translate/index.ts",
      handler: "userTranslate",
      initialPolicy: [translateServicePolicy, translateTablePolicy],
      lambdaLayers: [utilsLambdaLayer],
      environment,
    });

    // user rest api
    restApi.addTranlateMethod({
      resource: restApi.userResource,
      httpMethod: "POST",
      lambda: userTranslateLambda,
      isAuth: true,
    });

    // getTranslations user lambda
    const getTranslationsLambda = createNodeJsLambda(
      this,
      "getTranslationsLambda",
      {
        lambdaRelPath: "translate/index.ts",
        handler: "getUserTranslations",
        initialPolicy: [translateTablePolicy],
        lambdaLayers: [utilsLambdaLayer],
        environment,
      }
    );

    restApi.addTranlateMethod({
      resource: restApi.userResource,
      httpMethod: "GET",
      lambda: getTranslationsLambda,
      isAuth: true,
    });

    // translate public lambda
    const publicTranslateLambda = createNodeJsLambda(
      this,
      "publicTranslateLambda",
      {
        lambdaRelPath: "translate/index.ts",
        handler: "publicTranslate",
        initialPolicy: [translateServicePolicy],
        lambdaLayers: [utilsLambdaLayer],
        environment,
      }
    );

    // publuc rest api
    restApi.addTranlateMethod({
      resource: restApi.publicResource,
      httpMethod: "POST",
      lambda: publicTranslateLambda,
      isAuth: false,
    });

    // delete translation lambda
    const userDeleteTranslationLambda = createNodeJsLambda(
      this,
      "userDeleteTranslationLambda",
      {
        lambdaRelPath: "translate/index.ts",
        handler: "deleteUserTranslation",
        initialPolicy: [translateTablePolicy],
        lambdaLayers: [utilsLambdaLayer],
        environment,
      }
    );

    restApi.addTranlateMethod({
      resource: restApi.userResource,
      httpMethod: "DELETE",
      lambda: userDeleteTranslationLambda,
      isAuth: true,
    });
  }
}
