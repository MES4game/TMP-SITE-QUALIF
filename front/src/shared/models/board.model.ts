import { type ReactNode } from 'react';

export interface BoardColumn<T extends object> {
    id: number;
    label: ReactNode | string;
    extractValueToCell: (row: T) => ReactNode | string;
    minWidth?: number;
    align?: 'right' | 'left' | 'center';
}
