// A small, dependency-free rich text editor for bilingual content fields.
// Avoids needing an external library/CDN just for basic bold/italic/list/link formatting.
function createRichEditor(container, initialHTML) {
  container.innerHTML = '';
  container.classList.add('editor-box');

  const toolbar = document.createElement('div');
  toolbar.style.cssText = 'display:flex;gap:4px;padding:6px;border-bottom:1px solid var(--rule);flex-wrap:wrap;';

  const buttons = [
    ['bold', 'B'],
    ['italic', 'I'],
    ['insertUnorderedList', '• List'],
    ['insertOrderedList', '1. List'],
    ['indent', 'Indent →'],
    ['outdent', '← Outdent'],
    ['formatBlock:H2', 'Heading'],
    ['formatBlock:P', 'Paragraph'],
    ['createLink', 'Link'],
    ['removeFormat', 'Clear'],
  ];

  const editable = document.createElement('div');
  editable.contentEditable = 'true';
  editable.style.cssText = 'min-height:160px;padding:12px;font-family:var(--font-serif);font-size:1rem;outline:none;';
  editable.innerHTML = initialHTML || '';

  buttons.forEach(([cmd, label]) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = label;
    btn.className = 'btn secondary small';
    btn.addEventListener('click', () => {
      editable.focus();
      if (cmd === 'createLink') {
        const url = prompt('Link URL:');
        if (url) document.execCommand('createLink', false, url);
      } else if (cmd.startsWith('formatBlock:')) {
        document.execCommand('formatBlock', false, cmd.split(':')[1]);
      } else {
        document.execCommand(cmd, false, null);
      }
    });
    toolbar.appendChild(btn);
  });

  container.appendChild(toolbar);
  container.appendChild(editable);

  return {
    getHTML: () => editable.innerHTML,
    setHTML: (html) => { editable.innerHTML = html || ''; },
  };
}
