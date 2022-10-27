import { useState } from 'react';
import { runAll } from './Helpers';

class KernelMessenger {
  // Promise which resolves when connected
  #ready = null;
  // Boolean flag for the above
  #connected = false;
  // Callback for kernel reading up
  _onReady = [];

  constructor(
    options = {
      onMessage: [],
      onReady: [],
    }
  ) {
    // Prep callbacks
    this.onMessages = options.onMessage;
    this.onReady = options.onReady;

    // Init connection here
    // Constructor should *always be* called
    // Ensure connect() accepts no parameters or has a default
    this.connect();
  }
  addCallbacks(prop, callbacks) {
    if (this[prop]) {
      if (Array.isArray(callbacks)) {
        // If callbacks happens to be an array, replace
        this[prop] = callbacks;
      } else if (typeof callbacks === 'function') {
        // Otherwise append
        this[prop].push(callbacks);
      }
    }
  }
  connect(...args) {
    // Connects to the kernel and ensures callbacks are made
    this.#ready = this.connectToKernel(...args).then((bool) => {
      this.#connected = bool;
      // Call the callback with this instance
      // const onReady = this.constructor.onReady;
      // if (onReady) onReady(bool);
      runAll(this._onReady, bool);
    });
  }

  // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
  // Functions here can optionally be implemented
  // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
  get ready() {
    return this.#ready;
  }
  get connected() {
    return this.#connected;
  }
  set onReady(callback) {
    this.addCallbacks('_onReady', callback);
  }

  // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
  // Functions here MUST be implemented
  // Functions that are defined as arrow functions
  // MUST BE made arrow functions in the children
  // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
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
  connectToKernel(...args) {
    // Return a promise which resolves when the kernel loads in
    // The promise should resolve true/false for if the kernel is loaded
    // Will be called by .connect() and all arguments will be passed
    return new Promise((res, rej) => {
      // Resolve if successful
      res(true);
    });
  }
  runCode(code, callback) {
    // Run the code
    // Returns a promise which resolves once execution is completed
    return new Promise();
  }
  signalKernel(signal) {
    // Returns a promise which resolves if signalling was successful
    return new Promise();
  }
}

// A Hook which rebuilds KernelMessenger objects
function useKernelMessenger(MssngObj) {
  const buildMessenger = (c) => new c();
  const [messenger, setInst] = useState(buildMessenger(MssngObj));
  const updateMessenger = (NewMssngObj) => setInst(buildMessenger(NewMssngObj));
  // useEffect(() => {
  //   return () => {
  //     // Do cleanup
  //   };
  // }, [messenger]);
  return [messenger, updateMessenger];
}

export { KernelMessenger as default, useKernelMessenger };
