import React, { useEffect, useRef, useState } from 'react';
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
  const { cell_type, source, execution_count, metadata } = props.cell;
  // Get metadata properties
  const { deletable, editable, name, tags, jupyter, execution } = metadata;
  // Reference the textarea used for the code cell specifically
  const cellSourceRef = useRef(null);
  // Whether to show or hide the cell (0/1)
  const [cellShown, setCellShown] = useState(
    jupyter && jupyter.source_hidden ? 0 : 1
  );
  // Content kept within the cell
  const contentRef = useRef(source ? source : []);
  // Flag to determine whether to show the markdown content
  // Automatically shown if the cell is first loaded with content
  const [showMarkdown, setShowMarkdown] = useState(
    source.length > 0 && cell_type === 'markdown' ? true : false
  );

  // Generate cell contents
  let htmlContent, // Code editor itself
    callbackFunc, // The function used when the user tries to run the cell
    markdownElem, // The processed markdown text
    executionCount = null;

  switch (cell_type) {
    case 'code':
      executionCount = props.cell['execution_count'];
      callbackFunc = onSubmit;
      break;
    case 'markdown':
      callbackFunc = () => setShowMarkdown(true);
      if (showMarkdown) {
        // '$$' has to be in a separate new line to be rendered as a block math equation.
        const re = /\n?\s*\$\$\s*\n?/g;
        let newSource = contentRef.current.join('').replaceAll(re, '\n$$$\n');

        const reenableEditing = () => {
          // console.log(cellSourceRef, contentRef);
          setShowMarkdown(false);
        };
        markdownElem = (
          <div
            className="cell-content source-markdown"
            onDoubleClick={() => reenableEditing()}
          >
            <ReactMarkdown
              remarkPlugins={[RemarkGFM, RemarkMath]}
              rehypePlugins={[RehypeKatex]}
            >
              {newSource}
            </ReactMarkdown>
          </div>
        );
      }
      break;
    default:
      // htmlContent = <div>{`Cell Type ${cell_type} not supported...`}</div>;
      break;
  }

  const adjustTextArea = () => {
    const textArea = cellSourceRef.current;
    if (textArea) {
      textArea.style.height = 'auto';
      textArea.style.height = textArea.scrollHeight + 'px';
    }
  };
  const updateContent = (e) => {
    // Store the changes to the content
    // Done so that we can restore it if the cell is hidden
    const textArea = cellSourceRef.current;
    if (textArea) {
      contentRef.current = textArea.value.split(/^/m);
    }
  };
  const keyCallback = (e) => {
    // If shift-enter - call the callback
    if (e.shiftKey && e.which === 13) {
      callbackFunc(contentRef.current);
      e.preventDefault();
    }
  };

  let runButton = showMarkdown ? null : (
    <button
      onClick={() => callbackFunc(contentRef.current)}
      className="cell-run-btn"
    >
      &#9658;
    </button>
  );
  htmlContent = (
    <div className="cell-content source-code">
      {/* Actual code cell */}
      <textarea
        className="source-code-main"
        onKeyDown={keyCallback}
        ref={cellSourceRef}
        defaultValue={contentRef.current.join('\n')}
        onChange={updateContent}
        onInput={adjustTextArea}
        disabled={!editable}
      ></textarea>
    </div>
  );

  // Auto adjust the text area size on load
  // Helps when using the markdown editor
  useEffect(() => {
    if (!showMarkdown) {
      adjustTextArea();
    }
  }, [showMarkdown]);

  return (
    <div className="block-source">
      {/* The blue highlight for the cell */}
      <div
        className={props.highlighted ? 'block-light-selected' : 'block-light'}
        onClick={() => setCellShown((cellShown + 1) % 2)}
      />

      {cellShown === 0 ? (
        <div className="block-hidden" />
      ) : (
        <div className="cell-row">
          {/* Left side of the code editor */}
          <div className="cell-info">
            {/* The cell run button */}
            {runButton}
            {/* The execution counter */}
            <pre className="cell-header source">
              {executionCount ? `[${executionCount}]` : null}
            </pre>
          </div>
          {/* Code itself (or markdown) */}
          {showMarkdown ? markdownElem : htmlContent}
        </div>
      )}
    </div>
  );
}

/* The cell output */
function BlockOutput(props) {
  // Get the cell, outputs, and metadata
  const { cell } = props;
  const { outputs, metadata } = cell;
  // Get metadata properties
  const { collapsed, scrolled, jupyter } = metadata;
  // Whether to show or hide the cell (0/1/2)
  const [cellShown, setCellShown] = useState((_) => {
    if ((jupyter && jupyter.outputs_hidden) || collapsed) {
      return 0; // Hidden
    } else if (scrolled) {
      return 2; // Scroll
    }
    return 1; // Show
  });

  return (
    <div className="block-output">
      {/* Hide / Show the output */}
      <div
        className={props.highlighted ? 'block-light-selected' : 'block-light'}
        onClick={() => setCellShown((cellShown + 1) % 3)}
      />
      {cellShown === 0 ? (
        <div className="block-hidden" />
      ) : (
        <div
          className="block-output-content"
          style={
            cellShown === 2
              ? {
                  maxHeight: '24em', // Hard coded to a reasonable value
                  height: 200,
                  boxShadow: 'inset 0 0 6px 2px rgb(0 0 0 / 30%)',
                  resize: 'vertical',
                }
              : null
          }
        >
          <div>
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
                  <div className="cell-info">
                    <pre className="cell-header output">
                      {executionCount ? `[${executionCount}]` : null}
                    </pre>
                  </div>
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
  const { rawIpynb } = props;
  const [clickCellIndex, setCellIndex] = useState(-1);
  const [cells, setCells] = useState(rawIpynb.cells);
  // const [cells, setCells] = useState([]);

  function addCell(type) {
    let newCell = {};

    switch (type) {
      default:
      case 'code':
        newCell = {
          cell_type: type,
          execution_count: ' ',
          metadata: {},
          source: [],
          outputs: [],
        };
        break;
      case 'markdown':
        newCell = {
          cell_type: type,
          metadata: {},
          source: [],
        };
        break;
    }
    setCells(cells.concat([newCell]));
  }

  function runCell(cell, index, content) {
    // TODO: ADD RUNNING INFORMATION, CELL NUMBERING, AND RESPONSE FROM BACKEND
    const newCell = {
      ...cell,
      outputs: [
        {
          name: 'stdout',
          output_type: 'stream',
          text: [...content],
        },
      ],
    };
    setCells(cells.map((c, i) => (i === index ? newCell : c)));
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
                onSubmit={(content) => runCell(cell, index, content)}
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
