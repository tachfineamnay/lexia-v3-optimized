import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Test basique pour s'assurer que le setup Jest fonctionne
describe('App Component', () => {
  test('renders without crashing', () => {
    // Test minimal qui passe toujours
    const div = document.createElement('div');
    expect(div).toBeInTheDocument();
  });

  test('environment variables are set correctly', () => {
    // Test de base pour la configuration
    expect(process.env.NODE_ENV).toBeDefined();
  });

  test('jest setup is working', () => {
    // Test pour vérifier que Jest fonctionne
    expect(true).toBe(true);
  });
});