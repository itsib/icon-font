export const STYLES = `

*,
*::before,
*::after {
  box-sizing: border-box;
}
html {
  --border-radius: 8px;
  --preview-bg: 2 6 23;
  --label-bg: 12 74 110;

  color-scheme: dark;
  color: #e2e8f0;
  background: #0f172a;
}
body {
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif, ui-sans-serif, 
                system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", 
                Roboto, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji", 
               "Segoe UI Symbol", "Noto Color Emoji";
  font-weight: 300;
  font-size: 16px;
  margin: 0;
  text-align: center;
}
.caption {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  position: relative;
}
.caption svg {
  width: auto;
  height: 56px;
}
.caption svg .text-paths {
  color: white !important;
}
.buttons-container {
  width: auto;
  max-width: 1280px;
  margin: 0 auto;
  padding: 10px 20px;
}
.preview {
  width: 110px;
  height: 130px;
  margin: 10px;
  display: inline-block;
  border: none;
  background-color: transparent;
  color: inherit;
  outline: none;
  padding: 0;
  border-radius: var(--border-radius);
  position: relative;
}
.preview .inner {
  display: inline-block;
  width: 100%;
  text-align: center;
  background: rgb(var(--preview-bg) / 0.7);
  border-radius: var(--border-radius) var(--border-radius) 0 0;
}
.preview .inner i {
  line-height: 100px;
  font-size: 36px;
}
.label {
  display: inline-block;
  width: 100%;
  box-sizing: border-box;
  padding: 5px;
  font-size: 12px;
  font-weight: 500;
  font-family: Monaco, monospace;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  background: rgb(var(--label-bg));
  border-radius: 0 0 var(--border-radius) var(--border-radius);
}
[aria-label] {
  cursor: pointer;
  position: relative;
}
[aria-label]::after {
  width: 120px;
  background-color: rgba(28, 28, 30, 0.9);
  border-radius: 5px;
  border: .5px solid rgba(28, 28, 30, 1);
  margin-bottom: 16px;
  box-shadow: 0 0 .1875rem rgba(0, 0, 0, .3);
  color: #f0f0f0;
  content: attr(aria-label);
  font-size: 12px;
  line-height: 1;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-style: normal;
  font-weight: 500;
  padding: 10px;
  text-indent: 0;
  text-shadow: none;
  white-space: nowrap;
  z-index: 50;
}
[aria-label]::before {
  content: "";
  z-index: 49;
  border: 8px solid transparent;
  border-top-color: rgba(28, 28, 30, 1);
  height: 0;
  width: 0;
  display: block;
}
[aria-label]::after,
[aria-label]::before {
  bottom: 100%;
  box-sizing: border-box;
  opacity: 0;
  pointer-events: none;
  position: absolute;
  transition: all .2s ease-in-out 0s;
  transition-delay: 0s;
  left: 50%;
  transform: translate(-50%, 10px);
  transform-origin: top;
}
[aria-label]:hover::after,
[aria-label]:hover::before {
  opacity: 1;
  transform: translate(-50%, 4px);
}

.font-selector {
  left: 10px;
  top: 20px;
  width: 240px;
  position: absolute;
  z-index: 100;
}
.font-selector label {
  padding-left: 6px;
  margin-bottom: 4px;
  font-weight: 500;
  font-size: 13px;
  color: #bcbcbc;
  text-align: start;
  display: block;
}
.font-selector .select-wrap {
  width: 100%;
  min-width: 15ch;
  max-width: 30ch;
  border: 1px solid rgb(255 255 255 / 0.1);
  border-radius: 6px;
  padding: 0 10px;
  font-size: 14px;
  cursor: pointer;
  color: white;
  line-height: 1.1;
  background-color: rgb(var(--preview-bg));
  background-image: linear-gradient(to top, rgb(var(--preview-bg) / 0.9), rgb(var(--preview-bg)) 33%);
  display: grid;
  grid-template-areas: "select";
  align-items: center;
  position: relative;
}
.font-selector .select-wrap::after {
  content: "";
  width: 10px;
  height: 6px;
  background-color: rgb(255 255 255 / 0.8);
  clip-path: polygon(100% 0%, 0 0%, 50% 100%);
  grid-area: select;
  justify-self: end;
}
.font-selector .select-wrap select {
  height: 32px;
  appearance: none;
  border: none;
  padding: 0 1em 0 0;
  margin: 0;
  color: white;
  width: 100%;
  background-color: rgb(var(--preview-bg));
  background-image: linear-gradient(to top, rgb(var(--preview-bg) / 0.9), rgb(var(--preview-bg)) 33%);
  font-family: inherit;
  font-size: inherit;
  cursor: inherit;
  line-height: inherit;
  outline: none;
  grid-area: select;
}
.font-selector .select-wrap select::-ms-expand {
  display: none;
}
.font-selector .error {
  margin-top: 4px;
  color: #da4040;
  font-size: 12px;
  line-height: 1.3;
  text-align: start;
}

dialog {
  top: 0;
  width: 600px;
  margin-top: 250px;
  padding: 0;
  color: white;
  border: 1px solid rgba(255 255 255 / 0.1);
  background-color: rgb(var(--preview-bg) / 0.95);
  box-shadow: 0 0 2px 1px rgb(0 0 0 / .1);
  border-radius: var(--border-radius);
  overflow: visible;
  user-select: none;
  -moz-user-select: none;
  -webkit-user-select: none;
  transition: all 0.2s ease-out;
  z-index: 5000;
  transform: translateY(-20px);
  opacity: 0;
  display: none;
}
dialog::backdrop {
  background-color: rgb(0 0 0 / 0.4) !important;
  transition: all 0.2s ease-in;
  opacity: 0;
}
dialog[open] {
  opacity: 1;
  transform: translateY(0);
}
dialog[open]::backdrop {
 -webkit-backdrop-filter: saturate(120%) blur(5px);
  backdrop-filter: saturate(120%) blur(5px);
  opacity: 1;
}
dialog .header {
  margin: 0;
  padding: 10px 15px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
dialog .header .close {
  left: 10px;
  top: -3px;
  width: 30px;
  height: 30px;
  font-size: 20px;
  color: white;
  background: transparent;
  border: none;
  border-radius: 50%;
  position: relative;
  cursor: pointer;
}
dialog .content {
  padding: 0 15px 10px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}
dialog .content .cell-1 {
  width: 180px;
  height: 180px;
  padding: 50px 0;
}
dialog .content .cell-1 .icon {
  display: block;
}
dialog .content .cell-2 {
  width: calc(100% - 200px);
  position: relative;
}
dialog .content .cell-2 .example {
  min-height: 60px;
  margin-top: 10px;
  padding: 18px 20px;
  border-radius: 6px;
  border: 1px solid rgb(255 255 255 / 0.2);
  background: rgb(10 10 10);
  overflow-x: auto;
  box-sizing: border-box;
}
dialog .content .cell-2 code {
  font-size: 13px;
  white-space: nowrap;
   user-select: text;
  -moz-user-select: text;
  -webkit-user-select: text;
  cursor: copy;
}
dialog .content .cell-2 .color-picker {
  margin-top: 16px;
  text-align: end;
  display: flex;
  align-items: center;
  justify-content: end;
}
dialog .content .cell-2 .color-picker label {
  font-size: 14px;  
}
dialog .content .cell-2 .color-picker input {
  margin-left: 10px;
  border: 1px solid rgb(255 255 255 / 0.2);
  border-radius: 6px;
  background: rgb(10 10 10);
}
dialog .content .cell-2 .codepoint {
  margin-top: 10px;
  text-align: end;
  display: flex;
  align-items: center;
  justify-content: end;
}
dialog .content .cell-2 .codepoint label {
  font-size: 14px;
}
dialog .content .cell-2 .codepoint > div {
   margin-left: 10px;
   
}
dialog .content .cell-2 .codepoint input {
  width: 80px;
  height: 27px;
  padding: 0 8px;
  text-align: center;
  border: 1px solid rgb(255 255 255 / 0.2);
  border-radius: 6px;
  background: rgb(10 10 10);
  user-select: text;
  -moz-user-select: text;
  -webkit-user-select: text;
  cursor: copy;
}

dialog .content .cell-3 {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: start;
}
dialog .content .cell-3 .caption {
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  text-align: start;
}
dialog .content .cell-3 .buttons {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  column-gap: 4px;
}
dialog .content .cell-3 .buttons button {
  height: 24px;
  margin-bottom: 4px;
  padding: 2px 6px;
  font-size: 12px;
  line-height: 1;
  color: white;
  background-color: rgba(255 255 255 / 0.1);
  border: none;
  border-radius: 3px;
  display: inline-block;
  cursor: pointer;
}
dialog .content .cell-3 .buttons button.active {
  background-color: rgb(var(--label-bg));
}

dialog ::-webkit-scrollbar {
  width: 4px;
  height: 4px;
  transition: all .15s ease-in-out;
}
dialog ::-webkit-scrollbar-track {
  padding: 4px 0;
  position: relative;
  background-color: transparent;
}
dialog ::-webkit-scrollbar-button {
  height: 8px;
  background-color: transparent;
}
dialog ::-webkit-scrollbar-thumb {
  border-radius: 4px;
  background-color: rgb(255 255 255 / 0.5);
}
dialog ::-webkit-scrollbar-corner {
  display: none;
}
`;