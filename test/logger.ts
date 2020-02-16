import {
  createLogger,
  loggerDynamicValueFactory,
} from './../src/services/logger';
import { expect } from 'chai';

describe('Logger', () => {
  describe('#createLogger()', () => {
    it('successfully creates instance', () => {
      const logger = createLogger();

      expect(logger).be.an('object');

      logger.close();
    });
  });

  describe('#loggerDynamicValueFactory', () => {
    it('successfully creates instance', () => {
      const logger = loggerDynamicValueFactory({
        currentRequest: {
          parentRequest: {
            serviceIdentifier: Symbol.for('TEST_IDENTIFIER'),
          },
        },
      } as any);

      expect(logger).be.an('object');

      logger.close();
    });
  });
});
