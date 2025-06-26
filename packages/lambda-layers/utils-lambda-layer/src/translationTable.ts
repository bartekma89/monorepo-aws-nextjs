import * as dynamodb from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { ITranslateDbObject } from "@sff/shared-types";
import { exceptions } from ".";

export class TranslationTable {
  private dynamodbClient: dynamodb.DynamoDBClient;
  private tableName: string;
  private partitionKey: string;

  constructor({
    tableName,
    partitionKey,
  }: {
    tableName: string;
    partitionKey: string;
  }) {
    this.dynamodbClient = new dynamodb.DynamoDBClient({});
    this.tableName = tableName;
    this.partitionKey = partitionKey;
  }

  async insertTranslation(data: ITranslateDbObject) {
    const tableInsetCmd: dynamodb.PutItemCommandInput = {
      TableName: this.tableName,
      Item: marshall(data),
    };

    await this.dynamodbClient.send(new dynamodb.PutItemCommand(tableInsetCmd));
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

    return Items.map((item) => unmarshall(item) as ITranslateDbObject);
  }
}
