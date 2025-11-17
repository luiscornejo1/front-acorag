import { useState } from 'react';

/**
 * Hook para manejar la autenticación
 * Por ahora es básico, pero puede expandirse para incluir:
 * - Validación real de credenciales
 * - Tokens JWT
 * - Persistencia en localStorage
 * - Logout
 */
export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = () => {
    setIsAuthenticated(true);
    // TODO: Aquí se puede agregar lógica de autenticación real
  };

  const logout = () => {
    setIsAuthenticated(false);
    // TODO: Limpiar tokens, localStorage, etc.
  };

  return {
    isAuthenticated,
    login,
    logout,
  };
}
