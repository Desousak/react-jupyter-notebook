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
  - Features support for Pyolite - allowing for execution of Python code through JS (see [notes](#pyolite)).
- `(SOON!)` Can change the alignment of the media outputs.
- `(SOON!)` Customisable code block styling.

## Usage

```javascript
// If you want code execution capabilities - you must provide your own connection code
// For example:
import { KernelMessenger } from 'react-jupyter-notebook';

class ExampleMessenger extends KernelMessenger {
  get ready() {
    // Returns a promise which resolves when the kernel loads in initially
    return Promise.resolve();
  }

  get kernelInfo() {
    // Return a promise containing info about the kernel
    return Promise.resolve({
      status: 'ok',
      protocol_version: 'X.Y.Z',
      implementation: '',
      implementation_version: 'X.Y.Z',
      language_info: {
        name: '',
        version: 'X.Y.Z',
        mimetype: '',
        file_extension: '',
        pygments_lexer: '',
        codemirror_mode: '',
        nbconvert_exporter: '',
      },
      banner: '',
      debugger: false,
      help_links: [{ text: '', url: '' }],
    });
  }

  get connected() {
    // Returns true if connected, false otherwise
    return false;
  }

  set connected(bool) {
    // Allows manually updating connected status if needed
    this.#connected = bool;
  }

  connectToKernel() {
    // this.updConnState(bool) is a callback that should be run on a connection change
    // (connect = true, disconnect = false, connecting = null)
    // Can be re-run multiple times for when states change
    this.updConnState(null);
  }

  runCode(code, callbackFunc) {
    // Run the code
    // Returns a promise which resolves once execution is completed
    return new Promise();
  }

  signalKernel(signal) {
    // Returns a promise which resolves if signalling was successful
    return new Promise();
  }
}
```

```javascript
import JupyterViewer, {
  useKernelMessenger,
  useKernelReady,
} from 'react-jupyter-notebook';

// If you want to update the kernel dynamically a provided hook can be used
const [messenger, changeMessenger] = useKernelMessenger(ExampleMessenger);
// A hook also exists for the kernel's state (whether it's ready, loading, or disconnected)
const kernelReady = useKernelReady(kernelMessenger);

function component() {
  return <JupyterViewer rawIpynb={rawIpynb} messenger={messenger} />;
}
```

```javascript
import React from 'react';
import ReactDOM from 'react-dom';
import JupyterViewer from 'react-jupyter-notebook';
import nb_test from './nb_test.json'; // You need to read the .ipynb file into a JSON Object.
import ExampleMessenger from './ExampleMessenger'; // Replace with your own messenger class

ReactDOM.render(
  <React.StrictMode>
    <JupyterViewer rawIpynb={nb_test} messenger={new ExampleMessenger()} />
  </React.StrictMode>,
  document.getElementById('root')
);
```

## Props

| Prop name       | Type     | Description                                                           | (_default_) Values                          |
| --------------- | -------- | --------------------------------------------------------------------- | ------------------------------------------- |
| rawIpynb        | Object   | The JSON object converted from the .ipynb file.                       | `{ cells: [] }`                             |
| KernelMessenger | Function | The class responsible for handling interactions with a Jupyter kernel | [KernelMessenger](src/lib/JupyterViewer.js) |

## Todo

- [ &nbsp; ] Customizable code block styling
- [ &nbsp; ] Reimplement customizable styles
- [ &nbsp; ] Customizable output cutoff thresholds
- [ &nbsp; ] Support for more ascii values in output (other than `\b` and `\r`)
- [ &nbsp; ] Make rapid execution output updates faster (through memoization?)
- [ &nbsp; ] Fix vertical scaling of code cells & output (add mobile support?)
- [✓] Refactor such that prop-drilling isn't needed to pass along the [KernelMessenger](src/lib/JupyterViewer.js)
- [✓] Add a default kernel messenger that interacts with Python via WASM (with <a href="https://github.com/jupyterlite/jupyterlite">JupyterLite</a>)

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

### Pyolite:

- The current implementation of the Pyolite kernel has four parts:
  1. [pubic/pyodide.js](pubic/pyodide.js): [Pyodide](https://pyodide.org/en/stable/) is a Python distribution for the browser and Node.js based on WebAssembly. It is used to run the Jupyter Kernel.
  2. [src/Pyolite-Kernel/](src/pyolite-kernel/): A copy of the Kernel class made by [@joyceerhl](https://github.com/joyceerhl/vscode-pyolite).
  3. [src/ExampleMessenger.js](src/ExampleMessenger.js): A class that interfaces with the Pyolite Kernel and forwards code & results to the library.
  4. [public/Wheels/](public/wheels/): The pure-python wheels that are loaded into Pyodide. Provided from the [JupyterLite Project](https://github.com/jupyterlite/jupyterlite).
