import React, { useCallback, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import Ansi from 'ansi-to-react';
import ReactMarkdown from 'react-markdown';
import RemarkGFM from 'remark-gfm';
import RemarkMath from 'remark-math';
import RehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import SyntaxHighlighter from 'react-syntax-highlighter';

import './JupyterViewer.scss';
import hljsStyles from './hljsStyles';

/* The code cells */
function BlockSource(props) {
  // Get component properties
  const { onSubmit } = props;

  // Get cell properties
  const metadata = props.cell['metadata'];
  const source = props.cell['source'];
  const type = props.cell['cell_type'];

  // Reference the textarea used for the code cell specifically
  const codeContentRef = useRef(null);

  const [state, setState] = useState({
    prevDisplay: 1,
    display: 1,
    contentHeight: 0,
  });

  // Determine whether to display the code cell
  if (props.display !== state.prevDisplay) {
    let newDisplay = props.display;
    if (newDisplay === -1) {
      if (
        metadata['jupyter'] !== undefined &&
        metadata['jupyter']['source_hidden']
      ) {
        newDisplay = 0;
      }
    }

    setState({ ...state, prevDisplay: props.display, display: newDisplay });
  }

  // Generate cell contents
  let htmlContent,
    executionCount = null;
  switch (type) {
    case 'code':
      executionCount = props.cell['execution_count'];
      const adjustTextArea = () => {
        setTimeout(() => {
          const textArea = codeContentRef.current;
          if (textArea) {
            textArea.style.height = 'auto';
            textArea.style.height = 16 + textArea.scrollHeight + 'px';
          }
        }, 0);
      };
      const keyCallback = (e) => {
        adjustTextArea();

        // If shift-enter - call the callback
        if (e.shiftKey && e.which === 13) {
          onSubmit(e);
          e.preventDefault();
        }
      };

      htmlContent = (
        <div className="cell-content source-code">
          {/* Actual code cell */}
          <textarea
            className="source-code-main"
            onKeyDown={keyCallback}
            ref={codeContentRef}
          ></textarea>
        </div>
      );
      break;
    case 'markdown':
      // '$$' has to be in a separate new line to be rendered as a block math equation.
      const re = /\n?\s*\$\$\s*\n?/g;
      let newSource = source.join('').replaceAll(re, '\n$$$\n');

      htmlContent = (
        <div className="cell-content source-markdown">
          <ReactMarkdown
            remarkPlugins={[RemarkGFM, RemarkMath]}
            rehypePlugins={[RehypeKatex]}
          >
            {newSource}
          </ReactMarkdown>
        </div>
      );
      break;
    default:
      htmlContent = <div>{`Cell Type ${type} not supported...`}</div>;
      break;
  }

  return (
    <div className="block-source">
      {/* The blue highlight for the cell */}
      <div
        className={props.highlighted ? 'block-light-selected' : 'block-light'}
        onClick={() => {
          setState({ ...state, display: (state.display + 1) % 2 });
        }}
      />

      {state.display === 0 ? (
        <div className="block-hidden" />
      ) : (
        <div className="cell-row">
          {/* The execution counter */}
          <pre className="cell-header source">
            {executionCount ? `[${executionCount}]: ` : null}
          </pre>
          {htmlContent}
        </div>
      )}
    </div>
  );
}

/* The cell output */
function BlockOutput(props) {
  const metadata = props.cell['metadata'];
  const outputs = props.cell['outputs'];

  const [state, setState] = useState({
    highlighted: false,
    prevDisplay: 1,
    display: 1,
    contentHeight: 0,
  });
  const contentRef = useCallback((node) => {
    if (node) {
      setState((state) => ({ ...state, contentHeight: node.offsetHeight }));
    }
  }, []);

  if (props.display !== state.prevDisplay) {
    let newDisplay = props.display;
    if (newDisplay === -1) {
      if (
        metadata['collapsed'] ||
        (metadata['jupyter'] !== undefined &&
          metadata['jupyter']['outputs_hidden'])
      ) {
        newDisplay = 0;
      } else if (metadata['scrolled']) {
        newDisplay = 2;
      }
    }

    setState({ ...state, prevDisplay: props.display, display: newDisplay });
  }

  return (
    <div className="block-output">
      <div
        className={props.highlighted ? 'block-light-selected' : 'block-light'}
        onClick={() => {
          setState({ ...state, display: (state.display + 1) % 3 });
        }}
      />
      {state.display === 0 ? (
        <div className="block-hidden" />
      ) : (
        <div
          className="block-output-content"
          style={
            state.display === 2
              ? {
                  maxHeight: state.contentHeight,
                  height: 200,
                  boxShadow: 'inset 0 0 6px 2px rgb(0 0 0 / 30%)',
                  resize: 'vertical',
                }
              : null
          }
        >
          <div ref={contentRef}>
            {outputs.map((output, index) => {
              let executionCount;
              let htmlContent;
              if ('output_type' in output) {
                let output_type = output['output_type'];
                switch (output_type) {
                  // Stdout and stderr
                  case 'stream':
                    htmlContent = (
                      <pre
                        className={`cell-content ${
                          output['name'] === 'stdout'
                            ? 'output-std'
                            : 'output-err'
                        }`}
                      >
                        {output['text'].join('')}
                      </pre>
                    );

                    break;
                  // Output with execution_count
                  case 'execute_result':
                    executionCount = output['execution_count'];

                  // Output without execution_count
                  case 'display_data':
                    let output_data = output['data'];

                    if ('image/png' in output_data) {
                      let output_metadata = output['metadata'];
                      let size =
                        output_metadata && output_metadata['image/png'];
                      htmlContent = (
                        <div
                          className="cell-content output-display"
                          style={{
                            justifyContent: props.mediaAlign,
                          }}
                        >
                          <img
                            src={`data:image/png;base64,${output_data['image/png']}`}
                            width={size ? size['width'] : 'auto'}
                            height={size ? size['height'] : 'auto'}
                            alt=""
                          />
                        </div>
                      );
                    } else if ('text/html' in output_data) {
                      htmlContent = (
                        <div
                          className="cell-content output-display"
                          style={{
                            justifyContent: props.mediaAlign,
                          }}
                          dangerouslySetInnerHTML={{
                            __html: output_data['text/html'].join(''),
                          }}
                        />
                      );
                    } else if ('text/plain' in output_data) {
                      htmlContent = (
                        <pre className="cell-content output-std">
                          {output_data['text/plain'].join('')}
                        </pre>
                      );
                    }

                    break;
                  // Exceptions
                  case 'error':
                    let output_traceback = output['traceback'].join('\n');

                    htmlContent = (
                      <pre className="cell-content output-err">
                        <Ansi>{output_traceback}</Ansi>
                      </pre>
                    );

                    break;
                  default:
                    console.log('Unexpected output_type: ', output_type);
                }
              }

              return (
                <div key={index} className="cell-row">
                  <pre className="cell-header output">
                    {executionCount ? `[${executionCount}]: ` : null}
                  </pre>
                  {htmlContent}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function JupyterViewer(props) {
  // -1: auto, 0: hide, 1: show, 2: scroll
  const DISPLAYS = ['hide', 'show', 'scroll'];
  const [clickCellIndex, setCellIndex] = useState(-1);
  const [cells, setCells] = useState([]);

  function addCell(type) {
    let newCell = [
      {
        cell_type: type,
        source: ['meme'],
        metadata: {},
        execution_count: ' ',
      },
    ];
    setCells(cells.concat(newCell));
  }

  return (
    <div className="jupyter-viewer">
      {cells.map((cell, index) => {
        return (
          <div
            key={index}
            className="block"
            onMouseDown={() => {
              setCellIndex(index);
            }}
          >
            {!('cell_type' in cell) ? null : (
              <BlockSource
                cell={cell}
                highlighted={clickCellIndex === index}
                display={DISPLAYS.indexOf(props.displaySource)}
                onSubmit={(e) => {
                  alert('Cell submitted');
                }}
              />
            )}
            {!('outputs' in cell) ? null : (
              <BlockOutput
                cell={cell}
                highlighted={clickCellIndex === index}
                display={DISPLAYS.indexOf(props.displayOutput)}
                mediaAlign={
                  { left: 'flex-start', center: 'center', right: 'flex-end' }[
                    props.mediaAlign
                  ]
                }
              />
            )}
          </div>
        );
      })}
      <div className="add-buttons">
        <button className="add-code-btn" onClick={(_) => addCell('code')}>
          + Code
        </button>
        <button
          className="add-markdown-btn"
          onClick={(_) => addCell('markdown')}
        >
          + Markdown
        </button>
      </div>
    </div>
  );
}

JupyterViewer.defaultProps = {
  showLineNumbers: true,
  mediaAlign: 'center',
  displaySource: 'auto',
  displayOutput: 'auto',
  codeBlockStyles: undefined,
};

JupyterViewer.propTypes = {
  rawIpynb: PropTypes.object.isRequired,
  showLineNumbers: PropTypes.bool,
  mediaAlign: PropTypes.oneOf(['left', 'center', 'right']),
  displaySource: PropTypes.oneOf(['auto', 'hide', 'show']),
  displayOutput: PropTypes.oneOf(['auto', 'hide', 'show', 'scroll']),
  codeBlockStyles: PropTypes.shape({
    hljsStyle: PropTypes.oneOf(Object.keys(hljsStyles)),
    lineNumberContainerStyle: PropTypes.object,
    lineNumberStyle: PropTypes.object,
    codeContainerStyle: PropTypes.object,
  }),
};

export default JupyterViewer;
