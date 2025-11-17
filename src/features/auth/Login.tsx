import { useState, type FormEvent } from 'react';
import { login as apiLogin, register as apiRegister, type User } from '../../api';
import './Login.css';

interface LoginProps {
  onLogin: (token: string, user: User) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isRegisterMode) {
        // Registro
        const response = await apiRegister({
          email,
          password,
          full_name: fullName
        });
        onLogin(response.access_token, response.user);
      } else {
        // Login
        const response = await apiLogin({
          email,
          password
        });
        onLogin(response.access_token, response.user);
      }
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

  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode);
    setError('');
    setEmail('');
    setPassword('');
    setFullName('');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Aconex RAG System</h1>
          <p>
            {isRegisterMode 
              ? 'Crea una cuenta para continuar' 
              : 'Ingresa tus credenciales para continuar'}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          {isRegisterMode && (
            <div className="form-group">
              <label htmlFor="fullname">Nombre Completo</label>
              <input
                type="text"
                id="fullname"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Juan Pérez"
                required
                autoComplete="name"
                autoFocus={isRegisterMode}
                minLength={2}
              />
            </div>
          )}

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
              autoFocus={!isRegisterMode}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isRegisterMode ? 'Mínimo 6 caracteres' : 'Tu contraseña'}
              required
              autoComplete={isRegisterMode ? 'new-password' : 'current-password'}
              minLength={6}
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
            {isLoading 
              ? 'Procesando...' 
              : isRegisterMode 
                ? 'Registrarse' 
                : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="login-toggle">
          <button 
            type="button" 
            onClick={toggleMode}
            className="toggle-button"
          >
            {isRegisterMode 
              ? '¿Ya tienes cuenta? Inicia sesión' 
              : '¿No tienes cuenta? Regístrate'}
          </button>
        </div>

        <div className="login-footer">
          <p>Sistema de búsqueda y gestión documental</p>
        </div>
      </div>
    </div>
  );
}
