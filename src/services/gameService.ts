import { SETTINGS_KEY } from '../pluginConstants';
import { Logger } from '../utils/logger';
import { BaseService } from './baseService';
import { ModulesService } from './modulesService';
import { SettingsService } from './settingsService';

interface Game {
  name: string;
  start?: number;
  exeName: string;
}

export interface TrackedGame {
  name: string;
  playtimeSeconds: number;
}

export class GameService extends BaseService {
  private modulesService!: ModulesService;
  private settingsService!: SettingsService;

  private gameStartTimes: Record<string, number> = {};

  private onRunningGamesChange = (event: unknown) => {
    if (event === undefined) return;
    Logger.debug('Games changed:', event);

    const data = event as {
      added: Game[];
      removed: Game[];
    };

    if (data.added.length > 0) {
      data.added.forEach((game) => {
        this.gameStartTimes[game.exeName] = game.start ?? new Date().getTime();
      });
    }

    if (data.removed.length <= 0) {
      return;
    }

    const games = this.settingsService.settings.games;
    data.removed.forEach((game) => {
      const startTime = game.start ?? this.gameStartTimes[game.exeName];
      if (startTime === undefined) {
        Logger.warn(`Game ${game.name} closed but start time is unknown`);
        return;
      }

      const id = game.exeName;
      const playtimeSeconds = (new Date().getTime() - startTime) / 1000;
      Logger.info(`Played ${game.name} for ${playtimeSeconds} seconds`);

      const trackedGame = games[id] ?? { name: game.name, playtimeSeconds: 0 };
      trackedGame.name = game.name;
      trackedGame.playtimeSeconds += Math.round(playtimeSeconds);
      games[id] = trackedGame;
    });

    BdApi.Data.save(this.plugin.meta.name, SETTINGS_KEY, this.settingsService.settings);
  };

  public start(modulesService: ModulesService, settingsService: SettingsService): Promise<void> {
    this.modulesService = modulesService;
    this.settingsService = settingsService;

    modulesService.dispatcher.subscribe('RUNNING_GAMES_CHANGE', this.onRunningGamesChange);

    return Promise.resolve();
  }

  public stop() {
    this.modulesService.dispatcher.unsubscribe('RUNNING_GAMES_CHANGE', this.onRunningGamesChange);
  }
}
