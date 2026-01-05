import LoginForm from '@/components/LoginForm';
import TestSelection from '@/components/TestSelection';
import TestInterface from '@/components/TestInterface';
import TeacherDashboard from '@/components/TeacherDashboard';
import { User, StudentSubmission } from '@/types/test';
import { View } from '@/hooks/useNavigation';

interface AppRouterProps {
  view: View;
  user: User | null;
  selectedTestId: string | null;
  submissions: StudentSubmission[];
  onLogin: (name: string, role: 'student' | 'teacher') => void;
  onSelectTest: (testId: string) => void;
  onSubmitTest: (submission: StudentSubmission) => void;
  onGradeSubmission: (studentName: string, variantId: string, score: number) => void;
  onAllowRetake: (studentName: string, variantId: string) => void;
  onLogout: () => void;
  onBackFromTest: () => void;
}

export default function AppRouter({
  view,
  user,
  selectedTestId,
  submissions,
  onLogin,
  onSelectTest,
  onSubmitTest,
  onGradeSubmission,
  onAllowRetake,
  onLogout,
  onBackFromTest
}: AppRouterProps) {
  if (view === 'login') {
    return <LoginForm onLogin={onLogin} />;
  }

  if (view === 'testSelection' && user) {
    return (
      <TestSelection
        onSelectTest={onSelectTest}
        onLogout={onLogout}
        userName={user.name}
      />
    );
  }

  if (view === 'testInterface' && user && selectedTestId) {
    return (
      <TestInterface
        testId={selectedTestId}
        studentName={user.name}
        onSubmit={onSubmitTest}
        onBack={onBackFromTest}
      />
    );
  }

  if (view === 'teacherDashboard' && user?.role === 'teacher') {
    return (
      <TeacherDashboard
        submissions={submissions}
        onGradeSubmission={onGradeSubmission}
        onAllowRetake={onAllowRetake}
        onLogout={onLogout}
      />
    );
  }

  return <LoginForm onLogin={onLogin} />;
}
