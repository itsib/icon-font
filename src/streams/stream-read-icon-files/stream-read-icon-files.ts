// noinspection JSAnnotator

import { readdir } from 'node:fs/promises';
import { extname, join, basename } from 'node:path';
import { Readable } from 'node:stream';
import fs from 'node:fs';
import { FileMetadata } from '../../types';
import { populateMetadata } from '../../utils/populate-metadata.ts';
import { compareFiles } from '../../utils/compare-files.ts';

export class StreamReadIconFiles extends Readable {

  private readonly _basePath: string;

  private readonly _svgFiles?: string[];

  private _files?: Promise<FileMetadata[]>;

  private _fileIndex = 0;

  /**
   * Constructor
   * @param basePath path of directory or files list
   * @param svgFiles if undefined - all files in basePath
   */
  constructor(basePath: string, svgFiles?: string[]) {
    super({ objectMode: true });

    this._basePath = basePath;
    this._svgFiles = svgFiles;
  }

  async _readFiles(): Promise<string[]> {
    if (this._svgFiles) {
      return Promise.resolve([...this._svgFiles])
    } else {
      return readdir(this._basePath, { encoding: 'utf8' })
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
                name: basename(filename).replace(extname(filename), ''),
                index: index,
                file: join(this._basePath, filename)
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