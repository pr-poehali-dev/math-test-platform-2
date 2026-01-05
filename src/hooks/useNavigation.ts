import { useState } from 'react';

export type View = 'login' | 'testSelection' | 'testInterface' | 'teacherDashboard';

export const useNavigation = () => {
  const [view, setView] = useState<View>('login');
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);

  const navigateToLogin = () => {
    setView('login');
    setSelectedTestId(null);
  };

  const navigateToTestSelection = () => {
    setView('testSelection');
    setSelectedTestId(null);
  };

  const navigateToTest = (testId: string) => {
    setSelectedTestId(testId);
    setView('testInterface');
  };

  const navigateToTeacherDashboard = () => {
    setView('teacherDashboard');
  };

  return {
    view,
    selectedTestId,
    navigateToLogin,
    navigateToTestSelection,
    navigateToTest,
    navigateToTeacherDashboard
  };
};
