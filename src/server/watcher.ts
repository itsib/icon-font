import EventEmitter from 'node:events';
import { watch } from 'node:fs';
import { IconFontConfig } from '../types.js';

export class Watcher extends EventEmitter {
  private _timer: ReturnType<typeof setTimeout> | null = null;

  constructor(config: Required<IconFontConfig>) {
    super();
    watch(config.input, { persistent: true, recursive: false, encoding: 'utf8' }, this.change.bind(this));
  }

  private change() {
    if (this._timer !== null) {
      return;
    }

    this._timer = setTimeout(() => {
      this.emit('change', {});
      this._timer = null;
    }, 100);
  }
}