
export interface User {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    phone: string;
    is_active: boolean;
    is_staff: boolean;
    is_superuser: boolean;
    date_joined?: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface LoginResponse {
    message: string;
    user: User;
}

export interface RefreshResponse {
    message: string;
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

export interface AuthContextType extends AuthState {
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
}
