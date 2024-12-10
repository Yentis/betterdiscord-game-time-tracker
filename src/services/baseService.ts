import GameTimeTrackerPlugin from '../index'

export abstract class BaseService {
  plugin: GameTimeTrackerPlugin

  constructor(plugin: GameTimeTrackerPlugin) {
    this.plugin = plugin
  }

  public abstract start(...args: unknown[]): Promise<void>

  public abstract stop(): void
}
