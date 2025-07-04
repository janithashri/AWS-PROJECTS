import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({ region: "us-east-1" });

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
      },
      body: JSON.stringify({ message: 'CORS enabled' })
    };
  }
  console.log("Input to lambda function", event);

  try {
    let body;
    let longURL;

    try {
      if (event.body) {
        body = JSON.parse(event.body);
        longURL = body.longURL || body;
      }
    } catch (error) {
      longURL = event.body;
    }

    if (!longURL || typeof longURL !== 'string' || !longURL.startsWith("http")) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "longURL is not valid" })
      };
    }

    const shortURL = Math.random().toString(36).substring(2, 8);

    const params = {
      TableName: "Your Table Name",
      Item: {
        shortid: { S: shortURL },
        longURL: { S: longURL },
        owner: { S: "owner" }
      }
    };

    const command = new PutItemCommand(params);
    const data = await client.send(command);
    console.log("Response post create", data);

    return {
      statusCode: 201,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Successfully created shortURL",
        shortURL: shortURL,
        longURL: longURL
      })
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Error creating shortURL", error: err.message })
    };
  }
};