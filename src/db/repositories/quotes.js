import Repository from './repository';
import Logger from "../../../libs/logger";

const logger = new Logger();
const tableName = process.env.tableName || 'test_simpsonsquotes';

const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const getRandomId = (ids) => {
    const index = getRandomInt(0, ids.length);
    return ids[index]['id'];
};

class QuotesRepository extends Repository {
  async updateOrCreate(quoteId, author, quote) {
    await this.putToDynamo(quoteId, author, quote);
  }

  async putToDynamo(quoteId, author, quote) {
    let params = {
      TableName: tableName,
      Item: {"id": quoteId, "author": author, "quote": quote}
    };
    await this.client.put(params).promise()
      .then(logger.log('info', `PutItem succeeded: ${quoteId}`))
      .catch(err => logger.log('info', `Unable to put item. Error JSON: ${JSON.stringify(err, null, 2)}`));
  }

  async get(quoteId) {
    const params = {
      TableName: tableName,
      Key: {
        "id": quoteId
      }
    };
    return await this.client.get(params).promise()
      .catch((error) => {
        logger.log('error', `Error when trying to return quote for id: ${quoteId}. Error: ${error}`);
        throw error;
      })
      .then(item => {
        logger.log('info', `Returning quote for id: ${quoteId}`);
        return item;
      });
  }

  async getRandom() {
    const params = {
      TableName: tableName,
      ProjectionExpression: 'id'
    };
    return await this.client.scan(params).promise()
      .then(ids => {
        logger.log('info', `Retrieving ids`);
        return getRandomId(ids.Items);
      })
      .then(id => {
        logger.log('info', `Retrieving quote for id: ${id}`);
        return this.get(id);
      })
      .catch((error) => {
        logger.log('error', `Error while retrieving random quote`);
        throw error;
      });
  }
}

export default QuotesRepository;
