import { BaseService } from './baseService';
import Dispatcher from 'interfaces/modules/dispatcher';
import { Utils } from '../utils/utils';

type CommandOption = {
  name: string;
  displayName: string;
  type: number;
  description: string;
  displayDescription: string;
  required?: boolean;
  options?: CommandOption[];
  choices?: {
    name: string;
    displayName: string;
    value: string;
  }[];
};

export type Command = {
  applicationId: string;
  displayDescription: string;
  displayName: string;
  id: string;
  inputType: number;
  options: CommandOption[];
  type: number;
  untranslatedDescription: string;
  untranslatedName: string;
  execute: (event: { name: string; value: string }[]) => { content: string } | void;
};

type CommandsModule = {
  key?: string;
  module?: Record<string, unknown>;
};

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
  commandsModule: CommandsModule = {};
  messageModule!: MessageModule;
  channelModule!: ChannelModule;

  public start(): Promise<void> {
    this.dispatcher = BdApi.Webpack.getModule(BdApi.Webpack.Filters.byKeys('dispatch', 'subscribe')) as Dispatcher;

    this.commandsModule.module = BdApi.Webpack.getModule((exports) => {
      if (!Utils.isObject(exports)) return false;
      if (exports.Z !== undefined) return false;

      return Object.entries(exports).some(([key, value]) => {
        if (!(typeof value === 'function')) return false;
        const valueString = value.toString();

        const match = valueString.includes('BUILT_IN_INTEGRATION') && valueString.includes('BUILT_IN_TEXT');
        if (match) this.commandsModule.key = key;

        return match;
      });
    }) as CommandsModule;

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
