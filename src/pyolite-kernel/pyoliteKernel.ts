import { KernelMessage } from '@jupyterlab/services';
import { BaseKernel } from './baseKernel.ts';
import { IKernel } from './types';
import { PromiseDelegate } from '@lumino/coreutils';
import { v4 as uuid } from 'uuid';

/**
 * A kernel that executes Python code with Pyodide.
 */
export class PyoliteKernel extends BaseKernel implements IKernel {
  private sessionId = uuid();
  /**
   * Instantiate a new PyodideKernel
   *
   * @param options The instantiation options for a new PyodideKernel
   */
  constructor(options: PyoliteKernel.IOptions, context: any) {
    super(options);
    
    this._worker = new Worker(process.env.PUBLIC_URL + '/pyodide.js');
    this._worker.onmessage = (e) => {
      this._processWorkerMessage(e.data);
    };
  }

  /**
   * Dispose the kernel.
   */
  dispose(): void {
    if (this.isDisposed) {
      return;
    }
    console.log(`Dispose worker for kernel ${this.id}`);
    this._worker.terminate();
    super.dispose();
  }

  /**
   * A promise that is fulfilled when the kernel is ready.
   */
  get ready(): Promise<void> {
    return this._ready.promise;
  }

  /**
   * Process a message coming from the pyodide web worker.
   *
   * @param msg The worker message to process.
   */
  private _processWorkerMessage(msg: any): void {
    switch (msg.type) {
      case 'stream': {
        const bundle = msg.bundle ?? { name: 'stdout', text: '' };
        this.stream(bundle, msg.parentHeader);
        break;
      }
      case 'input_request': {
        const bundle = msg.content ?? { prompt: '', password: false };
        this.inputRequest(bundle, msg.parentHeader);
        break;
      }
      case 'reply': {
        const bundle = msg.results;
        this._executeDelegate.resolve(bundle);
        break;
      }
      case 'display_data': {
        const bundle = msg.bundle ?? { data: {}, metadata: {}, transient: {} };
        this.displayData(bundle, msg.parentHeader);
        break;
      }
      case 'update_display_data': {
        const bundle = msg.bundle ?? { data: {}, metadata: {}, transient: {} };
        this.updateDisplayData(bundle, msg.parentHeader);
        break;
      }
      case 'clear_output': {
        const bundle = msg.bundle ?? { wait: false };
        this.clearOutput(bundle, msg.parentHeader);
        break;
      }
      case 'execute_result': {
        const bundle = msg.bundle ?? {
          execution_count: 0,
          data: {},
          metadata: {},
        };
        this.publishExecuteResult(bundle, msg.parentHeader);
        break;
      }
      case 'execute_error': {
        const bundle = msg.bundle ?? { ename: '', evalue: '', traceback: [] };
        this.publishExecuteError(bundle, msg.parentHeader);
        break;
      }
      case 'comm_msg':
      case 'comm_open':
      case 'comm_close': {
        this.handleComm(
          msg.type,
          msg.content,
          msg.metadata,
          msg.buffers,
          msg.parentHeader
        );
        break;
      }
      case 'kernel_ready': {
        this._ready.resolve();
        // Fall through
      }
      default:
        this._executeDelegate.resolve({
          data: {},
          metadata: {},
        });
        break;
    }
  }

  /**
   * Handle a kernel_info_request message
   */
  async kernelInfoRequest(): Promise<KernelMessage.IInfoReplyMsg['content']> {
    const content: KernelMessage.IInfoReply = {
      implementation: 'pyodide',
      implementation_version: '0.1.0',
      language_info: {
        codemirror_mode: {
          name: 'python',
          version: 3,
        },
        file_extension: '.py',
        mimetype: 'text/x-python',
        name: 'python',
        nbconvert_exporter: 'python',
        pygments_lexer: 'ipython3',
        version: '3.8',
      },
      protocol_version: '5.3',
      status: 'ok',
      banner: 'Pyolite: A WebAssembly-powered Python kernel backed by Pyodide',
      help_links: [
        {
          text: 'Python (WASM) Kernel',
          url: 'https://pyodide.org',
        },
      ],
    };
    return content;
  }

