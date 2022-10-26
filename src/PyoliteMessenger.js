import { KernelMessenger } from './lib/JupyterViewer';
import { PyoliteKernel } from './pyolite-kernel/pyoliteKernel.ts';

export default class PyoliteMessenger extends KernelMessenger {
  // kernel = null;
  #runQueue = [];

  get kernelInfo() {
    return this.kernel.kernelInfoRequest();
  }

  get connected() {
    // Ensure we have the kernel variable
    return super.connected && this.kernel;
  }

  connectToKernel() {
    this.kernel = new PyoliteKernel({
      id: 'pyolite-kernel',
      name: 'Pyolite',
      sendMessage: (d) => this.kernelResponse(d),
    });
    return this.kernel.ready.then(() => true);
  }

  runCode(code, callback) {
    const promise = new Promise((resolve, reject) => {
      if (!this.connected) {
        reject('Kernel Execute Error: Not connected');
      } else {
        this.#runQueue.push({ code, callback, resolve, reject });
        if (this.#runQueue.length === 1) {
          // First in queue - run your code
          this.#execute(code);
        }
      }
    });
    return promise;
  }

  signalKernel(signal) {
    // Return whether the execution worked or not
    return Promise.reject('Kernel Signal Error: Not available');
  }

  kernelResponse(res) {
    this.#runQueue[0].callback(res);
  }

  #execute(code) {
    const res = this.kernel.handleMessage({
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
}
