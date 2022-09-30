import React, { useEffect, useState } from 'react';
import { FaSpinner, FaCheckCircle } from 'react-icons/fa';
import { BiErrorCircle } from 'react-icons/bi';

import './scss/Timer.scss';

export default function Timer(props) {
  const [time, setTime] = useState(0.0),
    { status } = props;

  // Increment every 0.1s
  useEffect(() => {
    if (status === 2) {
      setTime(0.0);
      const timer = setInterval(
        () => setTime((prevTime) => prevTime + 0.1),
        100
      );
      return () => clearInterval(timer);
    }
  }, [status]);

  let spinner;
  switch (status) {
    case -2:
      spinner = <BiErrorCircle className="error-msg" />;
      break;
    case 2:
      spinner = <FaSpinner className="spin" />;
      break;
    default:
      spinner = <FaCheckCircle className="success-msg" />;
      break;
  }

  return (
    <React.Fragment>
      {status !== -1 && status !== 1 && (
        <React.Fragment>
          <span className="exec-status">{spinner}</span>
          <span className="exec-time">{time.toFixed(1)}s</span>
        </React.Fragment>
      )}
    </React.Fragment>
  );
}
