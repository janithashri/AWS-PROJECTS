import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({ region: "us-east-1" }); 
export const handler = async (event) => {
  console.log("Input to lambda function", event);
  const { shortURL, longURL } = event;

  const params = {
    TableName: "URL-shortener",
    Item: {
      shortid: { S: shortURL },
      longURL: { S: longURL },
      owner: { S: "owner" }
    }
  };

  try {
    const command = new PutItemCommand(params);
    const data = await client.send(command);
    console.log("Response post create", data);
    return "Successfully created shortURL";
  } catch (err) {
    console.error(err);
    throw err; 
  }
};
