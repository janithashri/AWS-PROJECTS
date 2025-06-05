// src/lib/ec2.js
import { EC2Client, DescribeInstancesCommand, AssociateIamInstanceProfileCommand } from "@aws-sdk/client-ec2";
import { IAMClient, CreateRoleCommand, AttachRolePolicyCommand, CreateInstanceProfileCommand, AddRoleToInstanceProfileCommand, GetInstanceProfileCommand, GetRoleCommand } from "@aws-sdk/client-iam";

// Remove this line:
// import { logger } from '../utils/logger.js';

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
    // Check if the role already exists
    try {
      const getRoleCommand = new GetRoleCommand({
        RoleName: roleName
      });
      await iamClient.send(getRoleCommand);
      console.log(`Role ${roleName} already exists`);
      
      // Check if the instance profile exists
      try {
        const getProfileCommand = new GetInstanceProfileCommand({
          InstanceProfileName: roleName
        });
        await iamClient.send(getProfileCommand);
        console.log(`Instance profile ${roleName} already exists`);
        return roleName; // Both role and profile exist
      } catch (profileError) {
        if (profileError.name !== 'NoSuchEntityException') {
          throw profileError;
        }
        // Only create the instance profile and add the role
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
      // Role doesn't exist, continue to create it
    }

    // Create the role with trust relationship for EC2
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

    // Attach the CloudWatch Agent policy to the role
    const attachPolicyCommand = new AttachRolePolicyCommand({
      RoleName: roleName,
      PolicyArn: "arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy"
    });
    await iamClient.send(attachPolicyCommand);

    // Create the instance profile
    const createProfileCommand = new CreateInstanceProfileCommand({
      InstanceProfileName: roleName
    });
    await iamClient.send(createProfileCommand);

    // Add the role to the instance profile
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
    // First ensure the role and instance profile exist
    await ensureCloudWatchAgentRole(roleName);
    
    // Then attach the role to the instance
    const command = new AssociateIamInstanceProfileCommand({
      InstanceId: instanceId,
      IamInstanceProfile: {
        Name: roleName
      }
    });
    
    await ec2Client.send(command);
    console.log(`IAM role ${roleName} attached to instance ${instanceId}`);
  } catch (error) {
    // If the error is because the role is already attached, we can ignore it
    if (error.name === 'InvalidParameterValue' && 
        error.message.includes('already has an IAM instance profile associated with it')) {
      console.log(`Instance ${instanceId} already has an IAM role attached`);
      return;
    }
    console.error(`Error attaching IAM role: ${error.message}`);
    throw new Error(`Error attaching IAM role: ${error.message}`);
  }
}
