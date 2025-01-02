import { Plugin } from 'betterdiscord';
import { CURRENT_VERSION_INFO_KEY, PLUGIN_CHANGELOG } from './pluginConstants';
import { SettingsService } from './services/settingsService';
import { ModulesService } from './services/modulesService';
import { CurrentVersionInfo } from './interfaces/currentVersionInfo';
import { ExtendedMeta } from './interfaces/extendedMeta';
import { GameService } from './services/gameService';
import { BoundBdApiExtended } from 'interfaces/bdapi';
import { PatchesService } from './services/patchesService';

export default class GameTimeTrackerPlugin implements Plugin {
  settingsService?: SettingsService;
  modulesService?: ModulesService;
  patchesService?: PatchesService;
  gameService?: GameService;

  public meta: ExtendedMeta;
  public bdApi: BoundBdApiExtended;
  public logger: BoundBdApiExtended['Logger'];

  constructor(meta: ExtendedMeta) {
    this.meta = meta;
    this.bdApi = new BdApi(this.meta.name) as BoundBdApiExtended;
    this.logger = this.bdApi.Logger;
  }

  start(): void {
    this.doStart().catch((error) => {
      this.logger.error(error);
    });
  }

  private async doStart(): Promise<void> {
    this.showChangelogIfNeeded();
    await this.startServicesAndPatches();
  }

  private showChangelogIfNeeded(): void {
    const currentVersionInfo = (this.bdApi.Data.load(CURRENT_VERSION_INFO_KEY) as CurrentVersionInfo) ?? {};
    const UI = this.bdApi.UI;

    if (currentVersionInfo.hasShownChangelog !== true || currentVersionInfo.version !== this.meta.version) {
      UI.showChangelogModal({
        title: `${this.meta.name} Changelog`,
        changes: PLUGIN_CHANGELOG,
      });

      const newVersionInfo: CurrentVersionInfo = {
        version: this.meta.version,
        hasShownChangelog: true,
      };

      this.bdApi.Data.save(CURRENT_VERSION_INFO_KEY, newVersionInfo);
    }
  }

  private async startServicesAndPatches(): Promise<void> {
    this.settingsService = new SettingsService(this);
    await this.settingsService.start();

    this.modulesService = new ModulesService(this);
    await this.modulesService.start();

    this.patchesService = new PatchesService(this);
    await this.patchesService.start(this.modulesService, this.settingsService);

    this.gameService = new GameService(this);
    await this.gameService.start(this.modulesService, this.settingsService);
  }

  getSettingsPanel() {
    return this.settingsService?.getSettingsElement() ?? BdApi.React.createElement('div');
  }

  stop(): void {
    this.gameService?.stop();
    this.gameService = undefined;

    this.patchesService?.stop();
    this.patchesService = undefined;

    this.modulesService?.stop();
    this.modulesService = undefined;

    this.settingsService?.stop();
    this.settingsService = undefined;
  }
}
