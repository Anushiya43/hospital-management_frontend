export enum UserRole {
    ADMIN = 'ADMIN',
    DOCTOR = 'DOCTOR',
    PATIENT = 'PATIENT',
}

export enum AuthProvider {
    GOOGLE = 'GOOGLE',
    LOCAL = 'LOCAL',
}

export interface User {
    id: number;
    email?: string;
    phone?: string;
    role: UserRole;
    provider: AuthProvider;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}
