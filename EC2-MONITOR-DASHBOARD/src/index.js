import { attachIAMRoleToInstance, verifyInstanceExists } from './lib/ec2.mjs';
import { installCloudWatchAgent, configureMetricsCollection } from './lib/ssm.mjs';
import { createCloudWatchAlarms } from './lib/cloudwatch.mjs';
import { createSNSTopic, subscribeEmail } from './lib/sns.mjs';

export const handler = async (event) => {
  try {
    console.log('Received event:', JSON.stringify(event, null, 2));
    
    const { 
      instanceId, 
      email, 
      thresholds = {
        memory: 80,
        disk: 90,
        swap: 70
      }
    } = event;
    
    if (!instanceId) {
      return {
        statusCode: 400,
        body: 'Missing required parameter: instanceId'
      };
    }
    
    await verifyInstanceExists(instanceId);
    console.log(`Instance ${instanceId} verified`);
    
    await attachIAMRoleToInstance(instanceId, 'CloudWatchAgentServerRole');
    console.log(`IAM role attached to instance ${instanceId}`);
    
    await installCloudWatchAgent(instanceId);
    console.log(`CloudWatch agent installed on instance ${instanceId}`);
    
    // Step 3: Configure metrics collection (memory, disk, swap)
    await configureMetricsCollection(instanceId);
    console.log(`Metrics collection configured on instance ${instanceId}`);
    
    // Step 4: Create SNS topic for alarms
    const topicArn = await createSNSTopic(`EC2-Metrics-Alarm-${instanceId}`);
    console.log(`SNS topic created: ${topicArn}`);
    
    // Step 5: Subscribe email to the SNS topic
    if (email) {
      await subscribeEmail(topicArn, email);
      console.log(`Email ${email} subscribed to SNS topic`);
    }
    
    // Step 6: Create CloudWatch alarms based on thresholds
    await createCloudWatchAlarms(instanceId, thresholds, topicArn);
    console.log(`CloudWatch alarms created for instance ${instanceId}`);
    
    return {
      statusCode: 200,
      body: {
        message: 'EC2 metrics monitoring configured successfully',
        instanceId,
        topicArn,
        thresholds
      }
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: `Error configuring EC2 metrics: ${error.message}`
    };
  }
};
