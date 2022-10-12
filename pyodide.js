var _pyodideUrl = 'https://cdn.jsdelivr.net/pyodide/v0.21.3/full/pyodide.js';
var _widgetsnbextensionWheelUrl =
  '/react-jupyter-notebook/wheels//widgetsnbextension-3.6.0-py3-none-any.whl';
var _ipykernelWheelUrl =
  '/react-jupyter-notebook/wheels/ipykernel-6.9.2-py3-none-any.whl';
var _pyoliteWheelUrl =
  '/react-jupyter-notebook/wheels/pyolite-0.1.0b13-py3-none-any.whl';

var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
/**
 * Store the kernel and interpreter instances.
 */
// eslint-disable-next-line
// @ts-ignore: breaks typedoc
let kernel;
// eslint-disable-next-line
// @ts-ignore: breaks typedoc
let interpreter;
// eslint-disable-next-line
// @ts-ignore: breaks typedoc
let pyodide;
// eslint-disable-next-line
// @ts-ignore: breaks typedoc
let stdout_stream;
// eslint-disable-next-line
// @ts-ignore: breaks typedoc
let stderr_stream;
// eslint-disable-next-line
// @ts-ignore: breaks typedoc
let resolveInputReply;
/**
 * Load Pyodided and initialize the interpreter.
 */
function loadPyodideAndPackages() {
  return __awaiter(this, void 0, void 0, function* () {
    // as of 0.17.0 indexURL must be provided
    pyodide = yield loadPyodide();
    yield pyodide.loadPackage(['micropip']);
    yield pyodide.loadPackage(['matplotlib']);
    yield pyodide.runPythonAsync(`
                                  import micropip
                                  await micropip.install([
                                    'traitlets',
                                    '${_widgetsnbextensionWheelUrl}',
                                    '${_ipykernelWheelUrl}'
                                  ])
                                  await micropip.install([
                                    '${_pyoliteWheelUrl}'
                                  ]);
                                  await micropip.install('ipython');
                                  import pyolite
                                `);
    // make copies of these so they don't get garbage collected
    kernel = pyodide.globals.get('pyolite').kernel_instance.copy();
    stdout_stream = pyodide.globals.get('pyolite').stdout_stream.copy();
    stderr_stream = pyodide.globals.get('pyolite').stderr_stream.copy();
    interpreter = kernel.interpreter.copy();
    interpreter.send_comm = sendComm;
    const version = pyodide.globals.get('pyolite').__version__;
    console.log('Pyolite kernel initialized, version', version);
    postMessage({ type: 'kernel_ready' });
  });
}
/**
 * Recursively convert a Map to a JavaScript object
 * @param The Map object to convert
 */
function mapToObject(obj) {
  const out = obj instanceof Array ? [] : {};
  obj.forEach((value, key) => {
    out[key] =
      value instanceof Map || value instanceof Array
        ? mapToObject(value)
        : value;
  });
  return out;
}
/**
 * Format the response from the Pyodide evaluation.
 *
 * @param res The result object from the Pyodide evaluation
 */
function formatResult(res) {
  if (!pyodide.isPyProxy(res)) {
    return res;
  }
  // TODO: this is a bit brittle
  const m = res.toJs();
  const results = mapToObject(m);
  return results;
}
// eslint-disable-next-line
// @ts-ignore: breaks typedoc
importScripts('https://cdn.jsdelivr.net/pyodide/v0.21.3/full/pyodide.js');
const pyodideReadyPromise = loadPyodideAndPackages();
/**
 * Send a comm message to the front-end.
 *
 * @param type The type of the comm message.
 * @param content The content.
 * @param metadata The metadata.
 * @param ident The ident.
 * @param buffers The binary buffers.
 */
function sendComm(type, content, metadata, ident, buffers) {
  return __awaiter(this, void 0, void 0, function* () {
    postMessage({
      type: type,
      content: formatResult(content),
      metadata: formatResult(metadata),
      ident: formatResult(ident),
      buffers: formatResult(buffers),
      parentHeader: formatResult(kernel._parent_header)['header'],
    });
  });
}
function getpass(prompt) {
  return __awaiter(this, void 0, void 0, function* () {
    prompt = typeof prompt === 'undefined' ? '' : prompt;
    yield sendInputRequest(prompt, true);
    const replyPromise = new Promise((resolve) => {
      resolveInputReply = resolve;
    });
    const result = yield replyPromise;
    return result['value'];
  });
}
function input(prompt) {
  return __awaiter(this, void 0, void 0, function* () {
    prompt = typeof prompt === 'undefined' ? '' : prompt;
    yield sendInputRequest(prompt, false);
    const replyPromise = new Promise((resolve) => {
      resolveInputReply = resolve;
    });
    const result = yield replyPromise;
    return result['value'];
  });
}
/**
 * Send a input request to the front-end.
 *
 * @param prompt the text to show at the prompt
 * @param password Is the request for a password?
 */
function sendInputRequest(prompt, password) {
  return __awaiter(this, void 0, void 0, function* () {
    const content = {
      prompt,
      password,
    };
    postMessage({
      type: 'input_request',
      parentHeader: formatResult(kernel._parent_header)['header'],
      content,
    });
  });
}
/**
 * Execute code with the interpreter.
 *
 * @param content The incoming message with the code to execute.
 */
