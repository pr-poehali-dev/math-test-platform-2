import { useState, useEffect } from 'react';
import LoginForm from '@/components/LoginForm';
import TestSelection from '@/components/TestSelection';
import TestInterface from '@/components/TestInterface';
import TeacherDashboard from '@/components/TeacherDashboard';
import { User, StudentSubmission } from '@/types/test';

type View = 'login' | 'testSelection' | 'testInterface' | 'teacherDashboard';

export default function Index() {
  const [view, setView] = useState<View>('login');
  const [user, setUser] = useState<User | null>(null);
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);

  useEffect(() => {
    const savedSubmissions = localStorage.getItem('testSubmissions');
    if (savedSubmissions) {
      setSubmissions(JSON.parse(savedSubmissions));
    }
  }, []);

  const saveSubmissions = (newSubmissions: StudentSubmission[]) => {
    setSubmissions(newSubmissions);
    localStorage.setItem('testSubmissions', JSON.stringify(newSubmissions));
  };

  const handleLogin = (name: string, role: 'student' | 'teacher') => {
    if (role === 'teacher' && name.toLowerCase() !== 'никитовский') {
      alert('Неверное имя учителя. Введите: никитовский');
      return;
    }

    setUser({ name, role });
    setView(role === 'teacher' ? 'teacherDashboard' : 'testSelection');
  };

  const handleSelectTest = (testId: string) => {
    if (!user) return;

    const existingSubmission = submissions.find(
      s => s.studentName === user.name && s.variantId === testId
    );

    if (existingSubmission && existingSubmission.isLocked && !existingSubmission.canRetake) {
      alert('Вы уже сдали этот тест. Дождитесь проверки учителем.');
      return;
    }

    setSelectedTestId(testId);
    setView('testInterface');
  };

  const handleSubmitTest = (submission: StudentSubmission) => {
    const existingIndex = submissions.findIndex(
      s => s.studentName === submission.studentName && s.variantId === submission.variantId
    );

    let newSubmissions: StudentSubmission[];
    if (existingIndex >= 0) {
      newSubmissions = [...submissions];
      newSubmissions[existingIndex] = submission;
    } else {
      newSubmissions = [...submissions, submission];
    }

    saveSubmissions(newSubmissions);
    
    setTimeout(() => {
      setView('testSelection');
      setSelectedTestId(null);
    }, 2000);
  };

  const handleGradeSubmission = (studentName: string, variantId: string, score: number) => {
    const newSubmissions = submissions.map(s => {
      if (s.studentName === studentName && s.variantId === variantId) {
        return {
          ...s,
          score,
          checkedBy: user?.name || 'никитовский'
        };
      }
      return s;
    });
    saveSubmissions(newSubmissions);
  };

  const handleAllowRetake = (studentName: string, variantId: string) => {
    const newSubmissions = submissions.map(s => {
      if (s.studentName === studentName && s.variantId === variantId) {
        return {
          ...s,
          canRetake: true,
          isLocked: false
        };
      }
      return s;
    });
    saveSubmissions(newSubmissions);
  };

  const handleLogout = () => {
    setUser(null);
    setView('login');
    setSelectedTestId(null);
  };

  if (view === 'login') {
    return <LoginForm onLogin={handleLogin} />;
  }

  if (view === 'testSelection' && user) {
    return (
      <TestSelection
        onSelectTest={handleSelectTest}
        onLogout={handleLogout}
        userName={user.name}
      />
    );
  }

  if (view === 'testInterface' && user && selectedTestId) {
    return (
      <TestInterface
        testId={selectedTestId}
        studentName={user.name}
        onSubmit={handleSubmitTest}
        onBack={() => {
          setView('testSelection');
          setSelectedTestId(null);
        }}
      />
    );
  }

  if (view === 'teacherDashboard' && user?.role === 'teacher') {
    return (
      <TeacherDashboard
        submissions={submissions}
        onGradeSubmission={handleGradeSubmission}
        onAllowRetake={handleAllowRetake}
        onLogout={handleLogout}
      />
    );
  }

  return <LoginForm onLogin={handleLogin} />;
}