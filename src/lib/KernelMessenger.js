import { useEffect, useState } from 'react';

class KernelMessenger {
  #ready = null;
  // Whether the kernel is connected
  #connected = false;
  // Callback for when the kernel is ready, #connected is passed in as an arg
  static readyCallback = null;

  constructor() {
    // Init connection here
    // Constructor should *always be* called (via super())
    // Ensure connect() accepts no parameters or has a default
    this.connect();
  }
  get ready() {
    return this.#ready;
  }
  get connected() {
    return this.#connected;
  }
  connect(...args) {
    // Connects to the kernel and ensures callbacks are made
    this.#ready = this.connectToKernel(...args).then((bool) => {
      this.#connected = bool;
      // Call the callback with this instance
      const readyCallback = this.constructor.readyCallback;
      if (readyCallback) readyCallback(bool);
    });
  }

  // %%%%%%%%%%%%%%%%%%%%%%
  // Functions here MUST be implemented
  // Functions that are defined as arrow functions MUST BE made arrow functions in the children
  // %%%%%%%%%%%%%%%%%%%%%%
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

function useKernelState(MessengerObj) {
  const [messengerInst, setInst] = useState(null);
  const [messengerReady, setReady] = useState(false);

  useEffect(() => {
    function handleStatusChange(res) {
      setReady(res);
    }
    // Subscribe to status
    MessengerObj.readyCallback = handleStatusChange;
    setInst(new MessengerObj());

    return () => {
      MessengerObj.readyCallback = null;
      setReady(false);
    };
  }, [MessengerObj]);

  return [messengerInst, messengerReady];
}

export { KernelMessenger as default, useKernelState };
