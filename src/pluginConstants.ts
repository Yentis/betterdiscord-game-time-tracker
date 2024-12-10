import { ChangelogChanges } from './interfaces/bdapi'

export const PLUGIN_CHANGELOG: ChangelogChanges[] = [
  {
    title: '1.0.0',
    type: 'added',
    items: ['Initial release'],
  },
]

export const SETTINGS_KEY = 'settings'
export const CURRENT_VERSION_INFO_KEY = 'currentVersionInfo'
export const DEFAULT_SETTINGS = {
  games: {},
}
