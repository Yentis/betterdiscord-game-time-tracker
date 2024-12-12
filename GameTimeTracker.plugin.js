/**
 * @name GameTimeTracker
 * @version 1.0.0
 * @description Track time spent in games
 * @license MIT
 * @author Yentis
 * @authorId 68834122860077056
 * @website https://github.com/Yentis/betterdiscord-game-time-tracker
 * @source https://raw.githubusercontent.com/Yentis/betterdiscord-game-time-tracker/master/GameTimeTracker.plugin.js
 */
'use strict';

const PLUGIN_CHANGELOG = [
  {
    title: '1.0.0',
    type: 'added',
    items: ['Initial release'],
  },
];

const SETTINGS_KEY = 'settings';
const CURRENT_VERSION_INFO_KEY = 'currentVersionInfo';
const DEFAULT_SETTINGS = {
  games: {},
};

class Utils {
  static SettingItem(options) {
    return {
      ...options,
      type: 'custom',
    };
  }
}

class BaseService {
  plugin;
  bdApi;
  logger;

  constructor(plugin) {
    this.plugin = plugin;
    this.bdApi = this.plugin.bdApi;
    this.logger = this.bdApi.Logger;
  }
}

class SettingsService extends BaseService {
  static TRASH_ICON =
    '<svg class="" fill="#FFFFFF" viewBox="0 0 24 24" ' +
    'style="width: 20px; height: 20px;"><path fill="none" d="M0 0h24v24H0V0z"></path>' +
    '<path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zm2.46-7.12l1.41-1.41L12 12.59l2.12-2.' +
    '12 1.41 1.41L13.41 14l2.12 2.12-1.41 1.41L12 15.41l-2.12 2.12-1.41-1.41L10.59 14l-2.13-2.1' +
    '2zM15.5 4l-1-1h-5l-1 1H5v2h14V4z"></path><path fill="none" d="M0 0h24v24H0z"></path></svg>';

  settings = DEFAULT_SETTINGS;

  start() {
    const savedSettings = this.bdApi.Data.load(SETTINGS_KEY);
    this.settings = Object.assign({}, DEFAULT_SETTINGS, savedSettings);

    return Promise.resolve();
  }

  getSettingsElement() {
    const { React, UI } = this.bdApi;
    const settings = [];

    Object.entries(this.settings.games)
      .reverse()
      .forEach(([id, game]) => {
        const elementId = `GTT-Game-${id}`;
        let seconds = game.playtimeSeconds;

        const hours = Math.floor(seconds / 3600);
        seconds -= hours * 3600;

        const minutes = Math.floor(seconds / 60);
        seconds -= minutes * 60;

        const deleteButton = React.createElement('button', {
          id: elementId,
          className: 'bd-button bd-button-filled bd-button-color-red',
          dangerouslySetInnerHTML: { __html: SettingsService.TRASH_ICON },
          onClick: () => {
            delete this.settings.games[id];
            this.bdApi.Data.save(SETTINGS_KEY, this.settings);

            const element = document.getElementById(elementId);
            if (!element) return;

            const gameContainer = element.closest('.bd-setting-item');
            gameContainer?.remove();
          },
        });

        const settingItem = Utils.SettingItem({
          id: elementId,
          name: game.name,
          note: `${hours}h ${minutes}m ${seconds}s`,
          children: [deleteButton],
        });

        settings.push(settingItem);
      });

    if (settings.length <= 0) {
      const setting = Utils.SettingItem({
        id: 'noGames',
        name: 'No games found',
        note: 'Go play some!',
        children: [],
      });

      settings.push(setting);
    }

    return UI.buildSettingsPanel({
      settings,
      onChange: () => {
        this.bdApi.Data.save(SETTINGS_KEY, this.settings);
      },
    });
  }

  stop() {
    // Do nothing
  }
}

class ModulesService extends BaseService {
  dispatcher;

  start() {
    this.dispatcher = BdApi.Webpack.getModule(BdApi.Webpack.Filters.byKeys('dispatch', 'subscribe'));

    Object.entries(this).forEach(([key, value]) => {
      if (value !== undefined) return;
      this.logger.error(`${key} not found!`);
    });

    return Promise.resolve();
  }

  stop() {
    // Do nothing
  }
}

class GameService extends BaseService {
  modulesService;
  settingsService;

  gameStartTimes = {};

  onRunningGamesChange = (event) => {
    if (event === undefined) return;
    this.logger.debug('Games changed:', event);

    const data = event;

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
        this.logger.warn(`Game ${game.name} closed but start time is unknown`);
        return;
      }

      const id = game.exeName;
      const playtimeSeconds = (new Date().getTime() - startTime) / 1000;
      this.logger.info(`Played ${game.name} for ${playtimeSeconds} seconds`);

      const trackedGame = games[id] ?? { name: game.name, playtimeSeconds: 0 };
      trackedGame.name = game.name;
      trackedGame.playtimeSeconds += Math.round(playtimeSeconds);
      games[id] = trackedGame;
    });

    this.bdApi.Data.save(SETTINGS_KEY, this.settingsService.settings);
  };

  start(modulesService, settingsService) {
    this.modulesService = modulesService;
    this.settingsService = settingsService;

    modulesService.dispatcher.subscribe('RUNNING_GAMES_CHANGE', this.onRunningGamesChange);

    return Promise.resolve();
  }

  stop() {
    this.modulesService.dispatcher.unsubscribe('RUNNING_GAMES_CHANGE', this.onRunningGamesChange);
  }
}

class GameTimeTrackerPlugin {
  settingsService;
  modulesService;
  gameService;

  meta;
  bdApi;
  logger;

  constructor(meta) {
    this.meta = meta;
    this.bdApi = new BdApi(this.meta.name);
    this.logger = this.bdApi.Logger;
  }

  start() {
    this.doStart().catch((error) => {
      this.logger.error(error);
    });
  }

  async doStart() {
    this.showChangelogIfNeeded();
    await this.startServicesAndPatches();
  }

  showChangelogIfNeeded() {
    const currentVersionInfo = this.bdApi.Data.load(CURRENT_VERSION_INFO_KEY) ?? {};
    const UI = this.bdApi.UI;

    if (currentVersionInfo.hasShownChangelog !== true || currentVersionInfo.version !== this.meta.version) {
      UI.showChangelogModal({
        title: `${this.meta.name} Changelog`,
        changes: PLUGIN_CHANGELOG,
      });

      const newVersionInfo = {
        version: this.meta.version,
        hasShownChangelog: true,
      };

      this.bdApi.Data.save(CURRENT_VERSION_INFO_KEY, newVersionInfo);
    }
  }

  async startServicesAndPatches() {
    this.settingsService = new SettingsService(this);
    await this.settingsService.start();

    this.modulesService = new ModulesService(this);
    await this.modulesService.start();

    this.gameService = new GameService(this);
    await this.gameService.start(this.modulesService, this.settingsService);
  }

  getSettingsPanel() {
    return this.settingsService?.getSettingsElement() ?? BdApi.React.createElement('div');
  }

  stop() {
    this.gameService?.stop();
    this.gameService = undefined;

    this.modulesService?.stop();
    this.modulesService = undefined;

    this.settingsService?.stop();
    this.settingsService = undefined;
  }
}

module.exports = GameTimeTrackerPlugin;
