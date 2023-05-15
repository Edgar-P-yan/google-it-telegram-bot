/* eslint-disable @typescript-eslint/no-explicit-any */
// tslint:disable no-unused-expression

import sinon from 'sinon';
import chai, { expect } from 'chai';
import { InlineQueryResult } from 'telegraf/typings/telegram-types';
import chaiSubset from 'chai-subset';
import { NothingFoundResponse } from './nothing-found-response';
chai.use(chaiSubset);

describe('NothingFoundResponse', () => {
  let nothingFoundResponse: NothingFoundResponse;

  beforeEach(() => {
    nothingFoundResponse = new NothingFoundResponse();
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
      await nothingFoundResponse.send(ctx as any, 0);

      expect(ctx.answerInlineQuery.calledOnce).true;

      const [inlineQueryResults] = ctx.answerInlineQuery.args[0];

      expect(inlineQueryResults).lengthOf(1);
      expect(inlineQueryResults).containSubset([
        {
          type: 'article',
          title: (v: any) => /nothing.+found/i.test(v),
          id: (v: any) => /^\d+$/.test(v),
          input_message_content: {
            message_text: (v: any) => /nothing.+found/i.test(v),
          },
        },
      ]);
    });

    it('sets cache time', async () => {
      await nothingFoundResponse.send(ctx as any, 123);

      expect(ctx.answerInlineQuery.calledOnce).true;

      const [, extra] = ctx.answerInlineQuery.args[0];

      expect(extra).containSubset({
        cache_time: 123,
      });
    });
  });
});
