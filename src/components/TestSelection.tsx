import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { testVariants } from '@/data/tests';
import Icon from '@/components/ui/icon';

interface TestSelectionProps {
  onSelectTest: (testId: string) => void;
  onLogout: () => void;
  userName: string;
}

export default function TestSelection({ onSelectTest, onLogout, userName }: TestSelectionProps) {
  const groupedTests = testVariants.reduce((acc, test) => {
    const key = `${test.grade} класс - ${test.subject}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(test);
    return acc;
  }, {} as Record<string, typeof testVariants>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-heading font-bold mb-2">
              Выбор теста
            </h1>
            <p className="text-muted-foreground">Привет, {userName}! Выбери тест для прохождения</p>
          </div>
          <Button variant="outline" onClick={onLogout}>
            <Icon name="LogOut" size={16} className="mr-2" />
            Выйти
          </Button>
        </div>

        <div className="space-y-6">
          {Object.entries(groupedTests).map(([category, tests]) => (
            <Card key={category} className="animate-fade-in border-primary/20">
              <CardHeader>
                <CardTitle className="text-xl font-heading flex items-center gap-2">
                  <Icon name="BookOpen" size={24} className="text-primary" />
                  {category}
                </CardTitle>
                <CardDescription>
                  Доступно вариантов: {tests.length}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {tests.map((test) => (
                    <Card
                      key={test.id}
                      className="hover:shadow-lg transition-all cursor-pointer hover:scale-105 border-primary/10"
                      onClick={() => onSelectTest(test.id)}
                    >
                      <CardHeader className="pb-3">
                        <Badge className="w-fit mb-2">
                          {test.questions.length} заданий
                        </Badge>
                        <CardTitle className="text-lg font-heading">
                          {test.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Button className="w-full" size="sm">
                          <Icon name="Play" size={14} className="mr-2" />
                          Начать тест
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
