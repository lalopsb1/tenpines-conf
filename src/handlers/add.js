import {success, failure} from '../../libs/response-lib';
import {BadRequestError} from "../../libs/errors";
import QuotesRepository from '../db/repositories/quotes';
import { v4 as uuidv4 } from 'uuid';
import Logger from "../../libs/logger";

const AWS = require("aws-sdk");
const logger = new Logger();

AWS.config.update({
  region: "us-east-1",
});

const generateQuoteId = () => uuidv4();

const handler = async (event) => {
  const eventBody = event.body && JSON.parse(event.body);
  logger.log('info', `Called lambda with event: ${JSON.stringify(eventBody)}` );
  const author = eventBody.author;
  const quote = eventBody.quote;
  try {
    if (!author || !quote) {
      throw new BadRequestError();
    }
    const quotesRepository = new QuotesRepository();
    const quoteId = generateQuoteId();
    logger.log('info', `Generated quoteId: ${quoteId}` );
    const quoteResponse = await quotesRepository.updateOrCreate(quoteId, author, quote);
    logger.log('info', `Quote response: ${JSON.stringify(quoteResponse)}` );
    return success(quoteResponse);
  } catch (error) {
    return failure(error, error.statusCode);
  }
};

export { handler };
