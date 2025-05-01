import { ChangelogChanges } from './interfaces/bdapi';

export const PLUGIN_CHANGELOG: ChangelogChanges[] = [
  {
    title: '1.2.1',
    type: 'fixed',
    items: ['Prevent playtime becoming negative if game start time is invalid'],
  },
  {
    title: '1.2.0',
    type: 'added',
    items: ['Added playtimesummary slash command'],
  },
];

export const SETTINGS_KEY = 'settings';
export const CURRENT_VERSION_INFO_KEY = 'currentVersionInfo';
export const DEFAULT_SETTINGS = {
  games: {},
};
