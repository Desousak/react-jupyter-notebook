import { KernelMessenger } from './lib/JupyterViewer';

function delay(time) {
  return new Promise((res, rej) => setTimeout(res, time));
}

export default class ExampleMessenger extends KernelMessenger {
  timeout = null;

  connectToKernel() {
    return delay(2000).then(() => true);
  }

  get kernelInfo() {
    return Promise.resolve({
      implementation: 'Example',
      implementation_version: 'N/A',
      language_info: {
        codemirror_mode: {
          name: 'N/A',
          version: -1,
        },
        file_extension: 'N/A',
        mimetype: 'N/A',
        name: 'N/A',
        nbconvert_exporter: 'N/A',
        pygments_lexer: 'N/A',
        version: '1.0',
      },
      protocol_version: 'N/A',
      status: 'ok',
      banner: 'Example Messenger: An example of the messaging framework.',
      help_links: [],
    });
  }

  runCode(code, callbackFunc) {
    return new Promise((res, rej) => {
      if (!this.connected) {
        rej('Kernel Execute Error: Not ready!');
      }
      const sendResponse = () => {
        // Signal our "kernel" is busy
        callbackFunc({
          header: { msg_type: 'status' },
          content: { execution_state: 'busy' },
        });
        // Send the execution counter
        callbackFunc({
          header: { msg_type: 'execute_input' },
          content: { execution_count: '?' },
        });

        const msDelay = 2000;
        return delay(msDelay).then((_) => {
          // Stream results
          callbackFunc({
            header: { msg_type: 'error' },
            content: {
              output_type: 'error',
              traceback: ['Code entered was:\n'],
            },
          });
          callbackFunc({
            header: { msg_type: 'stream' },
            content: {
              name: 'stdout',
              output_type: 'stream',
              text: code,
            },
          });
          // Signal our "kernel" is idle
          callbackFunc({
            header: { msg_type: 'status' },
            content: { execution_state: 'idle' },
          });
          res();
        });
      };
      if (this.timeout !== null) {
        this.timeout.then(sendResponse);
      } else {
        this.timeout = Promise.resolve().then((_) => sendResponse());
      }
    });
  }

  signalKernel(signal) {
    // Return whether the execution worked or not
    return Promise.reject('Kernel Signal Error: Not available');
  }
}
