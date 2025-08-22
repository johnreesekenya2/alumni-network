import { LoginData, ForgotPasswordData, ResetPasswordData, VerificationData, User } from "@shared/schema";

const API_BASE = '';

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

class AuthService {
  private state: AuthState = {
    user: null,
    token: localStorage.getItem('auth_token'),
    isAuthenticated: false
  };

  constructor() {
    // Initialize with token from localStorage if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      this.state.token = token;
      this.state.isAuthenticated = true; // Assume authenticated if token exists
      this.checkAuthStatus(); // Verify in background
    }
  }

  private async checkAuthStatus() {
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        const response = await fetch('/api/profile/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.ok) {
          const user = await response.json();
          this.state = {
            user,
            token,
            isAuthenticated: true
          };
          // Trigger a custom event to notify components
          window.dispatchEvent(new CustomEvent('auth-state-changed', { detail: this.state }));
        } else if (response.status === 401 || response.status === 403) {
          // Only logout on authentication errors, not server errors
          this.logout();
        }
        // For other errors (500, network issues), keep user logged in
      } catch (error) {
        // Network errors - keep user logged in, they'll be checked again later
        console.warn('Auth check failed due to network error, keeping user logged in:', error);
      }
    }
  }

  async login(data: LoginData) {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Login failed');
    }

    localStorage.setItem('auth_token', result.token);
    this.state = {
      user: result.user,
      token: result.token,
      isAuthenticated: true
    };

    // Notify components of auth state change
    window.dispatchEvent(new CustomEvent('auth-state-changed', { detail: this.state }));

    return result;
  }

  async register(data: any) {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Registration failed');
    }

    return result;
  }

  async verifyEmail(email: string, code: string) {
    const response = await fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code })
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Verification failed');
    }

    // If verification is successful and we get a token, store it and update state
    if (result.token) {
      console.log('Storing token after verification:', result.token);
      localStorage.setItem('auth_token', result.token);
      this.state = {
        user: result.user,
        token: result.token,
        isAuthenticated: true
      };
      console.log('Auth state updated:', this.state);
    } else {
      console.log('No token received in verification response:', result);
    }

    return result;
  }

  async resendCode(email: string) {
    const response = await fetch('/api/auth/resend-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to resend code');
    }

    return result;
  }

  async forgotPassword(data: ForgotPasswordData) {
    const response = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to send reset code');
    }

    return result;
  }

  async resetPassword(email: string, data: ResetPasswordData) {
    const response = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, email })
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Password reset failed');
    }

    return result;
  }

  logout() {
    localStorage.removeItem('auth_token');
    this.state = {
      user: null,
      token: null,
      isAuthenticated: false
    };
    
    // Notify components of auth state change
    window.dispatchEvent(new CustomEvent('auth-state-changed', { detail: this.state }));
  }

  getState(): AuthState {
    return { ...this.state };
  }

  getToken(): string | null {
    const token = this.state.token || localStorage.getItem('auth_token');
    console.log('Getting token:', token);
    return token;
  }

  isAuthenticated(): boolean {
    return this.state.isAuthenticated;
  }

  getUser(): User | null {
    return this.state.user;
  }
}

export const authService = new AuthService();
