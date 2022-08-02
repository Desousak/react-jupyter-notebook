import React from 'react';
import PropTypes from 'prop-types';
import './JupyterViewer.scss';

import Block from './Block';
import KernelMessaging from './KernelMessaging';

class JupyterViewer extends React.Component {
  constructor(props) {
    super(props);
    const { rawIpynb, kernelUrl } = props;
    const processedIpynb = this.loadCells(rawIpynb);
    this.state = {
      clickCellIndex: -1,
      cells: processedIpynb,
    };
    this.prepKernel(kernelUrl);
  }

  componentDidUpdate(prevProps, prevState) {
    // Update if a new ipynb is loaded
    if (prevProps.rawIpynb !== this.props.rawIpynb) {
      const newCells = this.loadCells(this.props.rawIpynb);
      this.setState({ newCells });
    }
  }

  loadCells(ipynb) {
    return ipynb.cells.map((cell) => {
      if (cell && cell.metadata) {
        // If name is invalid - regen
        const cellName = cell.metadata.name;
        if (cellName === undefined || cellName.length > 0) {
          cell.metadata.name = Math.random(100).toString(36).slice(2);
        }
      }
      return cell;
    });
  }

  // Init kernel backend
  prepKernel(kernelUrl) {
    // Getting the first instance will initialize
    KernelMessaging.getInstance(kernelUrl);
  }

  offsetHighlight(d) {
    const clickCellIndex = this.state.clickCellIndex + d;
    if (clickCellIndex >= 0 && clickCellIndex < this.state.cells.length)
      this.setState({
        clickCellIndex,
      });
  }

  // Cell functions
  getCellIndex(name) {
    return this.state.cells.findIndex((c) => c.metadata.name === name);
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
      newCell = this.genCellName(newCell);

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
                  highlighted={this.state.clickCellIndex === index}
                  moveCell={(d) =>
                    this.moveCell(this.getCellIndex(cell.metadata.name), d)
                  }
                  deleteCell={() =>
                    this.deleteCell(this.getCellIndex(cell.metadata.name))
                  }
                  insertCell={(d) =>
                    this.addCell(
                      this.getCellIndex(cell.metadata.name) + d,
                      'code'
                    )
                  }
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

JupyterViewer.defaultProps = {
  showLineNumbers: true,
  mediaAlign: 'center',
  codeBlockStyles: undefined,
  rawIpynb: { cells: [] },
};

JupyterViewer.propTypes = {
  kernelUrl: PropTypes.string.isRequired,
  rawIpynb: PropTypes.object,
  showLineNumbers: PropTypes.bool,
  mediaAlign: PropTypes.oneOf(['left', 'center', 'right']),
  // codeBlockStyles: PropTypes.shape({
  //   hljsStyle: PropTypes.oneOf(Object.keys(hljsStyles)),
  //   lineNumberContainerStyle: PropTypes.object,
  //   lineNumberStyle: PropTypes.object,
  //   codeContainerStyle: PropTypes.object,
  // }),
};

export default JupyterViewer;
