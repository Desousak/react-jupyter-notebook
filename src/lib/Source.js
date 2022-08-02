import React from 'react';

/* Code-cell Styling */
import TextEditor from './TextEditor';
import { languages } from 'prismjs/components/prism-core';

/* Markdown Styling */
import ReactMarkdown from 'react-markdown';
import RemarkGFM from 'remark-gfm';
import RemarkMath from 'remark-math';
import RehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import KernelMessaging from './KernelMessaging';

export default class Source extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cellType: props.cellType,
      showMarkdown: props.showMarkdown,
      executionCount: props.executionCount,
      kernelBusy: false,
      shown: props.shown,
    };
    this.source = props.source ? props.source : [];
    this.editable = props.editable;
    this.kernelMessager = KernelMessaging.getInstance();

    this.runCallback = () => console.error('Incorrect cell type!');
    this.updateOutputs = props.updateOutputs;
  }

  componentDidUpdate() {
    // Update visibility if needed
    if (this.props.shown !== this.state.shown) {
      this.setState({ shown: this.props.shown });
    }
  }

  run(code) {
    let parseResponse = (msg) => {
      const msgContent = msg.content;
      switch (msg.msg_type) {
        case 'status':
          // Kernel status (usually busy or idle)
          let kernelBusy = msgContent.execution_state === 'busy';
          this.setState({ kernelBusy });
          break;
        case 'execute_input':
          // Post-run execution count
          let executionCount = msgContent.execution_count;
          this.setState({ executionCount });
          break;
        case 'error':
        case 'stream':
        case 'display_data':
        case 'execute_result':
          // Execution Results - add to outputs array
          let content = { ...msgContent, output_type: msg.msg_type };
          this.updateOutputs(content);
          break;
        default:
          break;
      }
    };

    this.updateOutputs(null, true);
    this.kernelMessager.runCode(code, parseResponse);
    this.setState({ executionCount: ' ' });
  }

  getCellData() {
    return {
      execution_count: this.state.executionCount,
      metadata: {
        editable: this.editable,
        jupyter: {
          source_hidden: !Boolean(this.state.shown),
        },
      },
      source: this.source,
    };
  }

  updateCellContent(code) {
    // Store the changes to the content
    // Done so that we can restore it if the cell is hidden
    this.source = code.split(/^/m);
  }

  keyCallback(e) {
    // If shift-enter - call the callback
    if (e.shiftKey && e.which === 13) {
      this.runCallback(this.source);
      e.preventDefault();
    }
  }

  render() {
    // Switch between cell types (code & markdown)
    let highlightType = undefined;
    switch (this.state.cellType) {
      case 'code':
        this.runCallback = (c) => this.run(c);
        highlightType = languages.py;
        break;
      case 'markdown':
        this.runCallback = () => this.setState({ showMarkdown: true });
        break;
      default:
        break;
    }

    // Whether to show the rendered markdown, or just the editor
    const mergedCode = this.source.join('');
    let htmlContent, runButton, executionCount;
    if (!this.state.showMarkdown) {
      htmlContent = (
        <div className="cell-content source-code">
          {/* Actual code cell */}
          <TextEditor
            className="source-code-main"
            defaultValue={mergedCode}
            onChange={(e) => this.updateCellContent(e)}
            disabled={
              !(this.editable === undefined || this.editable) ? true : false
            }
            highlightType={highlightType}
          />
        </div>
      );
      runButton = (
        <button
          onClick={() => this.runCallback(this.source)}
          className="cell-run-btn block-btn"
        >
          &#9658;
        </button>
      );
    } else {
      // '$$' has to be in a separate new line to be rendered as a block math equation.
      const re = /\n?\s*\$\$\s*\n?/g;
      let newSource = mergedCode.replaceAll(re, '\n$$$\n');
      const reenableEditing = () => this.setState({ showMarkdown: false });
      htmlContent = (
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

    // Format execution counter
    executionCount = !this.state.kernelBusy ? this.state.executionCount : '*';
    executionCount = executionCount === null ? ' ' : executionCount;

    return this.state.shown === 0 ? (
      <div className="block-hidden" />
    ) : (
      <div
        className="cell-row"
        tabIndex="0"
        onKeyDown={(e) => this.keyCallback(e)}
      >
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
        {htmlContent}
      </div>
    );
  }
}
