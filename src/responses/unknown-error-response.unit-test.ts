/* eslint-disable @typescript-eslint/no-explicit-any */
// tslint:disable no-unused-expression

import sinon from 'sinon';
import chai, { expect } from 'chai';
import { InlineQueryResult } from 'telegraf/typings/telegram-types';
import chaiSubset from 'chai-subset';
import { UnknownErrorResponse } from './unknown-error-response';
chai.use(chaiSubset);

describe('UnknownErrorResponse', () => {
  let unknownErrorResponse: UnknownErrorResponse;

  beforeEach(() => {
    unknownErrorResponse = new UnknownErrorResponse();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('#send', () => {
    let ctx: {
      answerInlineQuery: sinon.SinonStub<
        [InlineQueryResult[], object],
        undefined
      >;
    };

    beforeEach(() => {
      ctx = {
        answerInlineQuery: sinon
          .stub<[InlineQueryResult[], object], undefined>()
          .resolves(),
      };
    });

    it('sends correct inline query result', async () => {
      await unknownErrorResponse.send(ctx as any);

      expect(ctx.answerInlineQuery.calledOnce).true;

      const [inlineQueryResults] = ctx.answerInlineQuery.args[0];

      expect(inlineQueryResults).lengthOf(1);
      expect(inlineQueryResults).containSubset([
        {
          type: 'article',
          title: (v: any) => /error/i.test(v),
          id: (v: any) => /^\d+$/.test(v),
          input_message_content: {
            message_text: (v: any) => /error/i.test(v),
          },
        },
      ]);
    });
  });
});
