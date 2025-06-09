import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import ForgotPassword from '../../pages/ForgotPassword';
import axios from 'axios';

// Mock d'axios
jest.mock('axios');

describe('ForgotPassword Component', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    // Mock de useNavigate
    jest.mock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useNavigate: () => mockNavigate
    }));
  });

  const renderForgotPassword = () => {
    return render(
      <BrowserRouter>
        <ForgotPassword />
      </BrowserRouter>
    );
  };

  it('renders forgot password form correctly', () => {
    renderForgotPassword();

    expect(screen.getByText('Mot de passe oublié')).toBeInTheDocument();
    expect(screen.getByText(/entrez votre email pour recevoir un lien de réinitialisation/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /envoyer/i })).toBeInTheDocument();
    expect(screen.getByText(/retour à la connexion/i)).toBeInTheDocument();
  });

  it('shows validation error for empty email', async () => {
    renderForgotPassword();

    const submitButton = screen.getByRole('button', { name: /envoyer/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/l'email est requis/i)).toBeInTheDocument();
    });
  });

  it('shows error for invalid email format', async () => {
    renderForgotPassword();

    const emailInput = screen.getByLabelText(/email/i);
    await userEvent.type(emailInput, 'invalid-email');

    const submitButton = screen.getByRole('button', { name: /envoyer/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/l'email n'est pas valide/i)).toBeInTheDocument();
    });
  });

  it('handles successful password reset request', async () => {
    axios.post.mockResolvedValueOnce({ data: { message: 'Email envoyé avec succès' } });
    renderForgotPassword();

    const emailInput = screen.getByLabelText(/email/i);
    await userEvent.type(emailInput, 'test@example.com');

    const submitButton = screen.getByRole('button', { name: /envoyer/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/auth/forgot-password', {
        email: 'test@example.com'
      });
      expect(screen.getByText(/email envoyé avec succès/i)).toBeInTheDocument();
    });
  });

  it('shows error message for non-existent email', async () => {
    axios.post.mockRejectedValueOnce({
      response: {
        data: {
          error: 'Aucun compte associé à cet email'
        }
      }
    });

    renderForgotPassword();

    const emailInput = screen.getByLabelText(/email/i);
    await userEvent.type(emailInput, 'nonexistent@example.com');

    const submitButton = screen.getByRole('button', { name: /envoyer/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/aucun compte associé à cet email/i)).toBeInTheDocument();
    });
  });

  it('disables submit button while submitting', async () => {
    axios.post.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    renderForgotPassword();

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /envoyer/i });

    await userEvent.type(emailInput, 'test@example.com');
    fireEvent.click(submitButton);

    expect(submitButton).toBeDisabled();
    expect(screen.getByText(/envoi en cours/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });

  it('navigates to login page when clicking back link', () => {
    renderForgotPassword();

    const backLink = screen.getByText(/retour à la connexion/i);
    fireEvent.click(backLink);

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
}); 