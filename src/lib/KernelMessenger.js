import { useState, useEffect } from 'react';
import { runAll } from './Helpers';

class KernelMessenger {
  // Promise which resolves when connected
  #ready = null;
  // null = hasn't initially connected yet, false/true = connected state
  #connected = null;
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
  set onReady(callback) {
    this.addCallbacks('_onReady', callback);
  }

  // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
  // Functions here MUST be implemented
  // Functions that are defined as arrow functions
  // MUST BE made arrow functions in the children
  // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
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
// May be used in the future to add ready hooks
function useKernelMessenger(MssngObj) {
  const buildMessenger = (c) => new c();
  const [messenger, setInst] = useState(buildMessenger(MssngObj));
  const updateMessenger = (NewMssngObj) => {
    setInst(buildMessenger(NewMssngObj));
  };
  return [messenger, updateMessenger];
}

function useKernelReady(messenger) {
  // A hook for the kernel messenger status
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Subscribe to object's ready status
    const handleStatusChange = (res) => setReady(res);
    messenger.onReady = handleStatusChange;
    // Catch events where the kernel is ready before we could even catch it...
    setReady(messenger.connected);
    return () => setReady(false);
  }, [messenger]);

  return ready;
}

export { KernelMessenger as default, useKernelMessenger, useKernelReady };
