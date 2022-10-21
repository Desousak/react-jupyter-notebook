export default class KernelMessenger {
  // eslint-disable-next-line no-useless-constructor
  constructor() {
    // Init connection here
    // Constructor is not passed any parameters, set them here instead
  }
  get ready() {
    // Returns a promise which resolves when the kernel loads in initially
    return Promise.resolve();
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

  get connected() {
    // Returns true if connected, false otherwise
    return false;
  }

  // %%%%%%%%%%%%%%%%%%%%%%
  // Code-Cell Interactions
  // Functions here MUST be implemented
  // %%%%%%%%%%%%%%%%%%%%%%
  runCode(code, callback) {
    // Run the code
    // Returns true if connection is made, false otherwise
    return false;
  }

  signalKernel(signal) {
    // Returns true if successful, false otherwise
    return false;
  }
}
