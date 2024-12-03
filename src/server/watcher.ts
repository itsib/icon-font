import EventEmitter from 'node:events';
import { watch } from 'node:fs';
import { IconFontConfig } from '../types.js';
import { Logger } from '../utils/logger.js';

export class Watcher extends EventEmitter {
  private _timer: ReturnType<typeof setTimeout> | null = null;

  constructor(config: Required<IconFontConfig>) {
    super();
    watch(config.input, { persistent: true, recursive: false, encoding: 'utf8' }, this.change.bind(this));
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