  /**
   * Handle an `execute_request` message
   *
   * @param msg The parent message.
   */
  async executeRequest(
    content: KernelMessage.IExecuteRequestMsg['content']
  ): Promise<KernelMessage.IExecuteReplyMsg['content']> {

    const result = await this._sendRequestMessageToWorker(
      'execute-request',
      content
    );

    return {
      execution_count: this.executionCount,
      ...result,
    };
  }

  /**
   * Handle an complete_request message
   *
   * @param msg The parent message.
   */
  async completeRequest(
    content: KernelMessage.ICompleteRequestMsg['content']
  ): Promise<KernelMessage.ICompleteReplyMsg['content']> {
    return await this._sendRequestMessageToWorker('complete-request', content);
  }

  /**
   * Handle an `inspect_request` message.
   *
   * @param content - The content of the request.
   *
   * @returns A promise that resolves with the response message.
   */
  async inspectRequest(
    content: KernelMessage.IInspectRequestMsg['content']
  ): Promise<KernelMessage.IInspectReplyMsg['content']> {
    return await this._sendRequestMessageToWorker('inspect-request', content);
  }

  /**
   * Handle an `is_complete_request` message.
   *
   * @param content - The content of the request.
   *
   * @returns A promise that resolves with the response message.
   */
  async isCompleteRequest(
    content: KernelMessage.IIsCompleteRequestMsg['content']
  ): Promise<KernelMessage.IIsCompleteReplyMsg['content']> {
    return await this._sendRequestMessageToWorker(
      'is-complete-request',
      content
    );
  }

  /**
   * Handle a `comm_info_request` message.
   *
   * @param content - The content of the request.
   *
   * @returns A promise that resolves with the response message.
   */
  async commInfoRequest(
    content: KernelMessage.ICommInfoRequestMsg['content']
  ): Promise<KernelMessage.ICommInfoReplyMsg['content']> {
    return await this._sendRequestMessageToWorker('comm-info-request', content);
  }

  /**
   * Send an `input_reply` message.
   *
   * @param content - The content of the reply.
   */
  inputReply(content: KernelMessage.IInputReplyMsg['content']): void {
    this._worker.postMessage({
      type: 'input-reply',
      data: content,
      parent: this.parent,
    });
  }

  /**
   * Send an `comm_open` message.
   *
   * @param msg - The comm_open message.
   */
  async commOpen(msg: KernelMessage.ICommOpenMsg): Promise<void> {
    return await this._sendRequestMessageToWorker('comm-open', msg);
  }

  /**
   * Send an `comm_msg` message.
   *
   * @param msg - The comm_msg message.
   */
  async commMsg(msg: KernelMessage.ICommMsgMsg): Promise<void> {
    return await this._sendRequestMessageToWorker('comm-msg', msg);
  }

  /**
   * Send an `comm_close` message.
   *
   * @param close - The comm_close message.
   */
  async commClose(msg: KernelMessage.ICommCloseMsg): Promise<void> {
    return await this._sendRequestMessageToWorker('comm-close', msg);
  }

  /**
   * Send a message to the web worker
   *
   * @param type The message type to send to the worker.
   * @param data The message to send to the worker.
   */
  private async _sendRequestMessageToWorker(
    type: string,
    data: any
  ): Promise<any> {
    this._executeDelegate = new PromiseDelegate<any>();
    this._worker.postMessage({
      type,
      data,
      parent: {
        buffers: [],
        channel: 'shell',
        header: {
          msg_id: uuid(),
          session: this.sessionId,
          username: '',
          date: Date.now(),
          msg_type: type,
          version: '5.3',
        },
      },
    });
    return await this._executeDelegate.promise;
  }

  private _executeDelegate = new PromiseDelegate<any>();
  private _worker: Worker;
  private _ready = new PromiseDelegate<void>();
}

/**
 * A namespace for PyoliteKernel statics.
 */
export namespace PyoliteKernel {
  /**
   * The instantiation options for a Pyodide kernel
   */
  export interface IOptions extends IKernel.IOptions {
    /**
     * The URL to fetch the Pyolite wheel.
     */
    pyoliteWheel?: string;
  }
}
