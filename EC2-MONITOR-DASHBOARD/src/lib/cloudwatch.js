import { CloudWatchClient, PutMetricAlarmCommand } from "@aws-sdk/client-cloudwatch";

const cloudWatchClient = new CloudWatchClient();

export async function createCloudWatchAlarms(instanceId, thresholds, topicArn) {
  const alarms = [
    {
      name: 'MemoryUtilization',
      namespace: 'CWAgent',
      metricName: 'mem_used_percent',
      threshold: thresholds.memory || 80,
      description: 'Memory utilization is too high'
    },
    {
      name: 'DiskUtilization',
      namespace: 'CWAgent',
      metricName: 'disk_used_percent',
      threshold: thresholds.disk || 90,
      description: 'Disk utilization is too high'
    },
    {
      name: 'SwapUtilization',
      namespace: 'CWAgent',
      metricName: 'swap_used_percent',
      threshold: thresholds.swap || 70,
      description: 'Swap utilization is too high'
    }
  ];
  
  const promises = alarms.map(alarm => createAlarm(instanceId, alarm, topicArn));
  await Promise.all(promises);
}

async function createAlarm(instanceId, alarm, topicArn) {
  const command = new PutMetricAlarmCommand({
    AlarmName: `${instanceId}-${alarm.name}`,
    ComparisonOperator: 'GreaterThanThreshold',
    EvaluationPeriods: 2,
    MetricName: alarm.metricName,
    Namespace: alarm.namespace,
    Period: 300,
    Statistic: 'Average',
    Threshold: alarm.threshold,
    ActionsEnabled: true,
    AlarmActions: [topicArn],
    AlarmDescription: alarm.description,
    Dimensions: [
      {
        Name: 'InstanceId',
        Value: instanceId
      }
    ]
  });
  
  try {
    await cloudWatchClient.send(command);
  } catch (error) {
    throw new Error(`Error creating alarm ${alarm.name}: ${error.message}`);
  }
}
