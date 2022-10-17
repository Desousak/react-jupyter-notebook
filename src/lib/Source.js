import React from 'react';
import Timer from './Timer';
import RunBtn from './RunBtn';
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

export default class Source extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      codeStatus: -1,
      shown: props.shown,
      cellType: props.cellType,
      showMarkdown: props.showMarkdown,
    };
    this.editable = props.editable;
    this.executionCount = props.executionCount;
    this.kernelMessenger = props.kernelMessenger;
    this.source = props.source ? props.source : [];

    // Callbacks
    this.updateOutputs = props.updateOutputs;
    this.onKeyCallback = this.keyCallback.bind(this);
    this.onChangeCallback = this.updateContent.bind(this);
    this.runCallback = () => console.error('Incorrect cell type!');
  }

  componentDidUpdate() {
    // Update visibility if needed
    if (this.props.shown !== this.state.shown) {
      this.setState({ shown: this.props.shown });
    }
  }

  // %%%%%%%%%%%%
  // Code Execution
  // %%%%%%%%%%%%
  run(code) {
    if (this.state.codeStatus <= 0) {
      // Reset source but keep output for now - will be reset later
      this.resetSource(false, null, { codeStatus: 1 }, () =>
        this.kernelMessenger.runCode(code, this.parseResponse.bind(this))
      );
    } else {
      // Stop execution
      if (this.kernelMessenger.signalKernel(2))
        this.setState({ codeStatus: -2 });
    }
  }

  parseResponse(msg) {
    // Check is used to prevent running code & change of cell type race condition
    if (this.state.cellType !== 'markdown') {
      // Messages expected (in order of occurrence)
      const msgType = msg.header.msg_type,
        msgContent = msg.content;

      switch (msgType) {
        case 'status':
          // Kernel status (usually busy or idle -> first and last messages)
          let kernelBusy = msgContent.execution_state === 'busy';

          if (this.state.codeStatus !== -2) {
            if (kernelBusy) {
              // Clear the output only when we get response from the kernel
              this.resetSource(true, false, { codeStatus: 2 });
            } else if (this.executionCount === null) {
              // TODO: Investigate if this causes bugs
              // Execution suddenly ended...
              this.setState({ codeStatus: -2 });
            } else {
              // End of output
              this.setState({ codeStatus: 0 });
            }
          }
          break;
        case 'execute_input':
          // Post-run execution count (usually second message)
          this.executionCount = msgContent.execution_count;
          break;
        case 'error':
          this.setState({ codeStatus: -2 });
        // Fall through
        case 'stream':
        case 'display_data':
        case 'execute_result':
          // Execution Results - add to outputs array (third to second last message)
          this.updateOutputs({
            ...msgContent,
            output_type: msgType,
          });
          break;
        case 'shutdown_reply':
          this.resetSource(true, false, { codeStatus: -2 });
          break;
        default:
      }
    }
  }

  // %%%%%%%%%%%%%%%%%%%%%%%%
  // Source & Cell Management
  // %%%%%%%%%%%%%%%%%%%%%%%%
  resetSource(
    clearOutput = true,
    setExecCount = null,
    resetVals = { codeStatus: 0 },
    callback
  ) {
    if (clearOutput) this.updateOutputs(null, true);
    if (setExecCount !== false) {
      this.executionCount = setExecCount;
    }
    if (resetVals) this.setState(resetVals, callback);
  }

  getSourceData() {
    return {
      execution_count: this.executionCount,
      metadata: {
        editable: this.editable,
        jupyter: {
          source_hidden: !Boolean(this.state.shown),
        },
      },
      source: this.source,
    };
  }

  toggleLang() {
    // Stop any on-going execution
    let signalStatus = true;
    if (this.state.codeStatus > 0)
      signalStatus = this.kernelMessenger.signalKernel(2);
    if (signalStatus)
      this.resetSource(true, null, (state) => {
        return {
          cellType: state.cellType === 'code' ? 'markdown' : 'code',
          codeStatus: -1,
        };
      });
  }

  // %%%%%%%%%%%%%%
  // Text Callbacks
  // %%%%%%%%%%%%%%
  updateContent(code) {
    // Store the changes to the content
    // Done so that we can restore it if the cell is hidden
    this.source = code.split(/^/m);
  }

  keyCallback(e) {
    // If shift-enter - call the callback
    if (e.shiftKey && e.which === 13) {
      this.runCallback(this.source);
      e.preventDefault();
      e.stopPropagation();
    }
  }

  preProcessMarkdown(text) {
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

  render() {
    // SWITCH BETWEEN CELL TYPES
    let highlightType, executionCount;
    switch (this.state.cellType) {
      case 'code':
        this.runCallback = (_) => this.run(this.source);
        highlightType = languages.py;
        executionCount =
          this.executionCount !== null ? this.executionCount : ' ';
        break;
      case 'markdown':
        this.runCallback = () => this.setState({ showMarkdown: true });
        break;
      default:
        break;
    }

    // DISPLAY EDITOR OR RENDERED MARKDOWN
    const mergedCode = this.source.join('');
    let cellContent;
    if (!this.state.showMarkdown) {
      cellContent = (
        <div className="cell-content source-code">
          {/* Actual code cell */}
          <TextEditor
            className="source-code-main"
            defaultValue={mergedCode}
            onChange={this.onChangeCallback}
            onKeyDown={this.onKeyCallback}
            disabled={
              !(this.editable === undefined || this.editable) ? true : false
            }
            highlightType={highlightType}
          />
          {/* Run time and Language switcher */}
          <div className="cell-status">
            <Timer status={this.state.codeStatus} />
            <button
              className="block-btn cell-type-btn"
              onClick={(_) => this.toggleLang()}
            >
              {this.state.cellType}
            </button>
          </div>
        </div>
      );
    } else {
      const newSource = this.preProcessMarkdown(mergedCode);
      const reenableEditing = () => this.setState({ showMarkdown: false });
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

    return this.state.shown === 0 ? (
      <div className="source-hidden" />
    ) : (
      <div className="cell-row" tabIndex="0" onKeyDown={this.onKeyCallback}>
        {/* Left side of the code editor */}
        <RunBtn
          runCallback={this.runCallback}
          codeStatus={this.state.codeStatus}
          executionCount={executionCount}
          showMarkdown={this.state.showMarkdown}
          isMarkdownCell={this.state.cellType === 'markdown'}
        />
        {/* Code itself (or markdown) */}
        {cellContent}
      </div>
    );
  }
}
