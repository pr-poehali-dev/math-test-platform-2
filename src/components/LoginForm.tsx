import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface LoginFormProps {
  onLogin: (name: string, role: 'student' | 'teacher') => void;
}

export default function LoginForm({ onLogin }: LoginFormProps) {
  const [name, setName] = useState('');
  const [role, setRole] = useState<'student' | 'teacher'>('student');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onLogin(name.trim(), role);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/10">
      <Card className="w-full max-w-md animate-fade-in shadow-2xl border-primary/20">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
            <Icon name="GraduationCap" size={32} className="text-primary" />
          </div>
          <CardTitle className="text-3xl font-heading">Математика Онлайн</CardTitle>
          <CardDescription className="text-base">
            Платформа для тестирования по математике
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={role === 'student' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setRole('student')}
                >
                  <Icon name="User" size={16} className="mr-2" />
                  Ученик
                </Button>
                <Button
                  type="button"
                  variant={role === 'teacher' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setRole('teacher')}
                >
                  <Icon name="UserCheck" size={16} className="mr-2" />
                  Учитель
                </Button>
              </div>

              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder={role === 'teacher' ? 'Введите никитовский' : 'Введите ваше имя'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-12 text-base"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-12 text-base" size="lg">
              <Icon name="LogIn" size={18} className="mr-2" />
              Войти
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
