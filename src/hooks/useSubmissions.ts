import { useState, useEffect } from 'react';
import { StudentSubmission } from '@/types/test';

export const useSubmissions = () => {
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

  const addSubmission = (submission: StudentSubmission) => {
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
  };

  const gradeSubmission = (studentName: string, variantId: string, score: number, checkedBy: string) => {
    const newSubmissions = submissions.map(s => {
      if (s.studentName === studentName && s.variantId === variantId) {
        return {
          ...s,
          score,
          checkedBy,
          canRetake: score < 45
        };
      }
      return s;
    });
    saveSubmissions(newSubmissions);
  };

  const allowRetake = (studentName: string, variantId: string) => {
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

  return { submissions, addSubmission, gradeSubmission, allowRetake };
};
