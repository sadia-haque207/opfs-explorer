import { useCallback, useEffect, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { json } from '@codemirror/lang-json';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView } from '@codemirror/view';

interface FileEditorProps {
  content: string;
  fileName: string;
  onChange: (value: string) => void;
}

export function FileEditor({ content, fileName, onChange }: FileEditorProps) {
  const [isDark, setIsDark] = useState(window.matchMedia('(prefers-color-scheme: dark)').matches);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const getExtensions = useCallback(() => {
    const exts = [EditorView.lineWrapping];
    if (fileName.endsWith('.json')) exts.push(json());
    else if (fileName.endsWith('.html')) exts.push(html());
    else if (fileName.endsWith('.css')) exts.push(css());
    else exts.push(javascript({ jsx: true, typescript: true }));
    return exts;
  }, [fileName]);

  return (
    <div className="h-full w-full overflow-hidden text-sm relative">
      <CodeMirror
        value={content}
        height="100%"
        theme={isDark ? oneDark : 'light'}
        extensions={getExtensions()}
        onChange={onChange}
        className="h-full text-base"
        basicSetup={{
            lineNumbers: true,
            highlightActiveLineGutter: true,
            foldGutter: true,
            searchKeymap: true,
            lintKeymap: true,
        }}
      />
    </div>
  );
}
