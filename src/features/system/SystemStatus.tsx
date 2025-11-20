/**
 * SystemStatus Component
 * 
 * Principios de HCI aplicados:
 * #3: Feedback y Visibilidad - Indicadores de estado claros
 * #5: Accesibilidad - ARIA labels y roles
 * #9: Mejoras en UX - Animaciones significativas
 */

import React from 'react';
import './SystemStatus.css';

export interface SystemState {
  status: 'idle' | 'loading' | 'error' | 'success';
  message: string;
  progress?: number;
  details?: string;
}

interface SystemStatusProps {
  state: SystemState;
}

export const SystemStatus: React.FC<SystemStatusProps> = ({ state }) => {
  const getStatusIcon = () => {
    switch (state.status) {
      case 'loading':
        return '⌛';
      case 'error':
        return '⚠️';
      case 'success':
        return '✅';
      default:
        return '🔄';
    }
  };

  const getAriaLabel = () => {
    switch (state.status) {
      case 'loading':
        return 'Cargando';
      case 'error':
        return 'Error';
      case 'success':
        return 'Éxito';
      default:
        return 'Sistema listo';
    }
  };

  // No mostrar si está inactivo
  if (state.status === 'idle') {
    return null;
  }

  return (
    <div 
      className={`system-status ${state.status}`} 
      role="status" 
      aria-live="polite"
      aria-label={getAriaLabel()}
    >
      <div className="status-icon" aria-hidden="true">
        {getStatusIcon()}
      </div>
      
      <div className="status-content">
        <div className="status-message">{state.message}</div>
        {state.details && (
          <div className="status-details">{state.details}</div>
        )}
      </div>

      {state.status === 'loading' && state.progress !== undefined && (
        <div className="progress-bar-container">
          <div 
            className="progress-bar" 
            style={{ width: `${state.progress}%` }}
            role="progressbar"
            aria-valuenow={state.progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Progreso: ${state.progress}%`}
          />
        </div>
      )}
    </div>
  );
};
