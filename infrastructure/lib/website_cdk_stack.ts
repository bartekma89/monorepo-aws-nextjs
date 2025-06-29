import * as path from "path";
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNodeJs from "aws-cdk-lib/aws-lambda-nodejs";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as iam from "aws-cdk-lib/aws-iam";
import * as dynamoDb from "aws-cdk-lib/aws-dynamodb";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";

export class WebsiteCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

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

    const projectRoot = "../";
    const lambdasDirPath = path.join(projectRoot, "packages/lambdas");
    const lambdaLayersDirPath = path.join(
      projectRoot,
      "packages/lambda-layers"
    );

    const translateLambdaPath = path.resolve(
      path.join(lambdasDirPath, "translate/index.ts")
    );

    const utilsLambdaLayerPath = path.resolve(
      path.join(lambdaLayersDirPath, "utils-lambda-layer")
    );

    const utilsLambdaLayer = new lambda.LayerVersion(this, "utilsLambdaLayer", {
      code: lambda.Code.fromAsset(utilsLambdaLayerPath),
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

    // gateway
    const translateRestApi = new apigateway.RestApi(this, "TranslateApi");

    translateRestApi.root.addMethod(
      "POST",
      new apigateway.LambdaIntegration(translateLambda)
    );

    translateRestApi.root.addMethod(
      "GET",
      new apigateway.LambdaIntegration(getTranslationsLambda)
    );

    // s3 bucket for website hosting
    const websiteBucket = new s3.Bucket(this, "WebsiteBucket", {
      publicReadAccess: false,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });

    // cloudfront oac - origin access control
    const oac = new cloudfront.CfnOriginAccessControl(this, "WebsiteOAC", {
      originAccessControlConfig: {
        name: "WebsiteOACConfig",
        originAccessControlOriginType: "s3",
        signingBehavior: "always",
        signingProtocol: "sigv4",
        description: "OAC for website bucket",
      },
    });

    // cloudfront distribution
    const cfnDistribution = new cloudfront.CfnDistribution(
      this,
      "WebsiteBucketDistribution",
      {
        distributionConfig: {
          enabled: true,
          comment: "Website bucket distribution",
          defaultRootObject: "index.html",
          origins: [
            {
              id: "WebsiteBucketOrigin",
              domainName: websiteBucket.bucketRegionalDomainName,
              originAccessControlId: oac.attrId,
              s3OriginConfig: {},
            },
          ],
          defaultCacheBehavior: {
            targetOriginId: "WebsiteBucketOrigin",
            viewerProtocolPolicy:
              cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
            compress: true,
            allowedMethods: ["GET", "HEAD", "OPTIONS"],
            cachedMethods: ["GET", "HEAD"],
            forwardedValues: {
              queryString: false,
              cookies: {
                forward: "none",
              },
            },
          },
          customErrorResponses: [
            {
              errorCode: 404,
              responsePagePath: "/404.html",
              responseCode: 404,
            },
            {
              errorCode: 403,
              responsePagePath: "/404.html",
              responseCode: 403,
            },
          ],
        },
      }
    );

    websiteBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        actions: ["s3:GetObject"],
        resources: [websiteBucket.arnForObjects("*")],
        principals: [new iam.ServicePrincipal("cloudfront.amazonaws.com")],
        conditions: {
          StringEquals: {
            "AWS:SourceArn": `arn:aws:cloudfront::${
              cdk.Stack.of(this).account
            }:distribution/${cfnDistribution.ref}`,
          },
        },
      })
    );

    new s3deploy.BucketDeployment(this, "WebsiteDeployment", {
      sources: [
        s3deploy.Source.asset(path.join(projectRoot, "apps/frontend/dist")),
      ],
      destinationBucket: websiteBucket,
    });

    new cdk.CfnOutput(this, "websiteUrl", {
      exportName: "websiteUrl",
      value: `https://${cfnDistribution.attrDomainName}`,
    });
  }
}
