import { Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import Countdown from 'react-countdown';

export const BackstopQueueTimer = () => {
  const Completionist = () => <span />;

  const Renderer = ({
    days,
    hours,
    minutes,
    seconds,
    completed,
  }: {
    days: any;
    hours: any;
    minutes: any;
    seconds: any;
    completed: any;
  }) => {
    if (completed) {
      return <Completionist />;
    } else {
      return (
        <Typography variant="body2">
          <span>
            {days}d {hours}h {minutes}m {seconds}s
          </span>
        </Typography>
      );
    }
  };

  const getLocalStorageValue = (s: string) => localStorage.getItem(s);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [data, setData] = useState(
    { date: Date.now(), delay: 30 * 24 * 60 * 60 * 1000 } // 30 days
  );
  const wantedDelay = 30 * 24 * 60 * 60 * 1000;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const savedDate = getLocalStorageValue('end_date');
    if (savedDate != null && !isNaN(savedDate)) {
      const currentTime = Date.now();
      const delta = parseInt(savedDate, 10) - currentTime;

      if (delta > wantedDelay) {
        if (localStorage.getItem('end_date')!.length > 0) localStorage.removeItem('end_date');
      } else {
        setData({ date: currentTime, delay: delta });
      }
    }
  }, [wantedDelay]);

  return (
    <div>
      <Countdown
        date={data.date + data.delay}
        renderer={Renderer}
        onStart={(_delta) => {
          if (localStorage.getItem('end_date') == null)
            localStorage.setItem('end_date', JSON.stringify(data.date + data.delay));
        }}
        onComplete={() => {
          if (localStorage.getItem('end_date') != null) localStorage.removeItem('end_date');
        }}
      />
    </div>
  );
};
