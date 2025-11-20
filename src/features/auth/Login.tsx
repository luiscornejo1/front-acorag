import { useState, type FormEvent } from 'react';
import { login as apiLogin, type User } from '../../api';
import './Login.css';

interface LoginProps {
  onLogin: (token: string, user: User) => void;
  onSwitchToRegister?: () => void;
  onBackToLanding?: () => void;
}

export default function Login({ onLogin, onSwitchToRegister, onBackToLanding }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await apiLogin({
        email,
        password
      });
      onLogin(response.access_token, response.user);
    } catch (err: any) {
      // Manejar errores de la API
      if (err.response) {
        const errorData = await err.response.json();
        setError(errorData.detail || 'Error al autenticar');
      } else {
        setError('Error de conexión. Verifica tu internet.');
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      {onBackToLanding && (
        <button onClick={onBackToLanding} className="back-to-landing" aria-label="Volver al inicio">
          ← Volver
        </button>
      )}
      <div className="login-card">
        <div className="login-header">
          <h1>Aconex RAG System</h1>
          <p>Ingresa tus credenciales para continuar</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              autoComplete="email"
              autoFocus
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Tu contraseña"
              required
              autoComplete="current-password"
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? 'Procesando...' : 'Iniciar Sesión'}
          </button>
        </form>

        {onSwitchToRegister && (
          <div className="login-footer">
            <p>
              ¿No tienes cuenta?{' '}
              <button 
                type="button" 
                onClick={onSwitchToRegister}
                className="switch-button"
                disabled={isLoading}
              >
                Regístrate
              </button>
            </p>
          </div>
        )}

        <div className="login-footer">
          <p>Sistema de búsqueda y gestión documental</p>
        </div>
      </div>
    </div>
  );
}