function execute(content) {
  return __awaiter(this, void 0, void 0, function* () {
    const publishExecutionResult = (prompt_count, data, metadata) => {
      const bundle = {
        execution_count: prompt_count,
        data: formatResult(data),
        metadata: formatResult(metadata),
      };
      postMessage({
        parentHeader: formatResult(kernel._parent_header)['header'],
        bundle,
        type: 'execute_result',
      });
    };
    const publishExecutionError = (ename, evalue, traceback) => {
      const bundle = {
        ename: ename,
        evalue: evalue,
        traceback: traceback,
      };
      postMessage({
        parentHeader: formatResult(kernel._parent_header)['header'],
        bundle,
        type: 'execute_error',
      });
    };
    const clearOutputCallback = (wait) => {
      const bundle = {
        wait: formatResult(wait),
      };
      postMessage({
        parentHeader: formatResult(kernel._parent_header)['header'],
        bundle,
        type: 'clear_output',
      });
    };
    const displayDataCallback = (data, metadata, transient) => {
      const bundle = {
        data: formatResult(data),
        metadata: formatResult(metadata),
        transient: formatResult(transient),
      };
      postMessage({
        parentHeader: formatResult(kernel._parent_header)['header'],
        bundle,
        type: 'display_data',
      });
    };
    const updateDisplayDataCallback = (data, metadata, transient) => {
      const bundle = {
        data: formatResult(data),
        metadata: formatResult(metadata),
        transient: formatResult(transient),
      };
      postMessage({
        parentHeader: formatResult(kernel._parent_header)['header'],
        bundle,
        type: 'update_display_data',
      });
    };
    const publishStreamCallback = (name, text) => {
      const bundle = {
        name: formatResult(name),
        text: formatResult(text),
      };
      postMessage({
        parentHeader: formatResult(kernel._parent_header)['header'],
        bundle,
        type: 'stream',
      });
    };
    stdout_stream.publish_stream_callback = publishStreamCallback;
    stderr_stream.publish_stream_callback = publishStreamCallback;
    interpreter.display_pub.clear_output_callback = clearOutputCallback;
    interpreter.display_pub.display_data_callback = displayDataCallback;
    interpreter.display_pub.update_display_data_callback =
      updateDisplayDataCallback;
    interpreter.displayhook.publish_execution_result = publishExecutionResult;
    interpreter.input = input;
    interpreter.getpass = getpass;
    const res = yield kernel.run(content.code);
    const results = formatResult(res);
    if (results['status'] === 'error') {
      publishExecutionError(
        results['ename'],
        results['evalue'],
        results['traceback']
      );
    }
    return results;
  });
}
/**
 * Complete the code submitted by a user.
 *
 * @param content The incoming message with the code to complete.
 */
function complete(content) {
  const res = kernel.complete(content.code, content.cursor_pos);
  const results = formatResult(res);
  return results;
}
/**
 * Inspect the code submitted by a user.
 *
 * @param content The incoming message with the code to inspect.
 */
function inspect(content) {
  const res = kernel.inspect(
    content.code,
    content.cursor_pos,
    content.detail_level
  );
  const results = formatResult(res);
  return results;
}
/**
 * Check code for completeness submitted by a user.
 *
 * @param content The incoming message with the code to check.
 */
function isComplete(content) {
  const res = kernel.is_complete(content.code);
  const results = formatResult(res);
  return results;
}
/**
 * Respond to the commInfoRequest.
 *
 * @param content The incoming message with the comm target name.
 */
function commInfo(content) {
  const res = kernel.comm_info(content.target_name);
  const results = formatResult(res);
  return {
    comms: results,
    status: 'ok',
  };
}
/**
 * Respond to the commOpen.
 *
 * @param content The incoming message with the comm open.
 */
function commOpen(content) {
  const res = kernel.comm_manager.comm_open(pyodide.toPy(content));
  const results = formatResult(res);
  return results;
}
/**
 * Respond to the commMsg.
 *
 * @param content The incoming message with the comm msg.
 */
function commMsg(content) {
  const res = kernel.comm_manager.comm_msg(pyodide.toPy(content));
  const results = formatResult(res);
  return results;
}
/**
 * Respond to the commClose.
 *
 * @param content The incoming message with the comm close.
 */
function commClose(content) {
  const res = kernel.comm_manager.comm_close(pyodide.toPy(content));
  const results = formatResult(res);
  return results;
}
/**
 * Process a message sent to the worker.
 *
 * @param event The message event to process
 */
self.onmessage = (event) =>
  __awaiter(void 0, void 0, void 0, function* () {
    yield pyodideReadyPromise;
    const data = event.data;
    let results;
    const messageType = data.type;
    const messageContent = data.data;
    kernel._parent_header = pyodide.toPy(data.parent);
    switch (messageType) {
      case 'execute-request':
        results = yield execute(messageContent);
        break;
      case 'input-reply':
        resolveInputReply(messageContent);
        return;
      case 'inspect-request':
        results = inspect(messageContent);
        break;
      case 'is-complete-request':
        results = isComplete(messageContent);
        break;
      case 'complete-request':
        results = complete(messageContent);
        break;
      case 'comm-info-request':
        results = commInfo(messageContent);
        break;
      case 'comm-open':
        results = commOpen(messageContent);
        break;
      case 'comm-msg':
        results = commMsg(messageContent);
        break;
      case 'comm-close':
        results = commClose(messageContent);
        break;
      default:
        break;
    }
    const reply = {
      parentHeader: data.parent['header'],
      type: 'reply',
      results,
    };
    postMessage(reply);
  });
