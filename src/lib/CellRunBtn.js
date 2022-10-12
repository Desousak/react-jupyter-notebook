import React from 'react';
import './scss/CellRunBtn.scss';

export default class CellRunBtn extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ...props,
    };
  }

  static getDerivedStateFromProps(props, current_state) {
    for (let key in current_state) {
      if (current_state[key] !== props.key) return { ...props };
    }
    return null;
  }

  render() {
    const {
      codeStatus,
      executionCount,
      runCallback,
      showMarkdown,
      isMarkdownCell,
    } = this.state;
    const hidden = codeStatus <= 0 && !isMarkdownCell;

    return (
      <div className="cell-info">
        <div className="sticky-wrapper">
          {showMarkdown === false && (
            <div className="cell-run-btn">
              <button
                onClick={runCallback}
                className={'block-btn' + (hidden ? ' hidden' : '')}
              >
                {codeStatus > 0 ? '\u{25A0}' : '\u{25B6}'}
              </button>
            </div>
          )}
          {hidden ? (
            <pre className="cell-run-count source">
              {executionCount !== undefined ? `[${executionCount}]` : null}
            </pre>
          ) : null}
        </div>
      </div>
    );
  }
}
