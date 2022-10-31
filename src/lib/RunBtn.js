import React from 'react';
import BlockBtn from './BlockBtn';
import './scss/RunBtn.scss';

function RunBtn(props) {
  const {
    codeStatus,
    runCallback,
    showMarkdown,
    isMarkdownCell,
    executionCount,
  } = props;
  const hidden = codeStatus <= 0 && !isMarkdownCell;

  return (
    <div className="cell-info">
      <div>
        {showMarkdown === false && (
          <div className="cell-run-btn">
            <BlockBtn callback={runCallback} hidden={hidden}>
              {' '}
              {codeStatus > 0 ? '\u{25A0}' : '\u{25B6}'}{' '}
            </BlockBtn>
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

export default React.memo(RunBtn);