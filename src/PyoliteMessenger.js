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
    res.then((d) => {
      // Remove finished cell's callback & run the next code
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
    if (this.connected) {
      this.#runQueue.push({ code, callback });
      if (this.#runQueue.length === 1) {
        // First in queue - run your code
        this.#execute(code);
      }
      return true;
    }
    return false;
  }

  signalKernel(signal) {
    // Return whether the execution worked or not
    return false;
  }
}
