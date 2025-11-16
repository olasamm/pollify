import React, { useState, useEffect } from 'react';
import { Badge } from 'react-bootstrap';

const CountdownTimer = ({ expiresAt, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState(null);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (!expiresAt) {
      setTimeLeft(null);
      return;
    }

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expiration = new Date(expiresAt).getTime();
      const difference = expiration - now;

      if (difference <= 0) {
        setExpired(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        if (onExpire) onExpire();
        return null;
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000)
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      if (newTimeLeft) {
        setTimeLeft(newTimeLeft);
      } else {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [expiresAt, onExpire]);

  if (!expiresAt || !timeLeft) {
    return null;
  }

  if (expired) {
    return (
      <Badge bg="danger" className="ms-2">
        <i className="bi bi-clock-history me-1"></i>
        Expired
      </Badge>
    );
  }

  const formatTime = () => {
    if (timeLeft.days > 0) {
      return `${timeLeft.days}d ${timeLeft.hours}h ${timeLeft.minutes}m`;
    } else if (timeLeft.hours > 0) {
      return `${timeLeft.hours}h ${timeLeft.minutes}m ${timeLeft.seconds}s`;
    } else if (timeLeft.minutes > 0) {
      return `${timeLeft.minutes}m ${timeLeft.seconds}s`;
    } else {
      return `${timeLeft.seconds}s`;
    }
  };

  return (
    <Badge bg="warning" text="dark" className="ms-2">
      <i className="bi bi-clock me-1"></i>
      Expires in: {formatTime()}
    </Badge>
  );
};

export default CountdownTimer;

