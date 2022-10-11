import React from 'react';
import PropTypes from 'prop-types';
import './scss/JupyterViewer.scss';

import Block from './Block';

// TODO: CREATE A STATUS BAR THAT ALLOWS FOR KERNEL STATUS, SWITCHING, AND SIGNALLING
class JupyterViewer extends React.Component {
  constructor(props) {
    super(props);
    const { rawIpynb, MessengerObj } = props;
    const processedIpynb = this.loadCells(rawIpynb);
    this.state = {
      clickCellIndex: -1,
      cells: processedIpynb,
    };
    // TODO: LOOK TOWARDS A BETTER WAY OF SHARING THE MESSENGER OTHER THAN PROP-DRILLING
    this.kernelMessenger = new MessengerObj();

    // Prep callbacks to prevent re-renders
    this.moveCellCallback = (d) => this.moveCell(this.state.clickCellIndex, d);
    this.deleteCellCallback = (d) =>
      this.deleteCell(this.state.clickCellIndex, d);
    this.insertCellCallback = (d) =>
      this.addCell(this.state.clickCellIndex + d, 'code');
  }

  componentDidUpdate(prevProps, prevState) {
    // Update if a new ipynb is loaded
    if (prevProps.rawIpynb !== this.props.rawIpynb) {
      const newCells = this.loadCells(this.props.rawIpynb);
      this.setState({ cells: newCells });
    }
  }

  // Cell functions
  loadCells(ipynb) {
    return ipynb.cells.map((cell) => {
      if (cell && cell.metadata) {
        // If name is invalid - regen
        const cellName = cell.metadata.name;
        if (cellName === undefined || cellName.length > 0) {
          cell.metadata.name = this.genCellName();
        }
      }
      return cell;
    });
  }

  genCellName() {
    return Math.random(100).toString(36).slice(2);
  }

  addCell(index = this.state.cells.length, type = 'code') {
    if (
      index !== undefined &&
      index > -1 &&
      index < this.state.cells.length + 1
    ) {
      let newCell = {};
      switch (type) {
        default:
        case 'code':
          newCell = {
            cell_type: type,
            execution_count: null,
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
      // Add a cell name
      newCell.metadata.name = this.genCellName();

      // Insert cell into cell array
      let newCells = [...this.state.cells];
      newCells.splice(index, 0, newCell);
      this.setState({ cells: newCells, clickCellIndex: index });
    }
  }

  deleteCell(index = -1) {
    if (index >= 0 && index < this.state.cells.length) {
      const { cells } = this.state;
      const newCells = cells.filter((c, i) => i !== index);
      this.setState({ cells: newCells });
    }
  }

  moveCell(index = -1, direction) {
    // Swaps two cells and highlights the moved cell
    const newIndex = index !== -1 ? index + direction : -1;

    if (newIndex >= 0 && newIndex < this.state.cells.length) {
      let newCells = [...this.state.cells];
      let tmpCell = newCells[index];

      newCells[index] = newCells[newIndex];
      newCells[newIndex] = tmpCell;
      this.setState({ cells: newCells, clickCellIndex: newIndex });
    }
  }

  render() {
    return (
      <div className="jupyter-viewer">
        {this.state.cells.map((cell, index) => {
          return (
            <div
              key={cell.metadata.name}
              className="block"
              onMouseDown={() =>
                this.state.clickCellIndex !== index
                  ? this.setState({ clickCellIndex: index })
                  : null
              }
            >
              {!('cell_type' in cell) ? null : (
                <Block
                  cell={cell}
                  moveCell={this.moveCellCallback}
                  deleteCell={this.deleteCellCallback}
                  insertCell={this.insertCellCallback}
                  kernelMessenger={this.kernelMessenger}
                  highlighted={this.state.clickCellIndex === index}
                />
              )}
            </div>
          );
        })}
        <div className="add-buttons">
          <button
            className="add-code-btn"
            onClick={(_) => this.addCell(undefined, 'code')}
          >
            + Code
          </button>
          <button
            className="add-markdown-btn"
            onClick={(_) => this.addCell(undefined, 'markdown')}
          >
            + Markdown
          </button>
        </div>
      </div>
    );
  }
}

class DefaultKernelMessenger {
  // eslint-disable-next-line no-useless-constructor
  constructor() {
    // Init connection here
    // Constructor is not passed any parameters, set them here instead
  }

  // %%%%%%%%%%%%%%%%%%%%%%
  // Code-Cell Interactions
  // Functions here MUST be implemented
  // %%%%%%%%%%%%%%%%%%%%%%
  runCode(code, callback) {
    // Run the code
  }

  signalKernel(signal) {
    // Returns true if successful, false otherwise
    return false;
  }

  connected() {
    // Returns true if connected, false otherwise
    return false;
  }
}

JupyterViewer.defaultProps = {
  rawIpynb: { cells: [] },
  MessengerObj: DefaultKernelMessenger,
};

JupyterViewer.propTypes = {
  rawIpynb: PropTypes.object,
  MessengerObj: PropTypes.func,
};

export { JupyterViewer, DefaultKernelMessenger };
