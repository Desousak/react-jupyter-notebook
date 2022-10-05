# react-jupyter-notebook

A fork of <a href="https://github.com/Joeyonng/react-jupyter-notebook">react-jupyter-notebook</a> that allows for the rendering and execution of Jupyter notebook files (`.ipynb`).

Demo: <a href="https://desousak.github.io/react-jupyter-notebook">desousak.github.io/react-jupyter-notebook</a>

## Install

```bash
npm install --save https://github.com/Desousak/react-jupyter-notebook.git
```

## Features

- Nearly identical looking to original JupyterLab interface.
- Can render codes, images, outputs, and markdown (with table & equation support).
- Enable resizing the height of the scrolled output.
- Execution of code with user-defined messaging.
- `(SOON!)` Can change the alignment of the media outputs.
- `(SOON!)` Customisable code block styling.

## Usage

```javascript
// If you want code execution capabilities - you must provide your own connection code
// For example:
import { DefaultKernelMessenger } from 'react-jupyter-notebook';

class ExampleMessenger extends DefaultKernelMessenger {
  constructor() {
    // Init connection here
    // Constructor is not passed any parameters
  }

  runCode(code, callbackFunc) {
    // Run the code
    // Returns true if successful and adds the cell to the execution queue (via callbackFunc), false otherwise
    return false;
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
```

```javascript
import React from 'react';
import ReactDOM from 'react-dom';
import { JupyterViewer } from 'react-jupyter-notebook';
import nb_test from './nb_test.json'; // You need to read the .ipynb file into a JSON Object.
import ExampleMessenger from './ExampleMessenger'; // Replace with your own messenger class

// Remove "ExampleMessenger" if not using execution
ReactDOM.render(
  <React.StrictMode>
    <JupyterViewer rawIpynb={nb_test} MessengerObj={ExampleMessenger} />
  </React.StrictMode>,
  document.getElementById('root')
);
```

## Props

| Prop name       | Type     | Description                                                           | (_default_) Values                            |
| --------------- | -------- | --------------------------------------------------------------------- | --------------------------------------------- |
| rawIpynb        | Object   | The JSON object converted from the .ipynb file.                       | `{ cells: [] }`                               |
| KernelMessenger | Function | The class responsible for handling interactions with a Jupyter kernel | [KernelMessenger](src/lib/JupyterViewer.js) |

## Todo

- [ &nbsp; ] Customizable code block styling
- [ &nbsp; ] Reimplement customizable styles
- [ &nbsp; ] Customizable output cutoff thresholds
- [ &nbsp; ] Status bar for switching kernels, signalling the kernel, etc.
- [ &nbsp; ] Support for more ascii values in output (other than `\b` and `\r`)
- [ &nbsp; ] Make rapid execution output updates faster (through memoization?)
- [ &nbsp; ] Fix vertical scaling of code cells & output (add mobile support?)
- [ &nbsp; ] Refactor such that prop-drilling isn't needed to pass along the [KernelMessenger](src/lib/JupyterViewer.js)
- [ &nbsp; ] Add a default kernel messenger that interacts with Python via WASM (with <a href="https://github.com/jupyterlite/jupyterlite">JupyterLite</a>?)

## Notes

### `codeStatus` Reference:

- Within [Source.js](src/lib/Source.js) an integer variable titled `codeStatus` is used to keep track of the state of the code's execution within the kernel.
- See below for an explanation of what the variable can be:
  | Value | Description  
  |--------|------------------------------------------------------------------------------|
  | -2 | An error occurred during last execution |  
  | -1 | Code has **_never_** been sent (first load of cell) |  
  | 0 | Code hasn't been sent to the kernel |  
  | 1 | Code is sent but not running yet |  
  | 2 | Code is sent and currently running |
