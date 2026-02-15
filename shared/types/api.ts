import { ResultCode } from './enums';

export interface Result<T> {
    code: string;
    message: string;
    data: T | null;
}

export interface PageResult<T> {
    records: T[];
    total: number;
    size: number;
    current: number;
    pages: number;
}

export class BusinessError extends Error {
    constructor(
        public readonly code: string,
        message: string,
    ) {
        super(message);
        this.name = 'BusinessError';
    }
}
