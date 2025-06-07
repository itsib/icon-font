import { EventEmitter } from 'node:events';
import { watch } from 'node:fs';
import { Logger } from '../utils/logger.js';

export class Watcher extends EventEmitter {
  private _timer: ReturnType<typeof setTimeout> | null = null;

  constructor(filePath: string) {
    super();
    watch(filePath, { persistent: true, recursive: false, encoding: 'utf8' }, this.change.bind(this));
  }

  private change(_: any, file: any) {
    if (this._timer !== null) {
      return;
    }

    this._timer = setTimeout(() => {
      Logger.changes(file);
      this.emit('change');
      this._timer = null;
    }, 100);
  }
}