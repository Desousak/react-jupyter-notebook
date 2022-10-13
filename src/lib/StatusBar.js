import { useEffect, useState } from 'react';
import BlockBtn from './BlockBtn';
import './scss/StatusBar.scss';

export default function StatusBar(props) {
  const { kernelMessenger, addCell } = props;
  const [kernelStatus, setKernelStatus] = useState({});
  const [kernelReady, setKernelReady] = useState(false);

  // Update if kernel manager changes
  useEffect(() => {
    kernelMessenger.kernelInfo().then((res) => setKernelStatus(res));
    kernelMessenger
      .ready()
      .then(() => setKernelReady(kernelMessenger.connected()));
  }, [kernelMessenger]);

  // Parse kernel name (adding * if loading)
  let kernelName = 'None';
  if ('implementation' in kernelStatus)
    kernelName = kernelStatus.implementation;
  if (kernelReady === false) kernelName += ' (*)';

  return (
    <div id="kernel-status-bar">
      <div className="add-buttons">
        <BlockBtn callback={() => addCell('code')}>+ Code</BlockBtn>
        <BlockBtn callback={() => addCell('markdown')}>+ Markdown</BlockBtn>
      </div>
      <span id="kernel-name">Current Kernel: {kernelName}</span>
      <div id="kernel-select">
        <select name="kernels" id="kernel-selector">
          <option value="test">Available kernels here</option>
        </select>
      </div>
    </div>
  );
}
