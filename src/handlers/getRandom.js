import {success, failure} from '../../libs/response-lib';
import QuotesRepository from '../db/repositories/quotes';
import Logger from "../../libs/logger";

const AWS = require("aws-sdk");
const logger = new Logger();

AWS.config.update({
  region: "us-east-1",
});

const formatQuoteResponse = (response) => {
  return { 'quote': response.Item.quote, 'author': response.Item.author };
};

const handler = async () => {
  logger.log('info', `Returning random quote` );
  try {
    const quotesRepository = new QuotesRepository();
    const response = await quotesRepository.getRandom();
    logger.log('info', `Quote response: ${JSON.stringify(response)}` );
    return success(formatQuoteResponse(response));
  } catch (error) {
    return failure(error, error.statusCode);
  }
};

export { handler };
