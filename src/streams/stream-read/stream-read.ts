import { readdir } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { FileMetadata } from '../../types/types.ts';
import { Readable } from 'node:stream';
import fs from 'node:fs';
import { populateMetadata } from '../../utils/populate-metadata.ts';
import { compareFiles } from '../../utils/compare-files.ts';

export class StreamRead extends Readable {

  private readonly _input: string;

  private _files?: Promise<FileMetadata[]>;

  private _fileIndex = 0;

  constructor(input: string) {
    super({ objectMode: true });
    this._input = input;
  }

  async _getIcons(): Promise<FileMetadata[]> {
    if (!this._files) {
      this._files = readdir(this._input, { encoding: 'utf8' })
        .then(files => files.sort(compareFiles))
        .then(files => {
          let index = 0;
          return files.reduce<FileMetadata[]>((acc, filename) => {
            if (filename.endsWith(`.svg`)) {
              acc.push({
                name: filename.replace(extname(filename), ''),
                index: index,
                file: join(this._input, filename),
              });
              index++;
            }

            return acc;
          }, []);
        });
    }
    return this._files;
  }

  async _read() {
    const files = await this._getIcons();
    const file = files[this._fileIndex];
    if (!file) {
      return this.push(null);
    }

    fs.readFile(file.file, (error, buffer: Buffer) => {
      if (error) {
        return this.destroy(error);
      }

      this.push(populateMetadata(buffer, file));
      this._fileIndex++;
    });
  }
}