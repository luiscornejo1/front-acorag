/**
 * ResultCard Component - Enhanced with Newell's Principles
 * 
 * Principios de HCI aplicados:
 * #7: Gestión de Información - Resultados organizados jerárquicamente
 * #10: Optimización del Rendimiento Cognitivo - Información en chunks manejables
 * #8: Affordances Claras - Estados hover + acciones rápidas
 * #4: Consistencia Visual - Diseño unificado
 * #6: Optimización del Flujo - Acciones rápidas en resultados
 */

import React, { useState } from 'react';
import type { SearchRow } from '../api';
import './ResultCard.css';

interface ResultCardProps {
  result: SearchRow;
  index: number;
}

export const ResultCard: React.FC<ResultCardProps> = ({ result, index }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [copied, setCopied] = useState(false);

  // Calcular nivel de relevancia basado en score
  const getRelevanceLevel = (score: number) => {
    if (score > 0.8) return {
      level: 'high',
      label: 'Alta Relevancia',
      icon: '🎯',
      color: 'var(--success-color, #10b981)'
    };
    if (score > 0.5) return {
      level: 'medium',
      label: 'Relevancia Media',
      icon: '📍',
      color: 'var(--warning-color, #f59e0b)'
    };
    return {
      level: 'low',
      label: 'Baja Relevancia',
      icon: '📌',
      color: 'var(--text-tertiary, #888888)'
    };
  };

  const relevance = getRelevanceLevel(result.score);
  const snippetPreview = result.snippet 
    ? (isExpanded ? result.snippet : result.snippet.substring(0, 200) + (result.snippet.length > 200 ? '...' : ''))
    : '';

  // Acciones rápidas - Principio #6: Optimización del Flujo
  const handleCopyDocId = async () => {
    try {
      await navigator.clipboard.writeText(result.document_id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error copying to clipboard:', err);
    }
  };

  const handleCopyContent = async () => {
    const content = `${result.title}\n\nDoc ID: ${result.document_id}\n\n${result.snippet || ''}`;
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error copying to clipboard:', err);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    try {
      return new Date(dateStr).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return null;
    }
  };

  return (
    <article 
      className={`result-card relevance-${relevance.level}`}
      style={{ animationDelay: `${index * 50}ms` }}
      tabIndex={0}
      role="article"
      aria-label={`Resultado ${index + 1}: ${result.title}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      onFocus={() => setShowActions(true)}
      onBlur={(e) => {
        // Solo ocultar si el focus sale completamente del card
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setShowActions(false);
        }
      }}
    >
      {/* Header con título y metadata */}
      <div className="result-card-header">
        <div className="result-title-section">
          <h3 className="result-title">{result.title}</h3>
          <div className="result-metadata">
            <span className="metadata-tag" title="ID del documento">
              <span className="tag-label">Doc:</span>
              <span className="tag-value">{result.document_id}</span>
            </span>
            {result.doc_type && (
              <span className="metadata-tag" title="Tipo de documento">
                <span className="tag-label">Tipo:</span>
                <span className="tag-value">{result.doc_type}</span>
              </span>
            )}
            {result.category && (
              <span className="metadata-tag" title="Categoría">
                <span className="tag-label">Cat:</span>
                <span className="tag-value">{result.category}</span>
              </span>
            )}
            {result.date_modified && (
              <span className="metadata-tag" title="Fecha de modificación">
                <span className="tag-label">📅</span>
                <span className="tag-value">{formatDate(result.date_modified)}</span>
              </span>
            )}
          </div>
        </div>

        {/* Acciones rápidas - Principio #6 */}
        {showActions && (
          <div className="quick-actions" role="group" aria-label="Acciones rápidas">
            <button
              onClick={handleCopyDocId}
              className="action-button"
              title="Copiar ID del documento"
              aria-label="Copiar ID del documento"
            >
              <span className="action-icon">{copied ? '✓' : '📋'}</span>
              <span className="action-label">Copiar ID</span>
            </button>
            <button
              onClick={handleCopyContent}
              className="action-button"
              title="Copiar contenido completo"
              aria-label="Copiar contenido completo"
            >
              <span className="action-icon">📄</span>
              <span className="action-label">Copiar todo</span>
            </button>
          </div>
        )}
      </div>

      {/* Body con contenido */}
      {snippetPreview && (
        <div className="result-card-body">
          <p className="result-snippet">{snippetPreview}</p>
          {result.snippet && result.snippet.length > 200 && (
            <button 
              className="expand-button"
              onClick={() => setIsExpanded(!isExpanded)}
              aria-expanded={isExpanded}
              aria-label={isExpanded ? 'Ver menos contenido' : 'Ver más contenido'}
            >
              {isExpanded ? '▲ Ver menos' : '▼ Ver más'}
            </button>
          )}
        </div>
      )}

      {/* Footer con indicador de relevancia */}
      <div className="result-card-footer">
        <div className="relevance-indicator" title={`${(result.score * 100).toFixed(1)}% de relevancia`}>
          <span className="relevance-icon" role="img" aria-label={relevance.label}>
            {relevance.icon}
          </span>
          
          <div className="relevance-bar-container">
            <div 
              className="relevance-bar"
              style={{ 
                width: `${result.score * 100}%`,
                backgroundColor: relevance.color
              }}
              role="progressbar"
              aria-valuenow={Math.round(result.score * 100)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Nivel de relevancia: ${Math.round(result.score * 100)}%`}
            />
          </div>
          
          <span className="relevance-score">
            {(result.score * 100).toFixed(1)}%
          </span>
        </div>

        <span className="relevance-label">{relevance.label}</span>
      </div>

      {/* Notificación de copiado */}
      {copied && (
        <div className="copy-notification" role="status" aria-live="polite">
          ✓ Copiado al portapapeles
        </div>
      )}
    </article>
  );
};
