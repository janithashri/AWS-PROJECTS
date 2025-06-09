import { SNSClient, CreateTopicCommand, SubscribeCommand } from "@aws-sdk/client-sns";

const snsClient = new SNSClient();


export async function createSNSTopic(topicName) {
  const command = new CreateTopicCommand({
    Name: topicName
  });
  
  try {
    const response = await snsClient.send(command);
    return response.TopicArn;
  } catch (error) {
    throw new Error(`Error creating SNS topic: ${error.message}`);
  }
}


export async function subscribeEmail(topicArn, email) {
  const command = new SubscribeCommand({
    TopicArn: topicArn,
    Protocol: 'email',
    Endpoint: email
  });
  
  try {
    await snsClient.send(command);
  } catch (error) {
    throw new Error(`Error subscribing email to SNS topic: ${error.message}`);
  }
}
