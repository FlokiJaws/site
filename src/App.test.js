import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import App from './App';

// Mock des services Firebase
jest.mock('./firebase/config', () => ({
  auth: {},
  db: {},
  storage: {}
}));

// Test si l'application se charge correctement
test('renders application with navbar', () => {
  render(
    <AuthProvider>
      <App />
    </AuthProvider>
  );
  const logoElement = screen.getByText(/GamerClash/i);
  expect(logoElement).toBeInTheDocument();
});

// Test de navigation
test('navigates to gaming page when gaming link is clicked', async () => {
  render(
    <AuthProvider>
      <App />
    </AuthProvider>
  );
  
  // Trouver et cliquer sur le lien Gaming
  const gamingLink = screen.getByText(/Gaming/i);
  fireEvent.click(gamingLink);
  
  // Vérifier que nous sommes sur la page Gaming
  await waitFor(() => {
    expect(screen.getByText(/Catégorie Gaming/i)).toBeInTheDocument();
  });
});

// Test fonctionnel du panier
test('adds product to cart when add button is clicked', async () => {
  // Mock de l'authentification utilisateur
  const mockUser = { uid: 'testuser123' };
  
  // Mock du service d'ajout au panier
  jest.mock('./firebase/cart', () => ({
    addToCart: jest.fn().mockResolvedValue({ success: true })
  }));
  
  render(
    <AuthProvider value={{ currentUser: mockUser }}>
      <App />
    </AuthProvider>
  );
  
  // Naviguer vers une page produit
  // Cliquer sur le bouton d'ajout au panier
  // Vérifier que le produit a été ajouté
});

// Test des routes protégées
test('redirects to login when accessing protected route without authentication', async () => {
  render(
    <AuthProvider value={{ currentUser: null }}>
      <App />
    </AuthProvider>
  );
  
  // Tenter d'accéder à une route protégée
  window.history.pushState({}, '', '/profile');
  
  // Vérifier la redirection vers la page de connexion
  await waitFor(() => {
    expect(screen.getByText(/Connexion/i)).toBeInTheDocument();
  });
});