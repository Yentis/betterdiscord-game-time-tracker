import { BaseService } from './baseService';
import { ModulesService } from './modulesService';
import { SettingsService } from './settingsService';
import { Utils } from '../utils/utils';
import { Command } from '../interfaces/bdapi';

declare const DiscordNative: {
  clipboard: {
    copy: (text: string) => void;
  };
};

export class CommandsService extends BaseService {
  public start(modulesService: ModulesService, settingsService: SettingsService): Promise<void> {
    const command: Command = {
      id: 'PlayTimeSummary',
      name: 'playtimesummary',
      description: 'Send GameTimeTracker playtime summary',
      options: [
        {
          name: 'type',
          description: 'How the summary should be sent',
          required: true,
          type: this.bdApi.Commands.Types.OptionTypes.STRING,
          choices: [
            {
              name: 'clipboard',
              value: 'clipboard',
            },
            {
              name: 'message',
              value: 'message',
            },
            {
              name: 'clyde',
              value: 'clyde',
            },
          ],
        },
      ],
      execute: (event) => {
        try {
          const channelId = modulesService.channelModule.getCurrentlySelectedChannelId() ?? '';
          if (!channelId) return;

          const games = Object.values(settingsService.settings.games).sort(
            (a, b) => b.playtimeSeconds - a.playtimeSeconds
          );

          games.push({
            name: '---------\nTotal',
            playtimeSeconds: games.reduce((partialSum, game) => partialSum + game.playtimeSeconds, 0),
          });

          const content = games
            .map((game) => `${game.name} - ${Utils.humanReadablePlaytime(game.playtimeSeconds)}`)
            .join('\n');

          const type = event[0]?.value ?? 'message';

          if (type === 'message') {
            modulesService.messageModule.sendMessage(channelId, {
              content,
              invalidEmojis: [],
              tts: false,
              validNonShortcutEmojis: [],
            });
          } else if (type === 'clipboard') {
            DiscordNative.clipboard.copy(content);
          } else if (type === 'clyde') {
            modulesService.messageModule.sendBotMessage(channelId, content);
          }
        } catch (error) {
          this.logger.error(error);
        }
      },
    };

    this.bdApi.Commands.register(command);

    return Promise.resolve();
  }

  public stop() {
    this.bdApi.Commands.unregisterAll();
  }
}
