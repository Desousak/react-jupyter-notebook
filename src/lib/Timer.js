import React, { useEffect, useRef, useState } from 'react';
import { FaSpinner, FaCheckCircle } from 'react-icons/fa';
import { BiErrorCircle } from 'react-icons/bi';

import './scss/Timer.scss';

function Timer(props) {
  const [time, setTime] = useState(0.0),
    { status } = props;
  let prevTime = useRef(null),
    exit = useRef(false);

  const incrementTimer = (currTime) => {
    if (prevTime.current !== null) {
      const delta = currTime - prevTime.current;
      setTime((test) => test + delta / 1000);
    }
    // Cleanup
    if (!exit.current) {
      prevTime.current = currTime;
      requestAnimationFrame(incrementTimer);
    } else {
      exit.current = false;
      prevTime.current = null;
    }
  };

  useEffect(() => {
    if (status === 2) {
      setTime(0.0);
      exit.current = false;
      requestAnimationFrame(incrementTimer);
      return () => {
        if (document.hasFocus()) {
          exit.current = true;
        } else {
          // Calculate the time till the user refocuses the page
          // TODO: Find a better method for this
          const refocusTime = performance.now();
          document.addEventListener(
            'visibilitychange',
            () => {
              // Offset previous time by time spent offscreen
              if (document.visibilityState === 'visible') {
                exit.current = true;
                prevTime.current += performance.now() - refocusTime;
              }
            },
            { once: true }
          );
        }
      };
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

export default React.memo(Timer);
