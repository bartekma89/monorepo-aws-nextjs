import * as dynamodb from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { ITranslatePrimaryKey, ITranslateResult } from "@sff/shared-types";
import { exceptions } from ".";

export class TranslationTable {
  private dynamodbClient: dynamodb.DynamoDBClient;
  private tableName: string;
  private partitionKey: string;
  private sortKey: string;

  constructor({
    tableName,
    partitionKey,
    sortKey,
  }: {
    tableName: string;
    partitionKey: string;
    sortKey: string;
  }) {
    this.dynamodbClient = new dynamodb.DynamoDBClient({});
    this.tableName = tableName;
    this.partitionKey = partitionKey;
    this.sortKey = sortKey;
  }

  async insertTranslation(data: ITranslateResult) {
    const tableInsetCmd: dynamodb.PutItemCommandInput = {
      TableName: this.tableName,
      Item: marshall(data),
    };

    await this.dynamodbClient.send(new dynamodb.PutItemCommand(tableInsetCmd));
  }

  async queryTranslation({ username }: ITranslatePrimaryKey) {
    const queryCmd: dynamodb.QueryCommandInput = {
      TableName: this.tableName,
      KeyConditionExpression: "#pk = :username",
      ExpressionAttributeNames: {
        "#pk": "username",
      },
      ExpressionAttributeValues: {
        ":username": { S: username },
      },
      ScanIndexForward: true,
    };

    const { Items } = await this.dynamodbClient.send(
      new dynamodb.QueryCommand(queryCmd)
    );

    if (!Items) {
      return [];
    }

    return Items.map((item) => unmarshall(item) as ITranslateResult);
  }

  async getAllTranslations() {
    const { Items } = await this.dynamodbClient.send(
      new dynamodb.ScanCommand({
        TableName: this.tableName,
      })
    );

    if (!Items) {
      throw new exceptions.MissingParameters("Items");
    }

    return Items.map((item) => unmarshall(item) as ITranslateResult);
  }

  async deleteTranslation(item: ITranslatePrimaryKey) {
    const tabledeleteCmd: dynamodb.DeleteItemCommandInput = {
      TableName: this.tableName,
      Key: {
        [this.partitionKey]: { S: item.username },
        [this.sortKey]: { S: item.requestId },
      },
    };

    await this.dynamodbClient.send(
      new dynamodb.DeleteItemCommand(tabledeleteCmd)
    );

    return item;
  }
}
