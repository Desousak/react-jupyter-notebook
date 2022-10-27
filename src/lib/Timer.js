import React, { useEffect, useRef, useState } from 'react';
import { FaSpinner, FaCheckCircle } from 'react-icons/fa';
import { BiErrorCircle } from 'react-icons/bi';

import './scss/Timer.scss';

function Timer(props) {
  const [time, setTime] = useState(0.0),
    { status } = props;
  let prevTime = useRef(null),
    exitAnimation = useRef(false);

  useEffect(() => {
    if (status === 2) {
      // Animation function that increases the counter 
      const incrementTimer = (currTime, repeat = true) => {
        if (!exitAnimation.current || repeat === false) {
          if (prevTime.current !== null) {
            const delta = currTime - prevTime.current;
            setTime((t) => t + delta / 1000);
          }
          prevTime.current = currTime;
          if (repeat) requestAnimationFrame(incrementTimer);
        }
      };
      // Set variables
      setTime(0.0);
      prevTime.current = null;
      exitAnimation.current = false;
      requestAnimationFrame(incrementTimer);

      // Cleanup
      return () => {
        exitAnimation.current = true;

        if (document.visibilityState !== 'visible') {
          // Hold time that the counter was *supposed* to finish at
          // And resume when the user refocuses
          // TODO: Find a more accurate method than this
          const refocusTime = performance.now();
          document.addEventListener(
            'visibilitychange',
            () => {
              if (document.visibilityState === 'visible')
                incrementTimer(refocusTime, false);
            },
            {
              once: true,
            }
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
