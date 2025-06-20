import { SSMClient, SendCommandCommand } from "@aws-sdk/client-ssm";

const ssmClient = new SSMClient();


export async function installCloudWatchAgent(instanceId) {
  const command = new SendCommandCommand({
    DocumentName: 'AWS-ConfigureAWSPackage',
    InstanceIds: [instanceId],
    Parameters: {
      action: ['Install'],
      name: ['AmazonCloudWatchAgent']
    }
  });
  
  try {
    await ssmClient.send(command);
  } catch (error) {
    throw new Error(`Error installing CloudWatch agent: ${error.message}`);
  }
}


export async function configureMetricsCollection(instanceId) {
  
  const agentConfig = {
    metrics: {
      append_dimensions: {
        InstanceId: "${aws:InstanceId}"
      },
      metrics_collected: {
        mem: {
          measurement: [
            "mem_used_percent"
          ],
          metrics_collection_interval: 60
        },
        disk: {
          measurement: [
            "used_percent"
          ],
          resources: [
            "/"
          ],
          metrics_collection_interval: 60
        },
        swap: {
          measurement: [
            "swap_used_percent"
          ],
          metrics_collection_interval: 60
        }
      }
    }
  };
  

  const configString = JSON.stringify(agentConfig);
  

  const createParamCommand = new SendCommandCommand({
    DocumentName: 'AWS-RunShellScript',
    InstanceIds: [instanceId],
    Parameters: {
      commands: [
        `echo '${configString}' > /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json`,
        '/opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -s -c file:/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json'
      ]
    }
  });
  
  try {
    await ssmClient.send(createParamCommand);
  } catch (error) {
    throw new Error(`Error configuring metrics collection: ${error.message}`);
  }
}
