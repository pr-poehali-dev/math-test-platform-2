import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SchoolTimerProps {
  userRole?: string;
}

export default function SchoolTimer({ userRole }: SchoolTimerProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isSchoolOpen, setIsSchoolOpen] = useState(true);
  const [timeUntilClose, setTimeUntilClose] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      if (userRole === 'admin' || userRole === 'teacher') {
        setIsSchoolOpen(true);
        return;
      }

      const hours = now.getHours();
      const minutes = now.getMinutes();
      const currentMinutes = hours * 60 + minutes;

      const openMinutes = 10 * 60;
      const closeMinutes = 22 * 60 + 45;

      if (currentMinutes >= openMinutes && currentMinutes < closeMinutes) {
        setIsSchoolOpen(true);
        const minutesLeft = closeMinutes - currentMinutes;
        const hoursLeft = Math.floor(minutesLeft / 60);
        const minsLeft = minutesLeft % 60;
        setTimeUntilClose(`${hoursLeft}ч ${minsLeft}м`);
      } else {
        setIsSchoolOpen(false);
        setTimeUntilClose('');
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [userRole]);

  const formattedTime = currentTime.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  return (
    <div className="fixed top-4 left-4 z-50 space-y-2">
      <Card className="border-primary/20 bg-card/95 backdrop-blur">
        <CardContent className="p-3 flex items-center gap-2">
          <Icon name="Clock" size={18} className="text-primary" />
          <span className="font-heading font-semibold">{formattedTime}</span>
        </CardContent>
      </Card>

      {!isSchoolOpen && userRole === 'student' && (
        <Alert variant="destructive" className="max-w-xs">
          <Icon name="AlertCircle" size={18} />
          <AlertDescription className="text-sm">
            Школа работает с 10:00 до 22:45
          </AlertDescription>
        </Alert>
      )}

      {isSchoolOpen && timeUntilClose && userRole === 'student' && (
        <Card className="border-primary/20 bg-card/95 backdrop-blur max-w-xs">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground mb-1">До закрытия:</p>
            <p className="font-semibold text-sm">{timeUntilClose}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
