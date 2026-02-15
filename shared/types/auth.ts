import { User } from './user';

export interface LoginInput {
    username: string;
    password: string;
}

export interface UserAuth {
    accessToken: string;
    tokenType: string;
    expiresIn: number;
    user: User;
}

export interface TokenPayload {
    sub: string; // userId
    username: string;
    scope: string[]; // "ADMIN USER"
    exp: number;
}
export interface RegisterInput {
    username: string;
    password: string;
}
