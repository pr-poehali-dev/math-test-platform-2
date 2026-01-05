import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';

interface TestTimerProps {
  timeLimit: number;
  onTimeUp: () => void;
}

export default function TestTimer({ timeLimit, onTimeUp }: TestTimerProps) {
  const [timeLeft, setTimeLeft] = useState(timeLimit * 60);
  const [isWarning, setIsWarning] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = prev - 1;
        if (newTime <= 300 && !isWarning) {
          setIsWarning(true);
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onTimeUp, isWarning]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = (timeLeft / (timeLimit * 60)) * 100;

  return (
    <Card className={`border-primary/20 ${isWarning ? 'border-destructive' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Icon 
              name={isWarning ? 'AlertCircle' : 'Clock'} 
              size={18} 
              className={isWarning ? 'text-destructive' : 'text-primary'}
            />
            <span className="text-sm font-medium">Времени осталось:</span>
          </div>
          <span className={`text-2xl font-heading font-bold ${isWarning ? 'text-destructive' : ''}`}>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </CardContent>
    </Card>
  );
}
