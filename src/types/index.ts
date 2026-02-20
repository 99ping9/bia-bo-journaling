export interface User {
    id: string;
    username: string;
    avatar?: string;
    bg_color?: string;
    is_column_challenge: boolean; // New field
}

export type SubmissionType = 'journal' | 'account' | 'thread' | 'mate' | 'column';

export interface DailySubmission {
    id: string;
    user_id: string;
    date: string;
    type: SubmissionType;
    content?: string; // URL or Note
    amount?: number; // For Account Book
    created_at: string;
}

export const SUBMISSION_TYPES: { id: SubmissionType; label: string; icon?: string }[] = [
    { id: 'journal', label: '저널링' },
    { id: 'account', label: '가계부' },
    { id: 'thread', label: '스레드' },
    { id: 'mate', label: '메이트콜' },
    { id: 'column', label: '칼럼' },
];
