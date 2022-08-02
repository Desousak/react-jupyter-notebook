import io from 'socket.io-client';

export default (function () {
  class KernelMessaging {
    constructor(kernelUrl) {
      // URL to connect to the kernel backend
      this.kernelUrl = this.sanitizeUrl(kernelUrl);
      this.socket = null;
      this.runningQueue = [];
      this.connectToKernel();
    }

    sanitizeUrl(url) {
      try {
        // Prep the socket connection
        if (!Boolean(url)) {
          throw new TypeError('URL cannot be empty');
        }
        let finalUrl = '';
        if (!url.includes('http://')) {
          finalUrl = 'http://' + url;
        }
        return new URL(finalUrl);
      } catch (err) {
        // TODO: HANDLE ERROR BETTER!
        this.kernelUrl = new URL('https://google.ca');
        console.error(err);
      }
    }

    connectToKernel() {
      if (this.kernelUrl !== null) {
        const { host, pathname } = this.kernelUrl;
        const newSocket = io(host, { path: pathname });

        // Broadcast that we're connected
        newSocket.on('connect', (e) => {
          // Get a kernel
          newSocket.emit('connected');
          newSocket.on('post-connect', (_) => {
            console.log('CONNECT DONE!');
            // Kernel obtained - store the socket!
            this.socket = newSocket;
            this.prepHandlers();
          });
        });
      }
    }

    disconnectFromKernel() {
      console.log('Disconnected from kernel...');
    }

    prepHandlers() {
      // If we disconnect, that means we lost the kernel
      this.socket.on('disconnect', (e) => this.disconnectFromKernel(e));

      // Code execution handler
      this.socket.on('execution-results', (msg) => this.kernelResponse(msg));

      // If code execution ends, turn off the handler
      this.socket.on('execution-end', (_) => {
        console.log('Finished code execution!');
      });
    }

    kernelResponse(msg) {
      const parsedMsg = JSON.parse(msg),
        callback = this.runningQueue.at(-1);
      // Remove the current cell from the queue
      if (
        parsedMsg.msgType === 'status' &&
        parsedMsg.content.execution_state === 'idle'
      )
        this.runningQueue.shift();
      callback({ ...parsedMsg });
    }

    runCode(code, callbackFunc) {
      // TODO: ADD RUNNING INFORMATION, CELL NUMBERING, AND RESPONSE FROM BACKEND
      console.log('Sending request to', this.kernelUrl.href);

      if (this.socket !== null) {
        // Send the code request
        this.socket.emit('run_req', { content: code });
        // Add the cell to the running queue
        this.runningQueue.push(callbackFunc);
      } else {
        alert('Not connected to a kernel...');
      }
    }
  }
  var instance;
  return {
    getInstance: function (...args) {
      if (instance == null) {
        instance = new KernelMessaging(...args);
        // Hide the constructor so the returned object can't be new'd...
        instance.constructor = null;
      }
      return instance;
    },
  };
})();
