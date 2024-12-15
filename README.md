<picture>
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/itsib/icon-font/refs/heads/master/assets/brand-black.svg">
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/itsib/icon-font/refs/heads/master/assets/brand.svg">
  <img alt="IconFont logo" height="60" style="margin-top: 20px;" src="https://raw.githubusercontent.com/itsib/icon-font/refs/heads/master/assets/brand.svg" />
</picture>

Simple utilities for icon-font generation, automation and presentation. Includes preview web server.

![Version](https://img.shields.io/badge/version-0.2.7-blue.svg?cacheSeconds=2592000&label=Version)
[![Release](https://github.com/itsib/icon-font/actions/workflows/main.yaml/badge.svg)](https://github.com/itsib/icon-font/actions/workflows/main.yaml)

---

## Features

- Formatting of svg icons. The contour will be adjusted to the size of 512px and placed in the center.
- Optimization. Extra points that do not affect the contour curves will be removed.
- Configuration support as in package.json, and in a separate file. It can also be transmitted via the command line interface.
- The input file format is svg.
- The output file format is `TTF`, `EOT`, `SVG`, `WOFF`, `WOFF2`
- A web server to demonstrate the result. The server will watch the changes in the input files and instantly display the result.

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

You need to create an `.icon-fontrc` file with json format in the root of your project. 

```json
{
  "input": "svg-icons",
  "output": "dist/fonts",
  "name": "IconFont",
  "prefix": "icon",
  "types": [ "woff2", "woff", "ttf", "eot"],
  "port": 9000,
  "fontUrl": "./"
}
```

### Options description

|  Option  |   Type   | Required | Description                                                                                       |
|:--------:|:--------:|:--------:|---------------------------------------------------------------------------------------------------|
| `input`  | `string` |    ✔     | The directory containing the SVG icon files that will be included in the font being created       |
| `output` | `string` |    ✔     | The directory where the generated files will be placed, if it does not exist, it will be created. |
|  `name`  | `string` |          | The name of the new font, by default `IconFont`                                                   |