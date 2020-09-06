import {success, failure} from '../../libs/response-lib';
import {BadRequestError} from "../../libs/errors";
import QuotesRepository from '../db/repositories/quotes';
import { v4 as uuidv4 } from 'uuid';

const AWS = require("aws-sdk");

AWS.config.update({
  region: "us-west-1",
});

const generateQuoteId = () => uuidv4();

const handler = async (event) => {
  const eventBody = event.body && JSON.parse(event.body);
  const author = eventBody.author;
  const quote = eventBody.quote;
  try {
    if (!author || !quote) {
      throw new BadRequestError();
    }
    const quotesRepository = new QuotesRepository();
    const quoteId = generateQuoteId();
    const quoteResponse = await quotesRepository.updateOrCreate(quoteId, author, quote);
    return success(quoteResponse);
  } catch (error) {
    return failure(error, error.statusCode);
  }
};

export { handler };
