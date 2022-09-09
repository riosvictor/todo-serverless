import { APIGatewayProxyHandler } from "aws-lambda"
import { document } from "../utils/dynamodbClient";
import * as crypto from 'crypto';

interface ITodo {
  title: string;
  deadline: string;
}

export const handler: APIGatewayProxyHandler = async (event) => {
  const { user_id } = event.pathParameters;
  const { title, deadline } = JSON.parse(event.body) as ITodo;
  const id = crypto.randomUUID();

  await document.put({
    TableName: 'todos',
    Item: {
      id,
      user_id,
      title,
      done: false,
      deadline
    }
  })
  .promise();

  const response = await document.query({
    TableName: 'todos',
    KeyConditionExpression: 'id = :id',
    ExpressionAttributeValues: {
      ':id': id
    }
  })
  .promise();

  return {
    statusCode: 201,
    body: JSON.stringify(response.Items[0])
  }
}