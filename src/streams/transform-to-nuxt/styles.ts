export const STYLES = `
*,
*::before,
*::after {
  box-sizing: border-box;
}
html {
  --border-radius: 4px;
  --label-bg: 12 74 110;

  --color-accent: rgb(50, 150, 114);
  --bg-main: rgb(255 255 255);
  --bg-secondary: rgb(255 255 255);
  --bg-tooltip: rgb(245 245 245);
  --bg-button: transparent;
  --bg-code: rgb(255, 255, 255, 0.1);
  --bg-code-filter: brightness(0.6) contrast(2);
  --text-primary: rgb(11, 16, 21);
  --text-icons: rgb(70, 70, 70);
  --text-button: rgb(11, 16, 21);
  --scroll-bar: #80808080;
  --border: 1px solid rgba(136, 136, 136, 0.3);
  --border-button: 1px solid rgba(136, 136, 136, 0.3);

  color-scheme: dark light;
  color: var(--text-primary);
  background: var(--bg-main);
}
html.dark {
  --color-accent: rgb(50, 150, 114, 0.7);
  --bg-main: rgb(21, 21, 21);
  --bg-secondary: rgb(27, 27, 27);
  --bg-tooltip: rgb(24, 24, 24);
  --bg-button: rgb(255, 255, 255, 0.1);
  --bg-code: rgb(27, 27, 27);
  --bg-code-filter: none;
  --text-primary: rgb(255, 255, 255);
  --text-icons: rgb(170, 170, 170);
  --text-button: rgb(255, 255, 255);
  --scroll-bar: #80808080;
  --border: 1px solid rgba(136, 136, 136, 0.3);
  --border-button: 1px solid transparent;

}
body {
  height: 100vh;
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif, ui-sans-serif, 
                system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", 
                Roboto, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji", 
               "Segoe UI Symbol", "Noto Color Emoji";
  font-weight: 300;
  font-size: 16px;
  margin: 0;
  text-align: center;
  display: block;
}
* {
  -webkit-overflow-scrolling: touch;
  -ms-overflow-style: -ms-autohiding-scrollbar;
  scrollbar-width: 6px;
  scrollbar-color: transparent
}
::-webkit-scrollbar {
  height: 6px;
  width: 6px
}
::-webkit-scrollbar-track {
  background: transparent
}
::-webkit-scrollbar-thumb {
  background: var(--scroll-bar);
  border-radius: 3px
}
::-webkit-scrollbar-thumb:active {
  background: var(--scroll-bar);
  border-radius: 3px
}
.caption {
  margin: 0;
  height: 54px;
  padding: 1rem 1rem 0.75rem;
  display: flex;
  align-items: center;
  justify-content: start;
  gap: 16px;
  position: relative;
}
.caption svg {
  width: auto;
  height: 24px;
}
.buttons-container {
  width: auto;
  min-height: calc(100% - 54px);
  margin: 0;
  padding: 1.25rem 0;
  overflow-y: auto;
  background-color: var(--bg-secondary);
}
.buttons-container .scrollable {
  
  padding: 0 1.25rem;
  display: flex;
  text-align: center;
  justify-content: center;
  flex-wrap: wrap;
}
.preview {
  height: 2rem;
  width: 2rem;
  margin: 4px;
  display: inline-block;
  border: 1px solid transparent;
  background-color: transparent;
  color: var(--text-icons);
  outline: none;
  padding: 3px;
  border-radius: var(--border-radius);
  position: relative;
  box-sizing: content-box;
  transition: border-color 0.2s ease-in-out;
}
.preview:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}
.preview .inner {
  display: inline-block;
  width: 100%;
  text-align: center;
}
.preview .inner i {
  font-size: 1.5rem;
  line-height: 2rem;
  display: block;
}
[aria-label] {
  cursor: pointer;
  position: relative;
}
[aria-label]::after {
  width: fit-content;
  top: 100%;
  background-color: var(--bg-tooltip);
  border-radius: 4px;
  border: 1px solid rgba(136, 136, 136, 0.3);
  box-shadow: none;
  color: rgb(50, 150, 114);
  content: attr(aria-label);
  font-size: 13px;
  line-height: 1;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-style: normal;
  font-weight: 400;
  padding: 4px 8px 5px;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  position: absolute;
  transition: all .2s ease-in-out 0s;
  transition-delay: 0s;
  left: 50%;
  transform: translate(-50%, 8px);
  transform-origin: bottom;
  z-index: 50;
}
[aria-label]:hover::after {
  opacity: 1;
  transform: translate(-50%, 4px);
}

dialog {
  top: 0;
  width: 500px;
  margin-top: 100px;
  padding: 0;
  color: var(--text-primary);
  border: var(--border);
  background-color: var(--bg-main);
  box-shadow: 0 0 2px 1px rgb(0 0 0 / .1);
  border-radius: 6px;
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
  width: 140px;
  height: 140px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
dialog .content .cell-1 .icon {
  font-size: 4em;
}
dialog .content .cell-2 {
  width: calc(100% - 160px);
  position: relative;
}
dialog .content .cell-2 .example {
  min-height: 52px;
  margin-top: 10px;
  padding: 12px 16px;
  border-radius: 4px;
  border: var(--border);
  background: var(--bg-code);
  overflow-x: auto;
  box-sizing: border-box;
  filter: var(--bg-code-filter);
}
dialog .content .cell-2 code {
  font-size: 12px;
  white-space: nowrap;
   user-select: text;
  -moz-user-select: text;
  -webkit-user-select: text;
}
dialog .content .cell-2 .color-picker {
  margin-top: 16px;
  text-align: end;
}
dialog .content .cell-2 .color-picker input {
  margin-left: 10px;
  border: var(--border);
  border-radius: 6px;
  background: var(--bg-secondary);
}

dialog .content .cell-3 {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: start;
}
dialog .content .cell-3 .caption {
  height: unset;
  margin-bottom: 4px;
  padding: 5px;
  font-size: 14px;
  font-weight: 400;
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
  color: var(--text-button);
  background-color: var(--bg-button);
  border: var(--border-button);
  border-radius: 3px;
  display: inline-block;
  cursor: pointer;
}
dialog .content .cell-3 .buttons button.active {
  background-color: var(--color-accent);
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