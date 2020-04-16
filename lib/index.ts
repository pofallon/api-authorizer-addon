import * as cdk from '@aws-cdk/core';
import * as apigateway from '@aws-cdk/aws-apigateway'
import * as lambda from '@aws-cdk/aws-lambda'
import * as path from 'path'

export interface AddOnProps {
  api: apigateway.RestApi
  integration: apigateway.Integration
}

export class AddOn extends cdk.Construct {

  constructor(scope: cdk.Construct, id: string, props: AddOnProps) {
    super(scope, id);

    const authLambda = new lambda.Function(this, 'AuthLambda', {
      logRetention: 7,
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../auth-lambda'))
    })

    const auth = new apigateway.RequestAuthorizer(this, 'Authorizer', {
      handler: authLambda,
      identitySources: [
        apigateway.IdentitySource.header('Some-Auth-Header')
      ],
    })

    props.api.root.addMethod('POST', props.integration, { 
      authorizationType: apigateway.AuthorizationType.CUSTOM,
      authorizer: auth,
      methodResponses: [ { statusCode: '200' } ]
    })
  }
}
