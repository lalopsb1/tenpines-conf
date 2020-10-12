import axios from 'axios';
import { handler as deleteStack, cloudformation, s3 } from '../../../src/handlers/stacks/delete';

const testPromiseResolveFunction = value => () => Promise.resolve(value);
const promisable = myPromiseFn => ({
  promise: myPromiseFn
});

cloudformation.describeStackResource = jest.fn().mockReturnValue(promisable(testPromiseResolveFunction({ "StackResourceDetail": { "PhysicalResourceId": "1234" } })));
s3.listObjects = jest.fn().mockReturnValue(promisable(testPromiseResolveFunction({"Contents": [{ "Key": "value" }] })));
s3.deleteObjects = jest.fn().mockReturnValue(promisable(testPromiseResolveFunction(true)));
cloudformation.deleteStack = jest.fn().mockReturnValue(promisable(testPromiseResolveFunction(true)));
jest.mock('axios')

describe('dev branch', () => {
  describe('when it is triggered from the dev branch', () => {
    const event ={ "body":  JSON.stringify({ "action": "closed", "pull_request": { "number": "3" } }) }

    it('returns the branch name and does not continue with the deletion', async () => {
      axios.get.mockResolvedValue({ "data": { "head": { "ref": "dev"} } });
      const devResponse = await deleteStack(event)

      expect(devResponse.statusCode).toEqual(200)
      expect(JSON.parse(devResponse.body)).toEqual('dev')
    })
  })
})

describe('bad request', () => {
  describe('when it is triggered with wrong params', () => {
    const badRequestEvent ={ "body":  JSON.stringify({ "action": "closed" }) }

    it('returns a bad request response', async () => {
      const badRequestResponse = await deleteStack(badRequestEvent)

      expect(badRequestResponse.statusCode).toEqual(400)
      expect(JSON.parse(badRequestResponse.body)).toEqual('Bad request!')
    })
  })
})

describe('pr branch', () => {
  describe('when it is triggered from a branch pr', () => {
    const requestEvent ={ "body":  JSON.stringify({ "action": "closed", "pull_request": { "number": "3" } }) }

    it('returns a bad request response', async () => {
      axios.get.mockResolvedValue({ "data": { "head": { "ref": "pr-3"} } });
      const fullResponse = await deleteStack(requestEvent)

      expect(cloudformation.describeStackResource).toHaveBeenCalledWith({
        LogicalResourceId: 'ServerlessDeploymentBucket',
        StackName: "-pr-3"
      })
      expect(s3.listObjects).toHaveBeenCalledWith({
        Bucket: '1234'
      })
      expect(s3.deleteObjects).toHaveBeenCalledWith({
        Bucket: '1234',
        Delete: { "Objects": [{ "Key": "value" }] }
      })
      expect(fullResponse.statusCode).toEqual(200)
    })
  })
})
