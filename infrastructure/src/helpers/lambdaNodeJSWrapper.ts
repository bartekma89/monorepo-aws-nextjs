import * as lambdaNodeJs from "aws-cdk-lib/aws-lambda-nodejs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import * as iam from "aws-cdk-lib/aws-iam";
import path from "path";
import fs from "fs";
import { lambdasDirPath } from "./appPaths";

interface ILambdaWrapperProps {
  lambdaRelPath: string;
  handler: string;
  initialPolicy: Array<iam.PolicyStatement>;
  lambdaLayers: Array<lambda.ILayerVersion>;
  environment: Record<string, string>;
}

const buildingProps: lambdaNodeJs.BundlingOptions = {
  forceDockerBundling: false,
  minify: true,
  externalModules: ["/opt/nodejs/utils-lambda-layer"],
};

export const createNodeJsLambda = (
  scope: Construct,
  lambdaName: string,
  {
    lambdaRelPath,
    handler,
    initialPolicy,
    lambdaLayers,
    environment,
  }: ILambdaWrapperProps
) => {
  const lambdaPath = path.join(lambdasDirPath, lambdaRelPath);

  if (!fs.existsSync(lambdaPath)) {
    throw new Error(`Lambda path does not exist: ${lambdaPath}`);
  }

  return new lambdaNodeJs.NodejsFunction(scope, lambdaName, {
    entry: lambdaPath,
    handler,
    runtime: lambda.Runtime.NODEJS_22_X,
    bundling: buildingProps,
    initialPolicy,
    layers: lambdaLayers,
    environment,
  });
};
