import React, { useCallback, useState } from 'react';
import Editor from 'react-simple-code-editor';

import './scss/TextEditor.scss';

// Syntax Highlighting
import { highlight } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-python';
import 'prismjs/themes/prism.min.css'; //Example style, you can use another

function TextEditor(props) {
  const [code, setCode] = useState(props.defaultValue);
  const { className, onChange, onKeyDown, onInput, disabled, highlightType } =
    props;

  const onValueChange = useCallback(
    (code) => {
      setCode(code);
      onChange(code);
    },
    [setCode, onChange]
  );
  const highlightWrapper = useCallback(
    (code) =>
      highlight(code, highlightType)
        .split('\n')
        .map((line, i) => `<span class='editor-linenum'>${i + 1}</span>${line}`)
        .join('\n'),
    [highlightType]
  );

  return (
    <Editor
      className={className}
      textareaClassName="editor-textarea"
      value={code}
      onValueChange={onValueChange}
      onKeyDown={onKeyDown}
      onInput={onInput}
      disabled={disabled}
      highlight={highlightWrapper}
      padding={'1rem'}
    />
  );
}

TextEditor.defaultProps = {
  className: '',
  defaultValue: '',
  onChange: () => {},
  onInput: () => {},
  onKeyDown: () => {},
  disabled: false,
  highlightType: (code) => code,
};

export default React.memo(TextEditor);
