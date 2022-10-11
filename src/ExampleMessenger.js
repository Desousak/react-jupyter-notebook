import { DefaultKernelMessenger } from './lib/JupyterViewer';
import { PyoliteKernel } from './pyolite-kernel/pyoliteKernel.ts';

export default class ExampleMessenger extends DefaultKernelMessenger {
  constructor() {
    super();
    this.timeout = null;
    this.kernel = null;
    this.runQueue = [];

    const kernel = new PyoliteKernel({
      id: 'pyolite-kernel',
      name: 'Pyolite',
      sendMessage: (d) => this.#kernelResponse(d),
    });
    kernel.ready.then((_) => {
      this.kernel = kernel;
    });
  }

  #kernelResponse(res) {
    this.runQueue[0].callback(res);
  }

  #execute(code) {
    const res = this.kernel.handleMessage({
      header: {
        msg_type: "execute_request",
        session: "",
      },
      content: {
        code: code.join(''),
      }
    });
    res.then((d) => {
      // Remove finished cell's callback & run the next code
      this.runQueue.shift();
      if (this.runQueue.length > 0) this.#execute(this.runQueue[0].code);
    });
  }

  runCode(code, callback) {
    if (this.connected()) {
      this.runQueue.push({ code, callback });
      if (this.runQueue.length === 1) {
        // First in queue - run your code
        this.#execute(code);
      }
    }
  }

  signalKernel(signal) {
    // Return whether the execution worked or not
    return false;
  }

  connected() {
    return this.kernel !== null;
  }
}
