import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";

const client = new DynamoDBClient({ region: "us-east-1" });

export const handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };
  console.log("Input to lambda function", event);

  const shortURL = event.pathParameters?.shortURL || event.queryStringParameters?.shortURL || event.shortURL;

  if (!shortURL) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "shortURL is required" })
    };
  }

  const params = {
    TableName: "URL-shortener",
    Key: { shortid: { S: shortURL } }
  };

  try {
    const command = new GetItemCommand(params);
    const { Item } = await client.send(command);

    if (!Item) {
      return {
        statusCode: 404,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "URL not found" })
      };
    }

    const unmarshalledItem = unmarshall(Item);
    console.log("Retrieved item:", unmarshalledItem);

    return {
      statusCode: 302,
      headers: {
        "Location": unmarshalledItem.longURL,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message: "Redirecting to " + unmarshalledItem.longURL })
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Error fetching URL", error: err.message })
    };
  }
};