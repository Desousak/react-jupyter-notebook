import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import Timer from './Timer';
import RunBtn from './RunBtn';
import kernelMessenger from './MessengerProxy.js';

import './scss/Source.scss';

/* Code-cell Styling */
import TextEditor from './TextEditor';
import { languages } from 'prismjs/components/prism-core';

/* Markdown Styling */
import 'katex/dist/katex.min.css';
import RemarkGFM from 'remark-gfm';
import RemarkMath from 'remark-math';
import RehypeKatex from 'rehype-katex';
import ReactMarkdown from 'react-markdown';

function Source(props) {
  // Parse cell
  const { cellIndex } = props;
  const cell = useSelector((state) => state.notebook.data.cells[cellIndex]);
  const { cell_type: cellType, metadata, source } = cell;
  const { jupyter } = metadata;

  // Hooks
  const dispatch = useDispatch();
  const [codeStatus, setCodeStatus] = useState(-1);
  const [showMarkdown, setShowMarkdown] = useState(
    source.length > 0 && cellType === 'markdown' ? true : false
  );

  function updateCell(newCell) {
    dispatch({
      type: 'notebook/updateCell',
      payload: { index: cellIndex, cell: newCell },
    });
  }

  // Render variables
  let highlightType, cellContent, runCallback;
  const shown = jupyter && jupyter.source_hidden ? 0 : 1,
    mergedCode = source.join(''),
    { execution_count: executionCount } = cell,
    { editable } = metadata;

  function run(code) {
    if (codeStatus <= 0) {
      // Reset source but keep output for now - will be reset later
      updateCell({ execution_count: null });
      setCodeStatus(1);
      kernelMessenger.runCode(code, parseResponse);
    } else {
      // Stop execution
      if (kernelMessenger.signalKernel(2)) setCodeStatus(-2);
    }
  }

  function parseResponse(msg) {
    // Check is used to prevent running code & change of cell type race condition
    if (cellType !== 'markdown') {
      // Messages expected (in order of occurrence)
      const msgType = msg.header.msg_type,
        msgContent = msg.content;

      switch (msgType) {
        case 'status':
          // Kernel status (usually busy or idle -> first and last messages)
          let kernelBusy = msgContent.execution_state === 'busy';

          if (codeStatus !== -2) {
            if (kernelBusy) {
              // Clear the output only when we get response from the kernel
              updateCell({ outputs: [] });
              setCodeStatus(2);
            } else if (executionCount === null) {
              // TODO: Investigate if this causes bugs
              // Execution suddenly ended...
              setCodeStatus(-2);
            } else {
              // End of output
              setCodeStatus(0);
            }
          }
          break;
        case 'execute_input':
          // Post-run execution count (usually second message)
          updateCell({ execution_count: msgContent.execution_count });
          // executionCount = msgContent.execution_count;
          break;
        case 'error':
          setCodeStatus(-2);
        // Fall through
        case 'stream':
        case 'display_data':
        case 'execute_result':
          // Execution Results - add to outputs array (third to second last message)
          const output = {
            ...msgContent,
            output_type: msgType,
          };
          dispatch({
            type: 'notebook/addOutput',
            payload: { index: cellIndex, output },
          });
          break;
        case 'shutdown_reply':
          updateCell({ output: [] });
          setCodeStatus(-2);
          break;
        default:
      }
    }
  }

  function toggleLang() {
    // Stop any on-going execution
    let signalStatus = true;
    if (codeStatus > 0) signalStatus = kernelMessenger.signalKernel(2);
    if (signalStatus) {
      setCodeStatus(-1);
      updateCell({
        output: [],
        cell_type: cellType === 'code' ? 'markdown' : 'code',
      });
    }
  }

  function updateContent(code) {
    // Store the changes to the content
    // Done so that we can restore it if the cell is hidden
    updateCell({ ...cell, source: code.split(/^/m) });
  }

  function keyCallback(e) {
    // If shift-enter - call the callback
    if (e.shiftKey && e.which === 13) {
      runCallback(source);
      e.preventDefault();
      e.stopPropagation();
    }
  }

  function preProcessMarkdown(text) {
    const fixMath = (text) => {
      // '$$' has to be in a separate new line to be rendered as a block math equation.
      const re = /\n?\s*\$\$\s*\n?/g;
      return text.replaceAll(re, '\n$$$\n');
    };
    const trimWhitespace = (text) => {
      // Whitespace on the beginning of lines must be removed for HTML
      let res = '',
        lines = text.split('\n');
      for (let line of lines) {
        res += line.trim() + '\n';
      }
      return res;
    };

    let res = text;
    const pipeline = [fixMath, trimWhitespace];
    pipeline.forEach((pipe) => (res = pipe(res)));
    return res;
  }

  // Set run-callback and execution count based on cell-type
  switch (cellType) {
    case 'code':
      runCallback = (_) => run(source);
      highlightType = languages.py;
      break;
    case 'markdown':
      runCallback = () => setShowMarkdown(true);
      break;
    default:
      break;
  }

  // Build either editor or rendered markdown view
  if (!showMarkdown) {
    cellContent = (
      <div className="cell-content source-code">
        {/* Actual code cell */}
        <TextEditor
          className="source-code-main"
          defaultValue={mergedCode}
          onChange={updateContent}
          onKeyDown={keyCallback}
          disabled={!(editable === undefined || editable) ? true : false}
          highlightType={highlightType}
        />
        {/* Run time and Language switcher */}
        <div className="cell-status">
          <Timer status={codeStatus} />
          <button className="block-btn cell-type-btn" onClick={toggleLang}>
            {cellType}
          </button>
        </div>
      </div>
    );
  } else {
    const newSource = preProcessMarkdown(mergedCode);
    const reenableEditing = () => setShowMarkdown(false);
    cellContent = (
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

  // console.log(`Source ${cellIndex} re-rendered!`);
  return shown === 0 ? (
    <div className="source-hidden" />
  ) : (
    <div className="cell-row" tabIndex="0" onKeyDown={keyCallback}>
      {/* Left side of the code editor */}
      <RunBtn
        codeStatus={codeStatus}
        runCallback={runCallback}
        showMarkdown={showMarkdown}
        isMarkdownCell={cellType === 'markdown'}
        executionCount={executionCount !== null ? executionCount : ' '}
      />
      {/* Code itself (or markdown) */}
      {cellContent}
    </div>
  );
}

export default React.memo(Source);
