/* eslint-disable @typescript-eslint/no-explicit-any */
// tslint:disable no-unused-expression

import { Logger } from 'winston';
import { Substitute } from '@fluffy-spoon/substitute';
import sinon from 'sinon';
import { customsearch_v1 } from 'googleapis';
import { BotGoogleSearchCommand } from './bot-google-search-command';
import { GoogleCSE } from '../../searchers/google-cse/google-cse';
import chai, { expect } from 'chai';
import chaiSubset from 'chai-subset';
chai.use(chaiSubset);

describe('BotGoogleSearchCommand', () => {
  let command: BotGoogleSearchCommand;

  beforeEach(() => {
    command = new BotGoogleSearchCommand(
      {
        search: sinon.stub().resolves([]),
        searchImages: sinon.stub().resolves([]),
      } as unknown as GoogleCSE,
      Substitute.for<Logger>(),
    );
  });

  describe('#act', () => {
    it('sends empty response when message is empty', async () => {
      const ctx = {
        answerInlineQuery: sinon.stub().resolves(true),
        inlineQuery: { offset: '0' },
        from: { language_code: 'en' },
      };

      await command.act('', ctx as any);

      expect(ctx.answerInlineQuery.calledOnce).true;
      const [resultItems] = ctx.answerInlineQuery.args[0];
      expect(resultItems).be.an('array').lengthOf(0);
    });

    it('sends not found message if search result is empty', async () => {
      const ctx = {
        answerInlineQuery: sinon.stub().resolves(true),
        inlineQuery: { offset: '0' },
        from: { language_code: 'en' },
      };

      await command.act('cats', ctx as any);

      expect(ctx.answerInlineQuery.calledOnce).true;
      const [inlineQueryResults] = ctx.answerInlineQuery.args[0];

      expect(inlineQueryResults).be.an('array').lengthOf(1);

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

    it('sends results', async () => {
      const ctx = {
        answerInlineQuery: sinon.stub().resolves(true),
        inlineQuery: { offset: '0' },
        from: { language_code: 'en' },
      };

      command = new BotGoogleSearchCommand(
        {
          search: sinon
            .stub<any[], Promise<customsearch_v1.Schema$Result[]>>()
            .resolves([
              {
                title: 'result 1',
              },
            ]),
          searchImages: sinon.stub().resolves([]),
        } as unknown as GoogleCSE,
        Substitute.for<Logger>(),
      );

      await command.act('cats', ctx as any);

      expect(ctx.answerInlineQuery.calledOnce).true;
      const [inlineQueryResults] = ctx.answerInlineQuery.args[0];
      expect(inlineQueryResults).be.an('array').lengthOf(1);
      expect(inlineQueryResults).containSubset([
        {
          title: (v: any) => /result/i.test(v),
        },
      ]);
    });
  });
});
