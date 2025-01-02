import { BaseService } from './baseService';
import { Command, ModulesService } from './modulesService';
import { SettingsService } from './settingsService';
import { Utils } from '../utils/utils';

declare const DiscordNative: {
  clipboard: {
    copy: (text: string) => void;
  };
};

export class PatchesService extends BaseService {
  private command?: Command;

  public start(modulesService: ModulesService, settingsService: SettingsService): Promise<void> {
    const name = 'playtimesummary';
    const description = 'Send GameTimeTracker playtime summary';

    const typeName = 'type';
    const typeDescription = 'How the summary should be sent';

    this.command = {
      id: 'GameTimeTracker-PlayTimeSummary',
      untranslatedName: name,
      displayName: name,
      type: 1, // CHAT
      inputType: 0, // BUILT_IN
      applicationId: '-1', // BUILT_IN
      untranslatedDescription: description,
      displayDescription: description,
      options: [
        {
          name: typeName,
          displayName: typeName,
          description: typeDescription,
          displayDescription: typeDescription,
          required: true,
          type: 3, // STRING
          choices: [
            {
              name: 'clipboard',
              displayName: 'clipboard',
              value: 'clipboard',
            },
            {
              name: 'message',
              displayName: 'message',
              value: 'message',
            },
            {
              name: 'clyde',
              displayName: 'clyde',
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

    this.bdApi.Patcher.after(
      modulesService.commandsModule.module,
      modulesService.commandsModule.key as never,
      (_, _2, result: Command[]) => {
        if (!this.command) return;
        result.push(this.command);
      }
    );

    return Promise.resolve();
  }

  public stop() {
    this.command = undefined;
    this.bdApi.Patcher.unpatchAll();
  }
}
