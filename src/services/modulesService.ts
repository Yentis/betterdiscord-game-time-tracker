import { BaseService } from './baseService';
import Dispatcher from 'interfaces/modules/dispatcher';

type Message = {
  content: string;
  invalidEmojis: unknown[];
  tts: boolean;
  validNonShortcutEmojis: unknown[];
};

type MessageModule = {
  sendMessage: (channelId: string, message: Message) => void;
  sendBotMessage: (channelId: string, message: string) => void;
};

type ChannelModule = {
  getCurrentlySelectedChannelId: () => string | undefined;
};

export class ModulesService extends BaseService {
  dispatcher!: Dispatcher;
  messageModule!: MessageModule;
  channelModule!: ChannelModule;

  public start(): Promise<void> {
    this.dispatcher = BdApi.Webpack.getModule(BdApi.Webpack.Filters.byKeys('dispatch', 'subscribe'), {
      searchExports: true,
    }) as Dispatcher;

    this.messageModule = BdApi.Webpack.getModule(BdApi.Webpack.Filters.byKeys('sendMessage')) as MessageModule;
    this.channelModule = BdApi.Webpack.getStore('SelectedChannelStore') as ChannelModule;

    Object.entries(this).forEach(([key, value]) => {
      if (value !== undefined) return;
      this.logger.error(`${key} not found!`);
    });

    return Promise.resolve();
  }

  public stop(): void {
    // Do nothing
  }
}
