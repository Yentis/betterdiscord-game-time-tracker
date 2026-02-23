import { ChangelogChanges } from './interfaces/bdapi';

export const PLUGIN_CHANGELOG: ChangelogChanges[] = [
  {
    title: '1.2.3',
    type: 'fixed',
    items: ['Fix playtimesummary command'],
  },
];

export const SETTINGS_KEY = 'settings';
export const CURRENT_VERSION_INFO_KEY = 'currentVersionInfo';
export const DEFAULT_SETTINGS = {
  games: {},
};
