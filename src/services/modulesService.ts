import { BaseService } from './baseService';
import Dispatcher from 'interfaces/modules/dispatcher';

export class ModulesService extends BaseService {
  dispatcher!: Dispatcher;

  public start(): Promise<void> {
    this.dispatcher = BdApi.Webpack.getModule(BdApi.Webpack.Filters.byKeys('dispatch', 'subscribe')) as Dispatcher;

    Object.entries(this).forEach(([key, value]) => {
      if (value !== undefined) return;
      this.logger.error(`${key} not found!`);
    });

    return Promise.resolve();
  }

  public stop(): void {
    // Do nothing
  }
}
