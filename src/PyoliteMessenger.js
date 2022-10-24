import { KernelMessenger } from './lib/JupyterViewer';
import { PyoliteKernel } from './pyolite-kernel/pyoliteKernel.ts';

export default class PyoliteMessenger extends KernelMessenger {
  #kernelReady = false;
  #runQueue = [];
  #kernel = null;

  constructor() {
    super();
    this.#prepKernel();
  }

  #prepKernel() {
    this.#kernel = new PyoliteKernel({
      id: 'pyolite-kernel',
      name: 'Pyolite',
      sendMessage: (d) => this.#kernelResponse(d),
    });
    this.#kernel.ready.then((_) => {
      this.#kernelReady = true;
    });
  }

  #kernelResponse(res) {
    this.#runQueue[0].callback(res);
  }

  #execute(code) {
    const res = this.#kernel.handleMessage({
      header: {
        msg_type: 'execute_request',
        session: '',
      },
      content: {
        code: code.join(''),
      },
    });
    res.then(() => {
      // Remove finished cell's callback & run the next code
      this.#runQueue[0].resolve();
      this.#runQueue.shift();
      if (this.#runQueue.length > 0) this.#execute(this.#runQueue[0].code);
    });
  }

  get kernelInfo() {
    return this.#kernel.kernelInfoRequest();
  }

  get ready() {
    return this.#kernel.ready;
  }

  get connected() {
    return this.#kernelReady === true;
  }

  runCode(code, callback) {
    console.log("RUNNING CODE!");
    const promise = new Promise((resolve, reject) => {
      if (this.connected) {
        this.#runQueue.push({ code, callback, resolve, reject });
        if (this.#runQueue.length === 1) {
          // First in queue - run your code
          this.#execute(code);
        }
      } else {
        reject("Kernel Execute Error: Not connected");
      }
    });
    return promise;
  }

  signalKernel(signal) {
    // Return whether the execution worked or not
    return Promise.reject("Kernel Signal Error: Not available");
  }
}
