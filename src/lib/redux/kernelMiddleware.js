const kernelMiddleware = (store) => {
    // Store the kernel messenger here
    let messenger = null;
    return (next) => (action) => {
      if (action.type === 'cells/setKernelMessenger') {
        messenger = new action.payload();
      } else {
        return next(action);
      }
    };
  };
  

export default kernelMiddleware;