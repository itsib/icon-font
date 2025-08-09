export const HEAD = `
<head>
  <meta charset="UTF-8">
  <title>{{caption}}</title>
  <link rel="shortcut icon" type="image/svg+xml" href="{{base}}/favicon.svg" />
  <style>
    {{styles}}
  </style>

  <link title="icons-style" rel="stylesheet" type="text/css" href="{{base}}/style.css"/>

  <script type="application/javascript">
    const fontName = '{{fontName}}';
    const fontFaceUrls = JSON.parse('{{fontFaceUrls}}');
    let activeAnimationButton; 
    let prefix;    
    function renderExample() {
      const code = document.getElementById('code-example');
      
      let html = '<span style="color: #D5B778">&#60;i </span>';
      html += '<span style="color: #BABABA">class=</span>';
      html += '<span style="color: #6AAB73">&#34;' + window.IconFont.className + '&#34;</span>';
      html += '<span style="color: #D5B778">&#62;&#60;/i&#62;</span>';
      
      code.innerHTML = html;
    }
    function onChooseIcon(button) {
      const dialog = document.getElementById('icon-dialog');
      const header = document.getElementById('dialog-header');
      const iconDemo = document.getElementById('icon-demo');
      const inputCodepoint = document.getElementById('input-codepoint');
      const inputCodepointHex = document.getElementById('input-codepoint-hex');
      const className = button.dataset.prefix + ' ' + button.dataset.class
      
      window.IconFont = {
        name: button.dataset.name,
        prefix: button.dataset.prefix,
        className: className,
        html: '<i class="' + className + '"></i>',
        codepoint: parseInt(button.dataset.codepoint).toString(10),
        codepointHex: \`\\\\\${parseInt(button.dataset.codepoint).toString(16)}\`,
      }
      
      dialog.style.display = 'block';
      header.innerText = button.dataset.name;
      iconDemo.className = className + ' icon-5x';
      inputCodepoint.value = window.IconFont.codepoint;
      inputCodepointHex.value = window.IconFont.codepointHex;

      renderExample();
      
      setTimeout(() => dialog.showModal(), 10);
    }
    function onDialogClick(event, dialog) {
      if (event.target === dialog) {
        onClose();
      }
    }
    function onClose() {
      const iconDemo = document.getElementById('icon-demo');
      const dialog = document.getElementById('icon-dialog');
      const colorPicker = document.getElementById('color-picker');
      dialog.close();
      
      dialog.addEventListener('transitionend', () => {  
        dialog.style.display = 'none';
        window.IconFont = null
     
        setTimeout(() => {
          if (activeAnimationButton) {
            activeAnimationButton.classList.remove('active');
            activeAnimationButton = undefined;
          }
          iconDemo.style.color = '#ffffff';
          colorPicker.value = '#ffffff';
        }, 5);
      }, { once: true });
    }
    function onAnimationClick(button) {
      const iconDemo = document.getElementById('icon-demo');
      
      const toDisable = button.classList.contains('active');
      
      if (activeAnimationButton) {
        activeAnimationButton.classList.remove('active');
        iconDemo.classList.remove(window.IconFont.prefix + '-' + activeAnimationButton.dataset.animation);
        activeAnimationButton = undefined;
      }
      
      if (toDisable) {
        renderExample();
        return;
      }
      
      button.classList.add('active')
      iconDemo.classList.add(window.IconFont.prefix + '-' + button.dataset.animation);
      activeAnimationButton = button;
      
      renderExample();
    }
    function onCopy(button, text) {      
      navigator.clipboard.writeText(text).then(() => {
        const label = button.getAttribute('aria-label');
        button.setAttribute('aria-label', 'Copied ✔');

        let timeout;
        const back = () => {
          clearTimeout(timeout);
          button.removeEventListener('mouseout', back);
          setTimeout(() => button.setAttribute('aria-label', label), 200);
        };

        timeout = setTimeout(() => button.setAttribute('aria-label', label), 5000);
        button.addEventListener('mouseout', back);
      });
    }
    function onColorChange(event) {
      document.getElementById('icon-demo').style.color = event.target.value;
    }
    async function onFontSelect(select) {
      const errorBlock = document.getElementById('select-error');
      errorBlock.innerText = '';
      try {
        const style = Array.from(document.styleSheets).find(style => style.title === 'icons-style');
        const cssRule = Array.from(style.cssRules).find(rule => rule instanceof CSSStyleRule && rule.cssText.startsWith('.icon { font-family'));
       
        if (select.value === 'disabled') {
          cssRule.styleMap.set('font-family', fontName);
        } else if (select.value in fontFaceUrls) {
          const customFontName = fontName + select.value.toUpperCase();
          
          if (!Array.from(document.fonts).some(font => font.family === customFontName)) {
            const url = decodeURIComponent(fontFaceUrls[select.value]);
            const font = new FontFace(fontName + select.value.toUpperCase(), url);
            const loaded = await font.load()
            document.fonts.add(loaded);
          }
          cssRule.styleMap.set('font-family', customFontName);
        }
      } catch (error) {
        errorBlock.innerText = error.message;
      }
    }
    async function healthStatus() {
      document.baseURI
      try {
        const res = await fetch('{{base}}/healthcheck', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (!res.ok) {
          return 'failed';
        }

        const data = await res.json();
        if (data.status === 'reload') {
          return 'reload';
        } else if (data.status === 'ok') {
          return 'healthy';
        }
      } catch {}
      
      return 'failed';
    }
    
    (async () => {
      let health = await healthStatus();
      
      setInterval(async () => {
        const status = await healthStatus();
        if (status === 'reload' || (health === 'failed' && status === 'healthy')) {
          return window.location.reload();
        }
        health = status;        
      }, 1000);
      
    })();
  </script>
</head>
`;