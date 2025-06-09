import '@testing-library/jest-dom';

// Mock de l'API axios
jest.mock('axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn()
}));

// Mock du hook useAuth
jest.mock('./hooks/useAuth', () => ({
  useAuth: () => ({
    isAuthenticated: false,
    loading: false,
    user: null,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn()
  }),
  AuthProvider: ({ children }) => children
}));

// Mock du hook useToast
jest.mock('./hooks/useToast', () => ({
  useToast: () => ({
    showToast: jest.fn()
  }),
  ToastProvider: ({ children }) => children
})); 