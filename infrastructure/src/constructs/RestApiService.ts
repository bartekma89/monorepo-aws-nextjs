import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as cognito from "aws-cdk-lib/aws-cognito";

interface IRestApiServiceProps extends cdk.StackProps {
  userPool: cognito.UserPool;
}

export class RestApiService extends Construct {
  public restApi: apigateway.RestApi;
  public authorizer?: apigateway.CognitoUserPoolsAuthorizer;

  constructor(
    scope: Construct,
    id: string,
    { userPool }: IRestApiServiceProps
  ) {
    super(scope, id);

    this.restApi = new apigateway.RestApi(this, "TranslateRestApi", {
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowCredentials: true,
        allowHeaders: apigateway.Cors.DEFAULT_HEADERS,
      },
    });

    // create the authorizer if userPool exists
    if (userPool) {
      this.authorizer = new apigateway.CognitoUserPoolsAuthorizer(
        this,
        "authorizer",
        {
          authorizerName: "userPoolAutorizer",
          cognitoUserPools: [userPool],
        }
      );
    }
  }

  addTranlateMethod({
    httpMethod,
    lambda,
    isAuth,
  }: {
    httpMethod: string;
    lambda: lambda.IFunction;
    isAuth?: boolean;
  }) {
    let options: apigateway.MethodOptions = {};
    if (isAuth) {
      if (!this.authorizer) {
        throw new Error("Authorizer is not set");
      }

      options = {
        authorizer: this.authorizer,
        authorizationType: apigateway.AuthorizationType.COGNITO,
      };
    }

    this.restApi.root.addMethod(
      httpMethod,
      new apigateway.LambdaIntegration(lambda),
      options
    );
  }
}
