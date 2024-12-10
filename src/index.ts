import { Plugin } from 'betterdiscord';
import { CURRENT_VERSION_INFO_KEY, PLUGIN_CHANGELOG } from './pluginConstants';
import { Logger } from './utils/logger';
import { SettingsService } from './services/settingsService';
import { ModulesService } from './services/modulesService';
import { CurrentVersionInfo } from './interfaces/currentVersionInfo';
import { ExtendedMeta } from './interfaces/extendedMeta';
import { GameService } from './services/gameService';
import { BdApiExtended } from 'interfaces/bdapi';

export default class GameTimeTrackerPlugin implements Plugin {
  settingsService?: SettingsService;
  modulesService?: ModulesService;
  gameService?: GameService;

  public meta: ExtendedMeta;

  constructor(meta: ExtendedMeta) {
    this.meta = meta;
    Logger.setLogger(meta.name);
  }

  start(): void {
    this.doStart().catch((error) => {
      Logger.error(error);
    });
  }

  private async doStart(): Promise<void> {
    this.showChangelogIfNeeded();
    await this.startServicesAndPatches();
  }

  private showChangelogIfNeeded(): void {
    const currentVersionInfo = (BdApi.Data.load(this.meta.name, CURRENT_VERSION_INFO_KEY) as CurrentVersionInfo) ?? {};
    const UI = (BdApi as BdApiExtended).UI;

    if (currentVersionInfo.hasShownChangelog !== true || currentVersionInfo.version !== this.meta.version) {
      UI.showChangelogModal({
        title: `${this.meta.name} Changelog`,
        changes: PLUGIN_CHANGELOG,
      });

      const newVersionInfo: CurrentVersionInfo = {
        version: this.meta.version,
        hasShownChangelog: true,
      };

      BdApi.Data.save(this.meta.name, CURRENT_VERSION_INFO_KEY, newVersionInfo);
    }
  }

  private async startServicesAndPatches(): Promise<void> {
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

  stop(): void {
    this.gameService?.stop();
    this.gameService = undefined;

    this.modulesService?.stop();
    this.modulesService = undefined;

    this.settingsService?.stop();
    this.settingsService = undefined;
  }
}
