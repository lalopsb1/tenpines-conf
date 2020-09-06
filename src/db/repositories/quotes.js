import Repository from './repository';
import Logger from "../../../libs/logger";

const logger = new Logger();
const tableName = process.env.tableName || 'test_simpsonsquotes';

class QuotesRepository extends Repository {
  async updateOrCreate(quoteId, author, quote) {
    await this.putToDynamo(quoteId, author, quote);
  }

  async putToDynamo(quoteId, author, quote) {
    let params = {
      TableName: tableName,
      Item: { "id": quoteId, "author": author, "quote": quote }
    };
    await this.client.put(params).promise()
      .then(logger.log('info', `PutItem succeeded: ${quoteId}`))
      .catch(err => logger.log('info', `Unable to put item. Error JSON: ${JSON.stringify(err, null, 2)}`));
  }
}

export default QuotesRepository;
