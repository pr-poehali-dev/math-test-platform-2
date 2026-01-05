import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getTestById } from '@/data/tests';
import { StudentSubmission } from '@/types/test';
import Icon from '@/components/ui/icon';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface TestInterfaceProps {
  testId: string;
  studentName: string;
  onSubmit: (submission: StudentSubmission) => void;
  onBack: () => void;
}

export default function TestInterface({ testId, studentName, onSubmit, onBack }: TestInterfaceProps) {
  const test = getTestById(testId);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [submitted, setSubmitted] = useState(false);

  if (!test) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert variant="destructive">
          <Icon name="AlertCircle" size={20} />
          <AlertDescription>Тест не найден</AlertDescription>
        </Alert>
      </div>
    );
  }

  const progress = (Object.keys(answers).length / test.questions.length) * 100;

  const handleAnswerChange = (questionId: number, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = () => {
    const submission: StudentSubmission = {
      studentName,
      variantId: testId,
      answers,
      submittedAt: new Date(),
      isLocked: true,
      canRetake: false
    };
    setSubmitted(true);
    onSubmit(submission);
  };

  const allAnswered = test.questions.every(q => answers[q.id]?.trim());

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-heading font-bold mb-1">
              {test.subject} - {test.name}
            </h1>
            <p className="text-muted-foreground">{test.grade} класс</p>
          </div>
          <Button variant="outline" onClick={onBack} disabled={submitted}>
            <Icon name="ArrowLeft" size={16} className="mr-2" />
            Назад
          </Button>
        </div>

        <Card className="mb-6 border-primary/20">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardDescription>Прогресс выполнения</CardDescription>
              <Badge variant="outline">
                {Object.keys(answers).length} / {test.questions.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>

        <div className="space-y-4 mb-6">
          {test.questions.map((question, index) => (
            <Card
              key={question.id}
              className="animate-fade-in border-primary/20"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardHeader>
                <div className="flex items-start gap-3">
                  <Badge className="mt-1">{index + 1}</Badge>
                  <div className="flex-1">
                    <CardTitle className="text-base font-normal leading-relaxed">
                      {question.text}
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="Введите ваш ответ"
                  value={answers[question.id] || ''}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  disabled={submitted}
                  className="text-base"
                />
              </CardContent>
            </Card>
          ))}
        </div>

        {submitted ? (
          <Alert className="border-primary/20 bg-primary/5">
            <Icon name="CheckCircle" size={20} className="text-primary" />
            <AlertDescription className="text-base">
              Тест успешно сдан! Ожидайте проверки учителем.
            </AlertDescription>
          </Alert>
        ) : (
          <Card className="border-primary/20 bg-card/50 backdrop-blur">
            <CardContent className="pt-6">
              <Button
                className="w-full h-12 text-base"
                size="lg"
                onClick={handleSubmit}
                disabled={!allAnswered}
              >
                <Icon name="Send" size={18} className="mr-2" />
                Сдать тест
              </Button>
              {!allAnswered && (
                <p className="text-sm text-muted-foreground text-center mt-3">
                  Ответьте на все вопросы перед отправкой
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
