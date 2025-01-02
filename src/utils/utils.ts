import { Setting } from '../interfaces/settings';

export class Utils {
  public static SettingItem(
    options: Setting & {
      children: unknown[];
    }
  ) {
    return {
      ...options,
      type: 'custom',
    };
  }

  public static isObject(object: unknown): object is Record<string, unknown> {
    return typeof object === 'object' && !!object && !Array.isArray(object);
  }

  public static humanReadablePlaytime(playtimeSeconds: number): string {
    let seconds = playtimeSeconds;

    const hours = Math.floor(seconds / 3600);
    seconds -= hours * 3600;

    const minutes = Math.floor(seconds / 60);
    seconds -= minutes * 60;

    return `${hours}h ${minutes}m ${seconds}s`;
  }
}
