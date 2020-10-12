import {success, failure} from '../../../../libs/response-lib';
import Logger from '../../../../libs/logger';
import { BadRequestError } from "../../../../libs/errors";
import AWS, { S3, CloudFormation } from 'aws-sdk';
import axios from 'axios';

AWS.config.update({
  region: "us-east-1",
});

export const cloudformation = new CloudFormation();
export const s3 = new S3();
const logger = new Logger();
const repository = process.env.repository || '';
const githubKey = process.env.githubKey || '';

const getStackBucketResource = async (stackName) => {
  const params = {
    LogicalResourceId: 'ServerlessDeploymentBucket',
    StackName: stackName
  };
  return await cloudformation.describeStackResource(params).promise();
};

const deleteStack = async (stackName) => {
 const params = {
   StackName: stackName
 };
 logger.log('info', `Deleting stack: ${stackName}`);
 return await cloudformation.deleteStack(params).promise();
};

const emptyServerlessDeploymentBucket = async (bucketId) => {
  try {
    logger.log('info', `Deleting content for bucket: ${bucketId}`);
    const { Contents } = await s3.listObjects({Bucket: bucketId}).promise();
    logger.log('info', `Deleting content for bucket: ${bucketId}`);
    if (Contents.length > 0) {
      await s3.deleteObjects({
        Bucket: bucketId,
        Delete: {
          Objects: Contents.map(({Key}) => ({Key}))
        }
      }).promise();
      }
    logger.log('info', 'Bucket contents deleted');
    } catch(error) {
    logger.log('info', `There was an error emptying the bucket: ${bucketId}`);
  }
};

const getBranchName = (prNumber) => {
  return axios.get(`https://api.github.com/repos/teespring/teespring-utils-lambda/pulls/${prNumber}`, {
    headers: {
      'Authorization': `bearer ${githubKey}`,
      'Content-Type': 'application/json',
      'User-Agent': 'teespring'
    }
  })
  .then(response => {
    return response.data.head.ref;
  })
  .catch(error => {
    logger.log('info', error);
  });
};

const handler = async (event) => {
  try {
    const eventBody = event.body && JSON.parse(event.body);
    const action = eventBody.action;
    const prNumber = eventBody.pull_request && eventBody.pull_request.number;
    const prBranchName = await getBranchName(prNumber);
    if ( !action || !prNumber) {
       throw new BadRequestError();
    }
    if (prBranchName === 'dev') {
      logger.log('info', 'Dev branch should not be torn down.');
      return success(prBranchName);
    }
    const stackName = `${repository}-pr-${prNumber}`;
    const stackBucketResource = await getStackBucketResource(stackName);
    logger.log('info', `Stack resources for deletion: ${JSON.stringify(stackBucketResource)}`);
    const bucketId = stackBucketResource.StackResourceDetail.PhysicalResourceId;
    await emptyServerlessDeploymentBucket(bucketId);
    const response = await deleteStack(stackName);

    return success(response);
  } catch (error) {
    logger.log('error', `error code ${error.statusCode}, error: ${JSON.stringify(error.message)}`);
    return failure(error.message, error.statusCode);
  }
};

export {handler};
