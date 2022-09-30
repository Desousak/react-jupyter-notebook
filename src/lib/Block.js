import React, { createRef } from 'react';
import { BiTrash } from 'react-icons/bi';

import Source from './Source';
import BlockOutput from './Output';
import ToggleVisibilityBar from './ToggleVisibilityBar';

import './scss/Block.scss';
import './scss/BlockControls.scss';

const BlockControls = React.memo(function BlockControls(props) {
  const { deletable, onMove, onInsert, onDelete } = props;
  return (
    <div className="block-controls">
      {/* Cell move button(s) */}
      <button className="block-up-btn block-btn" onClick={() => onMove(-1)}>
        ↑
      </button>
      <button className="block-down-btn block-btn" onClick={() => onMove(1)}>
        ↓
      </button>

      {/* Cell insert button(s) */}
      <button
        className="block-insert-up-btn block-btn"
        onClick={() => onInsert(0)}
      >
        +↑
      </button>
      <button
        className="block-insert-down-btn block-btn"
        onClick={() => onInsert(1)}
      >
        +↓
      </button>

      {/* Delete cell button */}
      <button
        className="block-delete-btn block-btn"
        onClick={() =>
          deletable === false || deletable === undefined ? onDelete() : null
        }
        disabled={deletable !== true && deletable !== undefined}
      >
        <BiTrash />
      </button>
    </div>
  );
});

export default class Block extends React.Component {
  constructor(props) {
    super(props);
    // Cell & metadata structures for reference
    // NOTE: These aren't updated dynamically here, see .getCellData()
    this.cell = props.cell;
    this.metadata = this.cell.metadata;

    // Interaction with the kernel
    this.kernelMessenger = props.kernelMessenger;

    // Code cell ref so that we can grab cell changes from it (see below)
    this.sourceRef = createRef(null);

    // Callbacks
    this.outputCallback = this.addOutput.bind(this);
    this.sourceVCallback = () => this.toggleVisibility('sourceShown', 2);
    this.outputVCallback = () => this.toggleVisibility('outputShown', 3);

    // Abstracted Cell properties
    this.showMarkdown =
      this.cell.source.length > 0 && this.cell.cell_type === 'markdown'
        ? true
        : false;

    this.state = {
      outputs: this.cell.outputs, // Cell
      highlighted: props.highlighted,
      sourceShown:
        this.metadata.jupyter && this.metadata.jupyter.source_hidden ? 0 : 1,
      outputShown: (() => {
        if (
          (this.metadata.jupyter && this.metadata.jupyter.outputs_hidden) ||
          this.metadata.collapsed
        ) {
          return 0; // Hidden
        } else if (this.metadata.scrolled) {
          return 2; // Scroll
        }
        return 1; // Show
      })(),
    };
  }

  // Check if component should render
  // Used instead of PureComponent to allow us to update the state from props without a re-render
  shouldComponentUpdate(nextProps, nextState) {
    // Update highlight if props change
    let updatedHL = nextProps.highlighted !== nextState.highlighted;
    if (updatedHL) {
      nextState.highlighted = nextProps.highlighted;
    }

    return (
      updatedHL ||
      nextState.outputs !== this.state.outputs ||
      nextState.sourceShown !== this.state.sourceShown ||
      nextState.outputShown !== this.state.outputShown
    );
  }

  addOutput(output, clear = false) {
    this.setState((state) => {
      let tmpOutputs = [];
      if (!clear) tmpOutputs = [...state.outputs];
      if (Boolean(output)) tmpOutputs.push(output);
      return {
        outputs: tmpOutputs,
      };
    });
  }

  getCellData() {
    // Restructure the cell data
    const sourceCellData = this.sourceRef.current.getCellData();

    return {
      ...this.props.cell,
      ...sourceCellData,
      metadata: {
        jupyter: {
          source_hidden: !Boolean(this.state.sourceShown),
          outputs_hidden: !Boolean(this.state.outputShown),
        },
      },
      outputs: this.state.outputs,
    };
  }

  toggleVisibility(type, mod) {
    let newState = {};
    newState[type] = (this.state[type] + 1) % mod;
    this.setState(newState);
  }

  render() {
    const { source, cell_type, execution_count } = this.cell;
    const { deletable, editable } = this.metadata;

    return (
      <React.Fragment>
        {/* Display text box */}
        <div className="block-source">
          <ToggleVisibilityBar
            highlighted={this.state.highlighted}
            onClick={this.sourceVCallback}
          />
          <Source
            ref={this.sourceRef}
            source={source}
            editable={editable}
            cellType={cell_type}
            shown={this.state.sourceShown}
            showMarkdown={this.showMarkdown}
            executionCount={execution_count}
            kernelMessenger={this.kernelMessenger}
            updateOutputs={(o, c) => this.addOutput(o, c)}
          />
        </div>

        {/* Display output */}
        {this.state.cellType !== 'markdown' && (
          <div className="block-output">
            <ToggleVisibilityBar
              highlighted={this.state.highlighted}
              onClick={this.outputVCallback}
            />
            <BlockOutput
              outputs={this.state.outputs}
              shown={this.state.outputShown}
            />
          </div>
        )}

        {/* Controls bar */}
        {this.state.highlighted && (
          <BlockControls
            deletable={deletable}
            onMove={this.props.moveCell}
            onDelete={this.props.deleteCell}
            onInsert={this.props.insertCell}
          />
        )}
      </React.Fragment>
    );
  }
}
