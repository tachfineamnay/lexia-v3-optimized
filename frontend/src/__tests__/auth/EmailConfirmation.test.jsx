import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, useParams } from 'react-router-dom';
import EmailConfirmation from '../../pages/EmailConfirmation';
import axios from 'axios';

// Mock d'axios
jest.mock('axios');

// Mock de useParams
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn()
}));

describe('EmailConfirmation Component', () => {
  const mockToken = 'valid-verification-token';

  beforeEach(() => {
    useParams.mockReturnValue({ token: mockToken });
  });

  const renderEmailConfirmation = () => {
    return render(
      <BrowserRouter>
        <EmailConfirmation />
      </BrowserRouter>
    );
  };

  it('renders loading state initially', () => {
    renderEmailConfirmation();

    expect(screen.getByText(/vérification de votre email/i)).toBeInTheDocument();
    expect(screen.getByText(/veuillez patienter/i)).toBeInTheDocument();
  });

  it('handles successful email verification', async () => {
    axios.post.mockResolvedValueOnce({ data: { message: 'Email vérifié avec succès' } });
    renderEmailConfirmation();

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/auth/verify-email', {
        token: mockToken
      });
      expect(screen.getByText(/email vérifié avec succès/i)).toBeInTheDocument();
      expect(screen.getByText(/vous pouvez maintenant vous connecter/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /se connecter/i })).toBeInTheDocument();
    });
  });

  it('handles invalid verification token', async () => {
    axios.post.mockRejectedValueOnce({
      response: {
        data: {
          error: 'Token de vérification invalide ou expiré'
        }
      }
    });

    renderEmailConfirmation();

    await waitFor(() => {
      expect(screen.getByText(/token de vérification invalide ou expiré/i)).toBeInTheDocument();
      expect(screen.getByText(/veuillez demander un nouveau lien/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /demander un nouveau lien/i })).toBeInTheDocument();
    });
  });

  it('handles network error', async () => {
    axios.post.mockRejectedValueOnce(new Error('Network error'));

    renderEmailConfirmation();

    await waitFor(() => {
      expect(screen.getByText(/une erreur est survenue/i)).toBeInTheDocument();
      expect(screen.getByText(/veuillez réessayer plus tard/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /retour à l'accueil/i })).toBeInTheDocument();
    });
  });

  it('handles missing token', () => {
    useParams.mockReturnValue({ token: undefined });
    renderEmailConfirmation();

    expect(screen.getByText(/lien de vérification invalide/i)).toBeInTheDocument();
    expect(screen.getByText(/veuillez demander un nouveau lien/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /demander un nouveau lien/i })).toBeInTheDocument();
  });
}); 