// tslint:disable no-unused-expression
import 'reflect-metadata';
import { Container } from 'inversify';
import { TYPES } from '../src/types';
import { BotHelpers } from '../src/services/bot-helpers';
import { IBotHelpers, NSGoogleCSE } from '../src/interfaces';
import { Logger } from 'winston';
import { Substitute } from '@fluffy-spoon/substitute';
import { BotGoogleSearchHandler } from '../src/services/bot-google-search-handler';
import sinon from 'sinon';
import { InlineQueryResult } from 'telegraf/typings/telegram-types';
import { expect } from 'chai';
import { customsearch_v1 } from 'googleapis';

describe('BotGoogleSearchHandler', () => {
  let container: Container;

  beforeEach(() => {
    container = new Container();
    container.bind<IBotHelpers>(TYPES.BotHelpers).to(BotHelpers);
    container
      .bind<Logger>(TYPES.Logger)
      .toConstantValue(Substitute.for<Logger>());
    container.bind<NSGoogleCSE.IService>(TYPES.GoogleCSE).toConstantValue({
      search: sinon.stub().resolves([]),
      searchImages: sinon.stub().resolves([]),
    });
    container.bind(TYPES.BotGoogleSearchHandler).to(BotGoogleSearchHandler);
  });

  describe('#constructor', () => {
    it('should construct', () => {
      const botGoogleSearchHandler = container.get<BotGoogleSearchHandler>(
        TYPES.BotGoogleSearchHandler,
      );
      expect(botGoogleSearchHandler).instanceOf(BotGoogleSearchHandler);
    });
  });

  describe('#handle', () => {
    it('sends empty response when message is empty', async () => {
      const ctx = {
        answerInlineQuery: sinon.stub().resolves(true),
        inlineQuery: { offset: '0' },
        from: { language_code: 'en' },
      };

      const googleSearchHandler = container.get<BotGoogleSearchHandler>(
        TYPES.BotGoogleSearchHandler,
      );

      await googleSearchHandler.handle('', ctx as any);

      expect(ctx.answerInlineQuery.calledOnce).true;
      const [resultItems] = ctx.answerInlineQuery.args[0];
      expect(resultItems)
        .be.an('array')
        .lengthOf(0);
    });

    it('sends not found message if search result is empty', async () => {
      const ctx = {
        answerInlineQuery: sinon.stub().resolves(true),
        inlineQuery: { offset: '0' },
        from: { language_code: 'en' },
      };

      const googleSearchHandler = container.get<BotGoogleSearchHandler>(
        TYPES.BotGoogleSearchHandler,
      );

      await googleSearchHandler.handle('cats', ctx as any);

      expect(ctx.answerInlineQuery.calledOnce).true;
      const [inlineQueryResults] = ctx.answerInlineQuery.args[0];

      expect(inlineQueryResults)
        .be.an('array')
        .lengthOf(1);

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

      container.unbind(TYPES.GoogleCSE);
      container.bind<NSGoogleCSE.IService>(TYPES.GoogleCSE).toConstantValue({
        search: sinon
          .stub<any[], Promise<customsearch_v1.Schema$Result[]>>()
          .resolves([
            {
              title: 'result 1',
            },
          ]),
        searchImages: sinon.stub().resolves([]),
      });

      const googleSearchHandler = container.get<BotGoogleSearchHandler>(
        TYPES.BotGoogleSearchHandler,
      );

      await googleSearchHandler.handle('cats', ctx as any);

      expect(ctx.answerInlineQuery.calledOnce).true;
      const [inlineQueryResults] = ctx.answerInlineQuery.args[0];
      expect(inlineQueryResults)
        .be.an('array')
        .lengthOf(1);
      expect(inlineQueryResults).containSubset([
        {
          title: (v: any) => /result/i.test(v),
        },
      ]);
    });
  });
});
