import { DefaultKernelMessenger } from './lib/JupyterViewer';

function delay(time) {
  return new Promise((res, rej) => setTimeout(res, time));
}

export default class ExampleMessenger extends DefaultKernelMessenger {
  constructor() {
    super();
    this.timeout = null;
  }

  runCode(code, callbackFunc) {
    const sendResponse = () => {
      // Signal our "kernel" is busy
      callbackFunc({
        msg_type: 'status',
        content: { execution_state: 'busy' },
      });
      // Send the execution counter
      callbackFunc({
        msg_type: 'execute_input',
        content: { execution_count: '?' },
      });

      const msDelay = 2000;
      return delay(msDelay).then((_) => {
        // Stream results
        callbackFunc({
          msg_type: 'error',
          content: {
            output_type: 'error',
            traceback: ['Code entered was:\n'],
          },
        });
        callbackFunc({
          msg_type: 'stream',
          content: {
            name: 'stdout',
            output_type: 'stream',
            text: code,
          },
        });
        // Signal our "kernel" is idle
        callbackFunc({
          msg_type: 'status',
          content: { execution_state: 'idle' },
        });
      });
    };

    if (this.timeout !== null) {
      this.timeout.then(sendResponse);
    } else {
      this.timeout = new Promise((res) => res()).then((_) => sendResponse());
    }

    // Signal that the code was sent
    return true;
  }

  signalKernel(signal) {
    // Return whether the execution worked or not
    return false;
  }

  connected() {
    return true;
  }
}
