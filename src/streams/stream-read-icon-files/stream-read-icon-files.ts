// noinspection JSAnnotator

import { readdir } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { Readable } from 'node:stream';
import fs from 'node:fs';
import { FileMetadata } from '../../types';
import { populateMetadata } from '../../utils/populate-metadata.ts';
import { compareFiles } from '../../utils/compare-files.ts';

export class StreamReadIconFiles extends Readable {

  private readonly _directory: string | null;

  private readonly _svgFiles: string[] | null;

  private _files?: Promise<FileMetadata[]>;

  private _fileIndex = 0;

  /**
   * Constructor
   * @param input path of directory or files list
   */
  constructor(input: string | string[]) {
    super({ objectMode: true });

    if (typeof input === 'string') {
      this._directory = input;
      this._svgFiles = null;
    } else {
      this._directory = null;
      this._svgFiles = input;
    }
  }

  async _readFiles(): Promise<string[]> {
    if (this._directory) {
      return readdir(this._directory, { encoding: 'utf8' })
    } else if (this._svgFiles) {
      return Promise.resolve([...this._svgFiles])
    } else {
      return Promise.reject(new Error('NO_ICONS'))
    }
  }

  async _getIcons(): Promise<FileMetadata[]> {
    if (!this._files) {
      this._files = this._readFiles()
        .then(files => files.sort(compareFiles))
        .then(files => {
          let index = 0;
          return files.reduce<FileMetadata[]>((acc, filename) => {
            if (filename.endsWith(`.svg`)) {
              acc.push({
                name: filename.replace(extname(filename), ''),
                index: index,
                file: join(this._directory!, filename)
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