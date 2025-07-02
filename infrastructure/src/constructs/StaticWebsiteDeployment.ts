import path from "path";
import { Construct } from "constructs";
import * as iam from "aws-cdk-lib/aws-iam";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as cdk from "aws-cdk-lib";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import { frontendDirPath } from "../helpers";

interface IStaticWebsiteDeploymentProps extends cdk.StackProps {}

export class StaticWebsiteDeployment extends Construct {
  constructor(
    scope: Construct,
    id: string,
    props?: IStaticWebsiteDeploymentProps
  ) {
    super(scope, id);

    // s3 bucket for website hosting
    const websiteBucket = new s3.Bucket(this, "WebsiteBucket", {
      publicReadAccess: false,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });

    // create an origin access identity (OAI)
    const oai = new cloudfront.OriginAccessIdentity(this, "WebsiteOAI");

    websiteBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        actions: ["s3:GetObject"],
        resources: [websiteBucket.arnForObjects("*")],
        principals: [
          new iam.CanonicalUserPrincipal(
            oai.cloudFrontOriginAccessIdentityS3CanonicalUserId
          ),
        ],
      })
    );

    const distribution = new cloudfront.Distribution(
      this,
      "WebsiteDistribution",
      {
        defaultRootObject: "index.html",
        defaultBehavior: {
          origin: new origins.S3Origin(websiteBucket, {
            originAccessIdentity: oai,
          }),
          viewerProtocolPolicy:
            cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        },
        errorResponses: [
          {
            httpStatus: 404,
            responseHttpStatus: 404,
            responsePagePath: "/404.html",
          },
          {
            httpStatus: 403,
            responseHttpStatus: 403,
            responsePagePath: "/404.html",
          },
        ],
      }
    );

    new s3deploy.BucketDeployment(this, "WebsiteDeployment", {
      sources: [s3deploy.Source.asset(frontendDirPath)],
      destinationBucket: websiteBucket,
      distribution,
      distributionPaths: ["/*"],
    });

    new cdk.CfnOutput(this, "websiteUrl", {
      exportName: "websiteUrl",
      value: `https://${distribution.domainName}`,
    });
  }
}
