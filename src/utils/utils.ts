import { Setting } from '../interfaces/settings'

export class Utils {
  public static SettingItem(
    options: Setting & {
      children: unknown[]
    }
  ) {
    return {
      ...options,
      type: 'custom',
    }
  }
}
