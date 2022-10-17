const kernelMiddleware = (store) => {
  // Store the kernel messenger here
  let messenger = null;
  return (next) => (action) => {
    if (action.type === 'kernel/setKernelMessenger') {
      messenger = new action.payload();
      console.log('STORED MESSENGER!', messenger);
    } else {
      return next(action);
    }
  };
};

export default kernelMiddleware;
