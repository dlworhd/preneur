export interface User {
    id: string,
    username: string,
    password?: string,
    email: string,
    avatar?: string,
    createdAt: Date,
    updatedAt: Date,
}

export type UserStatus = "INACTIVE" | "ACTIVE" | "BLOCKED";

export interface UserProfile {
    id: string;
    user_id: string;
    email: string;
    nickname: string;
    birth_date: string;
    gender: 'male' | 'female';
    created_at?: string;
    updated_at?: string;
}

export interface AuthUser {
    id: string;
    email?: string;
    user_metadata?: {
        avatar_url?: string;
        email?: string;
        email_verified?: boolean;
        full_name?: string;
        iss?: string;
        name?: string;
        phone_verified?: boolean;
        picture?: string;
        provider_id?: string;
        sub?: string;
    };
}