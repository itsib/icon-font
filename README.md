<a href="https://github.com/itsib/icon-font">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/itsib/icon-font/refs/heads/master/assets/brand.svg">
      <img alt="IconFont logo" height="60" style="margin: 20px 0;" src="https://raw.githubusercontent.com/itsib/icon-font/refs/heads/master/assets/brand-black.svg" />
    </picture>
</a>

Simple utilities for icon-font generation, automation and presentation. Includes preview web server.

[![Version](https://img.shields.io/badge/version-0.3.1-blue.svg?cacheSeconds=2592000&label=Version)](https://www.npmjs.com/package/@itsib/icon-font)
[![Release](https://github.com/itsib/icon-font/actions/workflows/main.yaml/badge.svg)](https://github.com/itsib/icon-font/actions/workflows/main.yaml)

---

## Features

- Formatting of svg icons. The contour will be adjusted to the size of 512px and placed in the center.
- Optimization. Extra points that do not affect the contour curves will be removed.
- Configuration support as in package.json, and in a separate file. It can also be transmitted via the command line interface.
- The input file format is svg.
- The output file format is `TTF`, `EOT`, `SVG`, `WOFF`, `WOFF2`
- A web server to demonstrate the result. The server will watch the changes in the input files and instantly display the result.

![Demo Interface](https://raw.githubusercontent.com/itsib/icon-font/refs/heads/master/assets/demo.gif)


---

## Usage

Install:

```shell
npm install --save-dev @itsib/icon-font
```

Or global installation:

```shell
npm install -g @itsib/icon-font
```

Show help:

```shell
icon-font --help
```

Run demo server:

```shell
icon-font demo --input icons/dir
```

Generate fonts files:

```shell
icon-font generate --input icons/dir --output fonts/dir
```

## Configuration

You need to create an `icon-font.json` file with json format in the root of your project. Or add field `icon-font` in package.json file.

```json
{
  "input": "svg-icons",
  "output": "dist/fonts",
  "name": "IconFont",
  "prefix": "icon",
  "types": [ "woff2", "woff", "ttf", "eot"],
  "port": 9000,
  "fontUrl": "./",
  "fontUrlHash": false
}
```

### Options description

> Configuration parameters passed through the CLI have a higher priority than the configuration file.

| Option        |               Type               | Required | Description                                                                                                                                                         |
|:--------------|:--------------------------------:|:--------:|---------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `input`       |             `string`             |    ✔     | The directory containing the SVG icon files that will be included in the font being created                                                                         |
| `output`      |             `string`             |    ✔     | The directory where the generated files will be placed, if it does not exist, it will be created.                                                                   |
| `name`        |             `string`             |          | The name of the new font, by default `IconFont`                                                                                                                     |
| `prefix`      |             `string`             |          | Class name prefix. Default `icon`                                                                                                                                   |
| `types`       |            `string[]`            |          | Output font types, to be generated. Default: `[ "woff2", "woff", "ttf", "eot"]`                                                                                     |
| `port`        |             `number`             |          | Demo server port. Default `9000` (http://localhost:9000).                                                                                                           |
| `fontUrl`     |             `string`             |          | The URL where the font files will be available. Used in the css file @font-fase. Default `/`                                                                        |
| `fontUrlHash` | `string` \|  false \| `"random"` |          | Adds the GET parameter 'hash=${HASH}' at the end of the URL to reset the browser cache. Set to 'random' for random number. Or use yur own value. False is disabled. | 

## References

- [ots-sanitize](https://manpages.ubuntu.com/manpages/jammy/man1/ots-sanitize.1.html) - is  a  program  which  validates and/or transcodes a font file using the OTS library.. Installation:
  ```shell  
  sudo apt install opentype-sanitizer
  ```
  Usage:
  ```shell
  ots-sanitize dist/fonts/icon-font.ttf
  ```
 
- [ttfdump](https://manpages.ubuntu.com/manpages/focal/en/man1/ttfdump.1.html) - dumps the contents of a TrueType font file in ASCII form.  A TrueType font file is consist of various tables. Installation:
  ```shell
  sudo apt install texlive-binaries
  ```
  Usage
  ```shell
  ttfdump -t head dist/fonts/icon-font.ttf
  ttfdump -t OS/2 dist/fonts/icon-font.ttf
  ```