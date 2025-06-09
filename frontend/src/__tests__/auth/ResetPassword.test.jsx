import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter, useParams } from 'react-router-dom';
import ResetPassword from '../../pages/ResetPassword';
import axios from 'axios';

// Mock d'axios
jest.mock('axios');

// Mock de useParams
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn()
}));

describe('ResetPassword Component', () => {
  const mockNavigate = jest.fn();
  const mockToken = 'valid-reset-token';

  beforeEach(() => {
    useParams.mockReturnValue({ token: mockToken });
    
    // Mock de useNavigate
    jest.mock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useNavigate: () => mockNavigate
    }));
  });

  const renderResetPassword = () => {
    return render(
      <BrowserRouter>
        <ResetPassword />
      </BrowserRouter>
    );
  };

  it('renders reset password form correctly', () => {
    renderResetPassword();

    expect(screen.getByText('Réinitialisation du mot de passe')).toBeInTheDocument();
    expect(screen.getByText(/entrez votre nouveau mot de passe/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/nouveau mot de passe/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirmer le mot de passe/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /réinitialiser/i })).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    renderResetPassword();

    const submitButton = screen.getByRole('button', { name: /réinitialiser/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/le mot de passe est requis/i)).toBeInTheDocument();
      expect(screen.getByText(/la confirmation du mot de passe est requise/i)).toBeInTheDocument();
    });
  });

  it('shows error when passwords do not match', async () => {
    renderResetPassword();

    const passwordInput = screen.getByLabelText(/nouveau mot de passe/i);
    const confirmPasswordInput = screen.getByLabelText(/confirmer le mot de passe/i);

    await userEvent.type(passwordInput, 'newpassword123');
    await userEvent.type(confirmPasswordInput, 'different-password');

    const submitButton = screen.getByRole('button', { name: /réinitialiser/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/les mots de passe ne correspondent pas/i)).toBeInTheDocument();
    });
  });

  it('handles successful password reset', async () => {
    axios.post.mockResolvedValueOnce({ data: { message: 'Mot de passe réinitialisé avec succès' } });
    renderResetPassword();

    const passwordInput = screen.getByLabelText(/nouveau mot de passe/i);
    const confirmPasswordInput = screen.getByLabelText(/confirmer le mot de passe/i);

    await userEvent.type(passwordInput, 'newpassword123');
    await userEvent.type(confirmPasswordInput, 'newpassword123');

    const submitButton = screen.getByRole('button', { name: /réinitialiser/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/auth/reset-password', {
        token: mockToken,
        password: 'newpassword123'
      });
      expect(screen.getByText(/mot de passe réinitialisé avec succès/i)).toBeInTheDocument();
    });
  });

  it('shows error message for invalid token', async () => {
    axios.post.mockRejectedValueOnce({
      response: {
        data: {
          error: 'Token de réinitialisation invalide ou expiré'
        }
      }
    });

    renderResetPassword();

    const passwordInput = screen.getByLabelText(/nouveau mot de passe/i);
    const confirmPasswordInput = screen.getByLabelText(/confirmer le mot de passe/i);

    await userEvent.type(passwordInput, 'newpassword123');
    await userEvent.type(confirmPasswordInput, 'newpassword123');

    const submitButton = screen.getByRole('button', { name: /réinitialiser/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/token de réinitialisation invalide ou expiré/i)).toBeInTheDocument();
    });
  });

  it('disables submit button while submitting', async () => {
    axios.post.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    renderResetPassword();

    const passwordInput = screen.getByLabelText(/nouveau mot de passe/i);
    const confirmPasswordInput = screen.getByLabelText(/confirmer le mot de passe/i);
    const submitButton = screen.getByRole('button', { name: /réinitialiser/i });

    await userEvent.type(passwordInput, 'newpassword123');
    await userEvent.type(confirmPasswordInput, 'newpassword123');
    fireEvent.click(submitButton);

    expect(submitButton).toBeDisabled();
    expect(screen.getByText(/réinitialisation en cours/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });

  it('navigates to login page after successful reset', async () => {
    axios.post.mockResolvedValueOnce({ data: { message: 'Mot de passe réinitialisé avec succès' } });
    renderResetPassword();

    const passwordInput = screen.getByLabelText(/nouveau mot de passe/i);
    const confirmPasswordInput = screen.getByLabelText(/confirmer le mot de passe/i);

    await userEvent.type(passwordInput, 'newpassword123');
    await userEvent.type(confirmPasswordInput, 'newpassword123');

    const submitButton = screen.getByRole('button', { name: /réinitialiser/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });
}); 