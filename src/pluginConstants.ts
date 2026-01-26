import { ChangelogChanges } from './interfaces/bdapi';

export const PLUGIN_CHANGELOG: ChangelogChanges[] = [
  {
    title: '1.2.2',
    type: 'fixed',
    items: ['Fix plugin after Discord update'],
  },
];

export const SETTINGS_KEY = 'settings';
export const CURRENT_VERSION_INFO_KEY = 'currentVersionInfo';
export const DEFAULT_SETTINGS = {
  games: {},
};
