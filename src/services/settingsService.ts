import { Utils } from '../utils/utils'
import Settings, { Setting } from '../interfaces/settings'
import { DEFAULT_SETTINGS, SETTINGS_KEY } from '../pluginConstants'
import { BaseService } from './baseService'
import { BdApiExtended } from '../interfaces/bdapi'

export class SettingsService extends BaseService {
  private static readonly TRASH_ICON =
    '<svg class="" fill="#FFFFFF" viewBox="0 0 24 24" ' +
    'style="width: 20px; height: 20px;"><path fill="none" d="M0 0h24v24H0V0z"></path>' +
    '<path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zm2.46-7.12l1.41-1.41L12 12.59l2.12-2.' +
    '12 1.41 1.41L13.41 14l2.12 2.12-1.41 1.41L12 15.41l-2.12 2.12-1.41-1.41L10.59 14l-2.13-2.1' +
    '2zM15.5 4l-1-1h-5l-1 1H5v2h14V4z"></path><path fill="none" d="M0 0h24v24H0z"></path></svg>'

  settings: Settings = DEFAULT_SETTINGS

  public start(): Promise<void> {
    const savedSettings = BdApi.Data.load(this.plugin.meta.name, SETTINGS_KEY) as Settings
    this.settings = Object.assign({}, DEFAULT_SETTINGS, savedSettings)

    return Promise.resolve()
  }

  public getSettingsElement() {
    const settings: Setting[] = []

    Object.entries(this.settings.games)
      .reverse()
      .forEach(([id, game]) => {
        const elementId = `GTT-Game-${id}`
        let seconds = game.playtimeSeconds

        const hours = Math.floor(seconds / 3600)
        seconds -= hours * 3600

        const minutes = Math.floor(seconds / 60)
        seconds -= minutes * 60

        const deleteButton = BdApi.React.createElement('button', {
          id: elementId,
          className: 'bd-button bd-button-filled bd-button-color-red',
          dangerouslySetInnerHTML: { __html: SettingsService.TRASH_ICON },
          onClick: () => {
            delete this.settings.games[id]
            BdApi.Data.save(this.plugin.meta.name, SETTINGS_KEY, this.settings)

            const element = document.getElementById(elementId)
            if (!element) return

            const gameContainer = element.closest('.bd-setting-item')
            gameContainer?.remove()
          },
        })

        const settingItem = Utils.SettingItem({
          id: elementId,
          name: game.name,
          note: `${hours}h ${minutes}m ${seconds}s`,
          children: [deleteButton],
        })

        settings.push(settingItem)
      })

    if (settings.length <= 0) {
      const setting = Utils.SettingItem({
        id: 'noGames',
        name: 'No games found',
        note: 'Go play some!',
        children: [],
      })

      settings.push(setting)
    }

    return (BdApi as BdApiExtended).UI.buildSettingsPanel({
      settings,
      onChange: () => {
        BdApi.Data.save(this.plugin.meta.name, SETTINGS_KEY, this.settings)
      },
    })
  }

  public stop(): void {
    // Do nothing
  }
}
