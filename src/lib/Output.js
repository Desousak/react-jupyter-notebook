import React from 'react';
import Ansi from 'ansi-to-react';
import { setCharAt } from './Helpers';

import './scss/Output.scss';

// TODO: Make threshold values changeable
const MAX_LINES = 30,
  LEAD_AHEAD = 4;

function preProcessStreams(outputs) {
  // Split lines such that 1 line = one output entry. Also merges multiple entries that are on the same line
  const splitLines = (outputs) => {
    let lineBuffer = { text: '', name: '' };
    const newOutputs = [],
      flushLineBuffer = (
        output = {
          name: 'stdout',
          output_type: 'stream',
        }
      ) => {
        if (lineBuffer.text.length > 0) {
          const newLine = { ...output, ...lineBuffer };
          lineBuffer.text = '';
          newOutputs.push(newLine);
        }
      };

    for (let output of outputs) {
      if ('output_type' in output && output.output_type === 'stream') {
        const outputText = output.text,
          outputName = output.name;

        // Prevent different typed rows from merging
        if (outputName !== lineBuffer.name) {
          flushLineBuffer();
          lineBuffer.name = outputName;
        }

        switch (typeof outputText) {
          case 'string':
            // Split string at newline
            for (let i = 0; i < outputText.length; i++) {
              const char = outputText[i];
              lineBuffer.text += char;
              if (char === '\n') flushLineBuffer();
            }
            break;
          case 'object':
            // Each entry is a newline
            for (let line of outputText) {
              lineBuffer.text += line;
              flushLineBuffer();
            }
            break;
          default:
            break;
        }
      } else {
        // If different output, flush and output
        flushLineBuffer();
        newOutputs.push(output);
      }
    }
    flushLineBuffer();
    return newOutputs;
  };
  // Implements character sequences
  // TODO: Handle more than \b and \r
  const handleSequences = (outputs) => {
    const mergedOutput = [];

    for (let output of outputs) {
      if ('output_type' in output && output.output_type === 'stream') {
        const outputText = output.text;
        let newLine = '', // Replacement line for current output
          i = 0; // Place within line

        // Build line while factoring in backspaces
        for (let j = 0; j < outputText.length; j++) {
          const char = outputText[j];
          if (char === '\b') {
            // Delete backwards
            newLine = newLine.slice(0, -1);
          } else if (char === '\r') {
            // Carriage return
            i = 0;
          } else {
            // Add to line
            if (i >= newLine.length) {
              newLine += char;
            } else {
              newLine = setCharAt(newLine, i, char);
            }
            i += 1;
          }
        }

        // If we have something to place on this line after backspacing...
        if (newLine.length > 0) mergedOutput.push({ ...output, text: newLine });
      } else {
        mergedOutput.push(output);
      }
    }

    return mergedOutput;
  };
  // Counts the amount of stream outputs
  const countStreams = (outputs) => {
    return outputs.reduce((total, output) => {
      return 'output_type' in output && output.output_type === 'stream'
        ? total + 1
        : total;
    }, 0);
  };

  let res = outputs;
  const pipeline = [splitLines, handleSequences];
  pipeline.forEach((pipe) => (res = pipe(res)));
  return { outputs: res, total: countStreams(res) };
}

function buildOutputRow(htmlContent, key = null, execCount = null) {
  return (
    <div key={key} className="cell-row">
      <div className="cell-info">
        <pre className="cell-run-count output">
          {execCount ? `Out [${execCount}]` : null}
        </pre>
      </div>
      {htmlContent}
    </div>
  );
}

