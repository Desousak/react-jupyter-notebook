import React from 'react';
import Editor from 'react-simple-code-editor';

import './scss/TextEditor.scss';

// Syntax Highlighting
import { highlight } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-python';
import 'prismjs/themes/prism.min.css'; //Example style, you can use another

class TextEditor extends React.PureComponent {
  constructor(props) {
    super(props);
    const { defaultValue } = props;
    this.state = {
      code: defaultValue,
      height: 0,
    };
  }

  render() {
    const { className, onChange, onKeyDown, onInput, disabled, highlightType } =
      this.props;

    return (
      <Editor
        className={className}
        textareaClassName="editor-textarea"
        value={this.state.code}
        onValueChange={(code) => {
          this.setState({ code: code });
          onChange(code);
        }}
        onKeyDown={onKeyDown}
        onInput={onInput}
        disabled={disabled}
        highlight={(code) =>
          highlight(code, highlightType)
            .split('\n')
            .map(
              (line, i) => `<span class='editor-linenum'>${i + 1}</span>${line}`
            )
            .join('\n')
        }
        padding={'1rem'}
      />
    );
  }
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

export default TextEditor;
