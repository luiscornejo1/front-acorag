import { useState, type FormEvent } from 'react';
import './Register.css';

interface RegisterProps {
  onRegister: (token: string, user: User) => void;
  onSwitchToLogin: () => void;
  onBackToLanding?: () => void;
}

interface User {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
}

export default function Register({ onRegister, onSwitchToLogin, onBackToLanding }: RegisterProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateForm = (): boolean => {
    // Validar nombre: solo letras, espacios y acentos, 2-50 caracteres
    if (!fullName.trim()) {
      setError('El nombre es requerido');
      return false;
    }
    const nameRegex = /^[a-zA-ZáéíóúñÁÉÍÓÚÑ\s]{2,50}$/;
    if (!nameRegex.test(fullName.trim())) {
      setError('El nombre debe contener solo letras y espacios (2-50 caracteres)');
      return false;
    }

    // Validar email: dominio debe tener mínimo 3 caracteres después del @
    if (!email.trim()) {
      setError('El email es requerido');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]{3,}\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      setError('Email inválido. El dominio debe tener al menos 3 caracteres');
      return false;
    }

    // Validar contraseña: mínimo 7 caracteres, 1 mayúscula, 1 carácter especial
    if (!password) {
      setError('La contraseña es requerida');
      return false;
    }
    if (password.length < 7) {
      setError('La contraseña debe tener al menos 7 caracteres');
      return false;
    }
    if (!/[A-Z]/.test(password)) {
      setError('La contraseña debe contener al menos una letra mayúscula');
      return false;
    }
    if (!/[!@#$%^&*(),.?":{}|<>_\-+=[\]\\;'/`~]/.test(password)) {
      setError('La contraseña debe contener al menos un carácter especial (!@#$%^&*...)');
      return false;
    }

    // Validar coincidencia de contraseñas
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: fullName.trim(),
          email: email.trim(),
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Error al registrar usuario');
      }

      // Registro exitoso
      onRegister(data.access_token, data.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      {onBackToLanding && (
        <button onClick={onBackToLanding} className="back-to-landing" aria-label="Volver al inicio">
          ← Volver
        </button>
      )}
      <div className="register-card">
        <div className="register-header">
          <h1>Crear Cuenta</h1>
          <p>Regístrate en Aconex RAG System</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label htmlFor="fullName">Nombre Completo</label>
            <input
              type="text"
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ingresa tu nombre completo"
              required
              autoComplete="name"
              autoFocus
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              autoComplete="email"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 7 caracteres, 1 mayúscula, 1 especial"
              required
              autoComplete="new-password"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar Contraseña</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repite tu contraseña"
              required
              autoComplete="new-password"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="error-message" role="alert">
              {error}
            </div>
          )}

          <button type="submit" className="register-button" disabled={loading}>
            {loading ? 'Registrando...' : 'Crear Cuenta'}
          </button>
        </form>

        <div className="register-footer">
          <p>
            ¿Ya tienes cuenta?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="switch-button"
              disabled={loading}
            >
              Inicia Sesión
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
