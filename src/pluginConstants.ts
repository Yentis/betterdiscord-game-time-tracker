import { ChangelogChanges } from './interfaces/bdapi';

export const PLUGIN_CHANGELOG: ChangelogChanges[] = [
  {
    title: '1.2.0',
    type: 'added',
    items: ['Added playtimesummary slash command'],
  },
  {
    title: '1.1.0',
    type: 'changed',
    items: ['Games are now sorted by when you last played them'],
  },
];

export const SETTINGS_KEY = 'settings';
export const CURRENT_VERSION_INFO_KEY = 'currentVersionInfo';
export const DEFAULT_SETTINGS = {
  games: {},
};
