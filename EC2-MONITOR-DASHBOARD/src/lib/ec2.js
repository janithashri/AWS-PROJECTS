import { EC2Client, DescribeInstancesCommand, AssociateIamInstanceProfileCommand } from "@aws-sdk/client-ec2";
import { IAMClient, CreateRoleCommand, AttachRolePolicyCommand, CreateInstanceProfileCommand, AddRoleToInstanceProfileCommand, GetInstanceProfileCommand, GetRoleCommand } from "@aws-sdk/client-iam";

const ec2Client = new EC2Client();
const iamClient = new IAMClient();

export async function verifyInstanceExists(instanceId) {
  try {
    const command = new DescribeInstancesCommand({
      InstanceIds: [instanceId]
    });
    
    const response = await ec2Client.send(command);
    
    if (response.Reservations && 
        response.Reservations.length > 0 && 
        response.Reservations[0].Instances && 
        response.Reservations[0].Instances.length > 0) {
      return response.Reservations[0].Instances[0].State.Name;
    }
    
    return 'not-found';
  } catch (error) {
    console.error('Error verifying instance:', error);
    throw error;
  }
}

export async function ensureCloudWatchAgentRole(roleName = 'CloudWatchAgentServerRole') {
  try {
    
    try {
      const getRoleCommand = new GetRoleCommand({
        RoleName: roleName
      });
      await iamClient.send(getRoleCommand);
      console.log(`Role ${roleName} already exists`);
      
      
      try {
        const getProfileCommand = new GetInstanceProfileCommand({
          InstanceProfileName: roleName
        });
        await iamClient.send(getProfileCommand);
        console.log(`Instance profile ${roleName} already exists`);
        return roleName; 
      } catch (profileError) {
        if (profileError.name !== 'NoSuchEntityException') {
          throw profileError;
        }
        
        console.log(`Creating instance profile ${roleName}`);
        const createProfileCommand = new CreateInstanceProfileCommand({
          InstanceProfileName: roleName
        });
        await iamClient.send(createProfileCommand);
        
        const addRoleCommand = new AddRoleToInstanceProfileCommand({
          InstanceProfileName: roleName,
          RoleName: roleName
        });
        await iamClient.send(addRoleCommand);
        return roleName;
      }
    } catch (roleError) {
      if (roleError.name !== 'NoSuchEntityException') {
        throw roleError;
      }
    }

    
    console.log(`Creating role ${roleName}`);
    const createRoleCommand = new CreateRoleCommand({
      RoleName: roleName,
      AssumeRolePolicyDocument: JSON.stringify({
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Principal: {
              Service: "ec2.amazonaws.com"
            },
            Action: "sts:AssumeRole"
          }
        ]
      })
    });

    await iamClient.send(createRoleCommand);

    const attachPolicyCommand = new AttachRolePolicyCommand({
      RoleName: roleName,
      PolicyArn: "arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy"
    });
    await iamClient.send(attachPolicyCommand);

    const createProfileCommand = new CreateInstanceProfileCommand({
      InstanceProfileName: roleName
    });
    await iamClient.send(createProfileCommand);

    const addRoleCommand = new AddRoleToInstanceProfileCommand({
      InstanceProfileName: roleName,
      RoleName: roleName
    });
    await iamClient.send(addRoleCommand);
    
    return roleName;
  } catch (error) {
    console.error('Error creating IAM role and instance profile:', error);
    throw error;
  }
}

export async function attachIAMRoleToInstance(instanceId, roleName = 'CloudWatchAgentServerRole') {
  try {
    
    await ensureCloudWatchAgentRole(roleName);
    

    const command = new AssociateIamInstanceProfileCommand({
      InstanceId: instanceId,
      IamInstanceProfile: {
        Name: roleName
      }
    });
    
    await ec2Client.send(command);
    console.log(`IAM role ${roleName} attached to instance ${instanceId}`);
  } catch (error) {
    if (error.name === 'InvalidParameterValue' && 
        error.message.includes('already has an IAM instance profile associated with it')) {
      console.log(`Instance ${instanceId} already has an IAM role attached`);
      return;
    }
    console.error(`Error attaching IAM role: ${error.message}`);
    throw new Error(`Error attaching IAM role: ${error.message}`);
  }
}
