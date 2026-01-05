import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { StudentSubmission } from '@/types/test';
import { getTestById } from '@/data/tests';
import Icon from '@/components/ui/icon';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface TeacherDashboardProps {
  submissions: StudentSubmission[];
  onGradeSubmission: (studentName: string, variantId: string, score: number) => void;
  onAllowRetake: (studentName: string, variantId: string) => void;
  onLogout: () => void;
}

export default function TeacherDashboard({
  submissions,
  onGradeSubmission,
  onAllowRetake,
  onLogout
}: TeacherDashboardProps) {
  const [selectedSubmission, setSelectedSubmission] = useState<StudentSubmission | null>(null);
  const [scores, setScores] = useState<{ [key: string]: string }>({});

  const pendingSubmissions = submissions.filter(s => s.score === undefined);
  const gradedSubmissions = submissions.filter(s => s.score !== undefined);

  const handleScoreChange = (key: string, value: string) => {
    setScores(prev => ({ ...prev, [key]: value }));
  };

  const handleGrade = (submission: StudentSubmission) => {
    const key = `${submission.studentName}-${submission.variantId}`;
    const score = parseInt(scores[key] || '0');
    if (!isNaN(score)) {
      onGradeSubmission(submission.studentName, submission.variantId, score);
      setScores(prev => {
        const newScores = { ...prev };
        delete newScores[key];
        return newScores;
      });
    }
  };

  const renderSubmissionDetails = (submission: StudentSubmission) => {
    const test = getTestById(submission.variantId);
    if (!test) return null;

    return (
      <div className="space-y-4">
        {test.questions.map((question, index) => {
          const studentAnswer = submission.answers[question.id];
          const isCorrect = studentAnswer?.trim().toLowerCase() === question.answer.toLowerCase();

          return (
            <Card key={question.id} className="border-primary/20">
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <Badge variant={isCorrect ? 'default' : 'destructive'}>
                    {index + 1}
                  </Badge>
                  <CardTitle className="text-sm font-normal leading-relaxed flex-1">
                    {question.text}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Ответ ученика:</p>
                    <p className="font-medium">{studentAnswer || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Правильный ответ:</p>
                    <p className="font-medium text-primary">{question.answer}</p>
                  </div>
                </div>
                {isCorrect && (
                  <div className="flex items-center gap-2 text-sm text-primary">
                    <Icon name="CheckCircle" size={16} />
                    Верно
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  const getStudentStats = () => {
    const stats: { [key: string]: { total: number; graded: number; avgScore: number } } = {};
    
    submissions.forEach(sub => {
      if (!stats[sub.studentName]) {
        stats[sub.studentName] = { total: 0, graded: 0, avgScore: 0 };
      }
      stats[sub.studentName].total++;
      if (sub.score !== undefined) {
        stats[sub.studentName].graded++;
        stats[sub.studentName].avgScore += sub.score;
      }
    });

    Object.keys(stats).forEach(name => {
      if (stats[name].graded > 0) {
        stats[name].avgScore = Math.round(stats[name].avgScore / stats[name].graded);
      }
    });

    return stats;
  };

  const studentStats = getStudentStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-heading font-bold mb-2">
              Панель учителя
            </h1>
            <p className="text-muted-foreground">Управление тестами и проверка работ</p>
          </div>
          <Button variant="outline" onClick={onLogout}>
            <Icon name="LogOut" size={16} className="mr-2" />
            Выйти
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardDescription>На проверке</CardDescription>
              <CardTitle className="text-3xl font-heading">
                {pendingSubmissions.length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardDescription>Проверено</CardDescription>
              <CardTitle className="text-3xl font-heading">
                {gradedSubmissions.length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardDescription>Всего учеников</CardDescription>
              <CardTitle className="text-3xl font-heading">
                {Object.keys(studentStats).length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">
              <Icon name="Clock" size={16} className="mr-2" />
              На проверке
            </TabsTrigger>
            <TabsTrigger value="graded">
              <Icon name="CheckCircle2" size={16} className="mr-2" />
              Проверенные
            </TabsTrigger>
            <TabsTrigger value="stats">
              <Icon name="BarChart3" size={16} className="mr-2" />
              Статистика
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            {pendingSubmissions.length === 0 ? (
              <Alert className="border-primary/20">
                <Icon name="Info" size={20} />
                <AlertDescription>Нет работ на проверке</AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                {pendingSubmissions.map((submission) => {
                  const test = getTestById(submission.variantId);
                  const key = `${submission.studentName}-${submission.variantId}`;
                  
                  return (
                    <Card key={key} className="border-primary/20">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="font-heading">
                              {submission.studentName}
                            </CardTitle>
                            <CardDescription>
                              {test?.subject} - {test?.name} ({test?.grade} класс)
                            </CardDescription>
                          </div>
                          <Badge variant="outline">
                            {new Date(submission.submittedAt).toLocaleDateString()}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => setSelectedSubmission(
                            selectedSubmission?.studentName === submission.studentName &&
                            selectedSubmission?.variantId === submission.variantId
                              ? null
                              : submission
                          )}
                        >
                          <Icon name="Eye" size={16} className="mr-2" />
                          {selectedSubmission?.studentName === submission.studentName &&
                          selectedSubmission?.variantId === submission.variantId
                            ? 'Скрыть ответы'
                            : 'Показать ответы'}
                        </Button>

                        {selectedSubmission?.studentName === submission.studentName &&
                        selectedSubmission?.variantId === submission.variantId && (
                          <div className="animate-fade-in">
                            {renderSubmissionDetails(submission)}
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Input
                            type="number"
                            placeholder="Балл"
                            value={scores[key] || ''}
                            onChange={(e) => handleScoreChange(key, e.target.value)}
                            className="flex-1"
                          />
                          <Button onClick={() => handleGrade(submission)}>
                            <Icon name="Check" size={16} className="mr-2" />
                            Выставить
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="graded">
            {gradedSubmissions.length === 0 ? (
              <Alert className="border-primary/20">
                <Icon name="Info" size={20} />
                <AlertDescription>Нет проверенных работ</AlertDescription>
              </Alert>
            ) : (
              <Card className="border-primary/20">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ученик</TableHead>
                      <TableHead>Тест</TableHead>
                      <TableHead>Дата</TableHead>
                      <TableHead>Балл</TableHead>
                      <TableHead>Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {gradedSubmissions.map((submission) => {
                      const test = getTestById(submission.variantId);
                      return (
                        <TableRow key={`${submission.studentName}-${submission.variantId}`}>
                          <TableCell className="font-medium">{submission.studentName}</TableCell>
                          <TableCell>
                            {test?.subject} - {test?.name}
                          </TableCell>
                          <TableCell>
                            {new Date(submission.submittedAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge>{submission.score}</Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onAllowRetake(submission.studentName, submission.variantId)}
                              disabled={submission.canRetake}
                            >
                              <Icon name="RefreshCw" size={14} className="mr-2" />
                              {submission.canRetake ? 'Разрешено' : 'Разрешить пересдачу'}
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="stats">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="font-heading">Статистика по ученикам</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ученик</TableHead>
                      <TableHead>Всего работ</TableHead>
                      <TableHead>Проверено</TableHead>
                      <TableHead>Средний балл</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(studentStats).map(([name, stats]) => (
                      <TableRow key={name}>
                        <TableCell className="font-medium">{name}</TableCell>
                        <TableCell>{stats.total}</TableCell>
                        <TableCell>{stats.graded}</TableCell>
                        <TableCell>
                          {stats.graded > 0 ? (
                            <Badge>{stats.avgScore}</Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
