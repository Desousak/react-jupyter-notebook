import React from 'react';
import Ansi from 'ansi-to-react';

/* The cell output */
export default function Output(props) {
  // Get the cell, outputs, and metadata
  const { outputs = [], shown } = props;

  return shown === 0 ? (
    <div className="block-hidden" />
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
        {outputs.map((output, index) => {
          let executionCount;
          let htmlContent;
          if ('output_type' in output) {
            let output_type = output['output_type'];
            switch (output_type) {
              // Stdout and stderr
              case 'stream':
                // Properly parse the text (can sometimes be sent as an array??)
                let outputText = output['text'];
                if (typeof outputText === 'object') outputText.join('');
                htmlContent = (
                  <pre
                    className={`cell-content ${
                      output['name'] === 'stdout' ? 'output-std' : 'output-err'
                    }`}
                  >
                    {outputText}
                  </pre>
                );

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
                        justifyContent: props.mediaAlign,
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
                  htmlContent = (
                    <div
                      className="cell-content output-display"
                      style={{
                        justifyContent: props.mediaAlign,
                      }}
                      dangerouslySetInnerHTML={{
                        __html: output_data['text/html'].join(''),
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

          return (
            <div key={index} className="cell-row">
              <div className="cell-info">
                <pre className="cell-header output">
                  {executionCount ? `[${executionCount}]` : null}
                </pre>
              </div>
              {htmlContent}
            </div>
          );
        })}
      </div>
    </div>
  );
}
