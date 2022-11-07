import { useState, useEffect } from 'react';
import { runAll } from './Helpers';

class KernelMessenger {
  // Promise which resolves when connected
  #ready = null;
  // null = hasn't initially connected yet, false/true = connected state
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
    this.onReady = options.onReady;

    // Init connection
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
  updConnState(bool) {
    this.#connected = bool;
    // Call the callback with this instance
    runAll(this._onReady, bool);
  }
  connect() {
    // Connects to the kernel and ensures callbacks are made
    this.#ready = this.connectToKernel();
  }

  // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
  // Functions here can optionally be implemented
  // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
  get ready() {
    return this.#ready;
  }
  get connected() {
    // Returns true if connected, false otherwise
    return this.#connected;
  }
  set connected(bool) {
    // Allows manually updating connected status if needed
    this.#connected = bool;
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
  deconstructor() {
    // Will be run when the class is about to be removed
    // Can be used to disconnect from servers gracefully
    // Returns a promise, which will resolve when ready to be removed
    return Promise.resolve();
  }

  // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
  // Functions here MUST be implemented
  // Functions that are defined as arrow functions
  // MUST BE made arrow functions in the children
  // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
  connectToKernel() {
    // this.updConnState(bool) is a callback that should be run on a connection change
    // (connect = true, disconnect = false, connecting = null)
    // Can be re-run multiple times for when states change
    this.updConnState(true);
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
// May be used in the future to add callbacks
function useKernelMessenger(MssngObj) {
  const buildMessenger = (c) => {
    return new c();
  };

  const [messenger, setInst] = useState(buildMessenger(MssngObj));

  const updateMessenger = (NewMssngObj) => {
    setInst(buildMessenger(NewMssngObj));
  };

  return [messenger, updateMessenger];
}

function useKernelReady(messenger) {
  // A hook for the kernel messenger status
  const [ready, setReady] = useState(messenger.connected);

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
