import { useAuth } from '@/hooks/useAuth';
import { useSubmissions } from '@/hooks/useSubmissions';
import { useNavigation } from '@/hooks/useNavigation';
import AppRouter from '@/components/AppRouter';
import { StudentSubmission } from '@/types/test';

export default function Index() {
  const { user, login, logout } = useAuth();
  const { submissions, addSubmission, gradeSubmission, allowRetake } = useSubmissions();
  const { view, selectedTestId, navigateToLogin, navigateToTestSelection, navigateToTest, navigateToTeacherDashboard } = useNavigation();

  const handleLogin = (name: string, role: 'student' | 'teacher') => {
    if (role === 'teacher' && name.toLowerCase() !== 'никитовский') {
      alert('Неверное имя учителя. Введите: никитовский');
      return;
    }

    login({ name, role });
    role === 'teacher' ? navigateToTeacherDashboard() : navigateToTestSelection();
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

    navigateToTest(testId);
  };

  const handleSubmitTest = (submission: StudentSubmission) => {
    addSubmission(submission);
    
    setTimeout(() => {
      navigateToTestSelection();
    }, 2000);
  };

  const handleGradeSubmission = (studentName: string, variantId: string, score: number) => {
    gradeSubmission(studentName, variantId, score, user?.name || 'никитовский');
  };

  const handleLogout = () => {
    logout();
    navigateToLogin();
  };

  return (
    <AppRouter
      view={view}
      user={user}
      selectedTestId={selectedTestId}
      submissions={submissions}
      onLogin={handleLogin}
      onSelectTest={handleSelectTest}
      onSubmitTest={handleSubmitTest}
      onGradeSubmission={handleGradeSubmission}
      onAllowRetake={allowRetake}
      onLogout={handleLogout}
      onBackFromTest={navigateToTestSelection}
    />
  );
}