import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";

interface IRestApiServiceProps extends cdk.StackProps {
  restApiName: string;
}

export class RestApiService extends Construct {
  public restApi: apigateway.RestApi;
  constructor(scope: Construct, id: string, props: IRestApiServiceProps) {
    super(scope, id);

    this.restApi = new apigateway.RestApi(this, props.restApiName);
  }

  addTranlateMethod({
    httpMethod,
    lambda,
  }: {
    httpMethod: string;
    lambda: lambda.IFunction;
  }) {
    this.restApi.root.addMethod(
      httpMethod,
      new apigateway.LambdaIntegration(lambda)
    );
  }
}