// TODO: MAKE RAPID OUTPUT UPDATES FASTER
function Output(props) {
  // Get the cell, outputs, and metadata
  const { outputs = [], shown } = props;
  const res = preProcessStreams(outputs);
  let processedOutputs = res.outputs;
  let streamTotal = res.total;

  // Determine whether to limit stream output
  const canLimitStreams = shown === 1 && streamTotal > MAX_LINES;
  let streamCount = 0;

  return shown === 0 ? (
    <div className="output-hidden">
      <i>Outputs are collapsed</i>
    </div>
  ) : (
    <div
      className="block-output-content"
      style={
        shown === 2
          ? {
              maxHeight: '24em', // Hard coded to a reasonable value
              height: 200,
              boxShadow: 'inset 0 0 6px 2px rgb(0 0 0 / 30%)',
              resize: 'vertical',
            }
          : null
      }
    >
      <div>
        {canLimitStreams &&
          buildOutputRow(
            <span>
              Output exceeds the <b>size limit</b>. View the full output in the{' '}
              <b>scrolled output view</b>.
            </span>
          )}
        {processedOutputs.map((output, index) => {
          let executionCount, htmlContent;
          if ('output_type' in output) {
            let output_type = output['output_type'];
            switch (output_type) {
              // Stdout and stderr
              case 'stream':
                let outputText = output['text'];
                streamCount += 1;
                if (
                  !canLimitStreams || // If we're not limiting output
                  streamCount <= MAX_LINES - LEAD_AHEAD - 1 || // OR If we're limiting output AND we're under the max
                  streamCount > streamTotal - LEAD_AHEAD // OR If we're limiting output AND we're the last N lines
                ) {
                  htmlContent = (
                    <pre
                      className={`cell-content ${
                        output['name'] === 'stdout'
                          ? 'output-std'
                          : 'output-err'
                      }`}
                    >
                      {outputText}
                    </pre>
                  );
                } else if (
                  canLimitStreams &&
                  streamCount === MAX_LINES - (LEAD_AHEAD - 1)
                ) {
                  htmlContent = (
                    <pre className={`cell-content 'output-std'`}>...</pre>
                  );
                }
                break;
              // Output with execution_count, same as 'display_data'
              case 'execute_result':
                executionCount = output['execution_count'];
              // Output without execution_count
              // eslint-disable-next-line no-fallthrough
              case 'display_data':
                let output_data = output['data'],
                  outputDataKey = Object.keys(output_data)[0];
                // Can sometimes be sent as string??
                if (typeof output_data[outputDataKey] === 'string')
                  output_data[outputDataKey] = [output_data[outputDataKey]];

                if ('image/png' in output_data) {
                  let output_metadata = output['metadata'];
                  let size = output_metadata && output_metadata['image/png'];
                  htmlContent = (
                    <div
                      className="cell-content output-display"
                      style={{
                        justifyContent: 'start',
                      }}
                    >
                      <img
                        src={`data:image/png;base64,${output_data['image/png']}`}
                        width={size ? size['width'] : 'auto'}
                        height={size ? size['height'] : 'auto'}
                        alt=""
                      />
                    </div>
                  );
                } else if ('text/html' in output_data) {
                  const rawData = output_data['text/html'];
                  // Data can be in either a string OR array??
                  htmlContent = (
                    <div
                      className="cell-content output-display"
                      style={{
                        justifyContent: 'start',
                      }}
                      dangerouslySetInnerHTML={{
                        __html:
                          typeof rawData === 'string'
                            ? rawData
                            : rawData.join(''),
                      }}
                    />
                  );
                } else if ('text/plain' in output_data) {
                  htmlContent = (
                    <pre className="cell-content output-std">
                      {output_data['text/plain'].join('')}
                    </pre>
                  );
                }

                break;
              // Exceptions
              case 'error':
                let output_traceback = output['traceback'].join('\n');

                htmlContent = (
                  <pre className="cell-content output-err">
                    <Ansi>{output_traceback}</Ansi>
                  </pre>
                );

                break;
              default:
                console.log('Unexpected output_type: ', output_type);
            }
          }

          if (htmlContent !== undefined)
            return buildOutputRow(htmlContent, `${index}`, executionCount);
          return null;
        })}
      </div>
    </div>
  );
}

export default React.memo(Output);
