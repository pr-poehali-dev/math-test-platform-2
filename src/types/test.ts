export interface Question {
  id: number;
  text: string;
  answer: string;
}

export interface TestVariant {
  id: string;
  name: string;
  grade: number;
  subject: string;
  questions: Question[];
}

export interface StudentSubmission {
  studentName: string;
  variantId: string;
  answers: { [key: number]: string };
  submittedAt: Date;
  score?: number;
  checkedBy?: string;
  isLocked: boolean;
  canRetake: boolean;
}

export interface User {
  name: string;
  role: 'student' | 'teacher';
}
