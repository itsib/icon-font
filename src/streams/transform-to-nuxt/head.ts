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
    const fontSizes = [16, 18, 20, 22, 24, 28, 32]
    let activeAnimationButton; 
    let prefix;    
    let current = 4;
    let btn;
    
    function renderExample() {
      const iconDemo = document.getElementById('icon-demo');
      const code = document.getElementById('code-example');
      const className = iconDemo.className.replace(' icon-5x', '');
      
      code.dataset.source = '<i class="' + className + '"></i>';
      let html = '<span style="color: #D5B778">&#60;i </span>';
      html += '<span style="color: #BABABA">class=</span>';
      html += '<span style="color: #6AAB73">&#34;' + className + '&#34;</span>';
      html += '<span style="color: #D5B778">&#62;&#60;/i&#62;</span>';
      
      code.innerHTML = html;
    }
    function onChooseIcon(button) {
      const dialog = document.getElementById('icon-dialog');
      const header = document.getElementById('dialog-header');
      const iconDemo = document.getElementById('icon-demo');
      
      dialog.style.display = 'block';
      prefix = button.dataset.prefix;
      header.innerText = button.dataset.name;
      iconDemo.className = button.dataset.prefix + ' ' + button.dataset.class + ' icon-5x';
      iconDemo.style.color = document.documentElement.classList.contains('dark') ? '#ffffff' : '#000000';

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
        iconDemo.classList.remove(prefix + '-' + activeAnimationButton.dataset.animation);
        activeAnimationButton = undefined;
      }
      
      if (toDisable) {
        renderExample();
        return;
      }
      
      button.classList.add('active');
      iconDemo.classList.add(prefix + '-' + button.dataset.animation);
      activeAnimationButton = button;
      
      renderExample();
    }
    function onCopy(button) {
      const code = document.getElementById('code-example');
      navigator.clipboard.writeText(code.dataset.source).then(() => {
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
    function setZoom(button) {
      const index = parseInt(button.dataset.zoom);
      const newFontSize = fontSizes[current + index];
      if (newFontSize == null) {
        btn = button
        btn.disabled = true
        return;
      }
      if (btn) {
         btn.disabled = false;
         btn = undefined;
      }
     
      
      current = current + index;
      
      document.documentElement.style.setProperty('--icon-font-size', newFontSize + 'px');
    }
  </script>
</head>
`;