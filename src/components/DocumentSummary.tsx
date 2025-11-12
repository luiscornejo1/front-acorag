/**
 * DocumentSummary Component
 * Muestra un resumen visual y amigable del documento más relevante
 */

import React, { useState } from 'react';
import type { SearchRow } from '../api';
import './DocumentSummary.css';

interface DocumentSummaryProps {
  document: SearchRow;
  totalResults: number;
}

export const DocumentSummary: React.FC<DocumentSummaryProps> = ({ 
  document, 
  totalResults 
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  // Calcular relevancia visual
  const getRelevanceBadge = (score: number) => {
    if (score > 0.7) return {
      class: 'badge-high',
      text: 'Muy Relevante',
      icon: '🎯',
      percentage: Math.round(score * 100)
    };
    if (score > 0.5) return {
      class: 'badge-medium',
      text: 'Relevante',
      icon: '📍',
      percentage: Math.round(score * 100)
    };
    return {
      class: 'badge-low',
      text: 'Posible Match',
      icon: '📌',
      percentage: Math.round(score * 100)
    };
  };

  const relevance = getRelevanceBadge(document.score);

  // Formatear fecha
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Fecha no disponible';
    try {
      return new Date(dateStr).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Fecha no disponible';
    }
  };

  // Obtener icon por tipo de documento
  const getDocIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      'Informe': '📊',
      'Plano': '📐',
      'Especificación': '📋',
      'Procedimiento': '📝',
      'Manual': '📖',
      'Cronograma': '📅',
      'Presupuesto': '💰',
      'Contrato': '📜',
      'default': '📄'
    };
    return icons[type] || icons.default;
  };

  // Extraer extracto relevante (primeras 250 chars)
  const getExcerpt = (snippet: string | null) => {
    if (!snippet) return 'No hay contenido disponible para vista previa.';
    return snippet.length > 250 
      ? snippet.substring(0, 250) + '...'
      : snippet;
  };

  const handleOpenPdf = () => {
    if (document.filename && document.file_type) {
      const url = `${API_URL}/document/${document.document_id}/file`;
      window.open(url, '_blank');
    } else {
      alert('⚠️ Este documento no tiene un archivo PDF asociado');
    }
  };

  return (
    <div className="document-summary-container">
      {/* Header con estadísticas */}
      <div className="summary-header">
        <div className="summary-stats">
          <span className="stat-item">
            <strong>{totalResults}</strong> resultado{totalResults !== 1 ? 's' : ''} encontrado{totalResults !== 1 ? 's' : ''}
          </span>
          <span className="stat-divider">•</span>
          <span className="stat-item">
            Mostrando el más relevante
          </span>
        </div>
      </div>

      {/* Tarjeta principal del documento */}
      <div className="summary-card">
        {/* Relevancia badge flotante */}
        <div className={`relevance-badge ${relevance.class}`}>
          <span className="badge-icon">{relevance.icon}</span>
          <span className="badge-text">{relevance.text}</span>
          <span className="badge-percentage">{relevance.percentage}%</span>
        </div>

        {/* Información principal */}
        <div className="summary-main">
          <div className="doc-icon-large">
            {getDocIcon(document.doc_type)}
          </div>
          
          <div className="doc-info">
            <h2 className="doc-title">{document.title}</h2>
            
            <div className="doc-meta-grid">
              <div className="meta-item">
                <span className="meta-label">📋 Número:</span>
                <span className="meta-value">{document.number || 'N/A'}</span>
              </div>
              
              <div className="meta-item">
                <span className="meta-label">🏢 Proyecto:</span>
                <span className="meta-value">{document.project_id || 'N/A'}</span>
              </div>
              
              <div className="meta-item">
                <span className="meta-label">📂 Categoría:</span>
                <span className="meta-value">{document.category || 'Sin categoría'}</span>
              </div>
              
              <div className="meta-item">
                <span className="meta-label">📅 Fecha:</span>
                <span className="meta-value">{formatDate(document.date_modified)}</span>
              </div>
            </div>

            {/* Badges de estado */}
            <div className="doc-badges">
              {document.doc_type && (
                <span className="badge badge-type">
                  {getDocIcon(document.doc_type)} {document.doc_type}
                </span>
              )}
              {document.revision && (
                <span className="badge badge-revision">
                  🔄 {document.revision}
                </span>
              )}
              {document.file_type && (
                <span className="badge badge-file">
                  📎 {document.file_type.toUpperCase()}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Vista previa del contenido */}
        <div className="summary-content">
          <h3 className="content-label">
            <span className="label-icon">👁️</span>
            Vista Previa del Contenido
          </h3>
          <p className="content-excerpt">
            {getExcerpt(document.snippet)}
          </p>
        </div>

        {/* Botones de acción */}
        <div className="summary-actions">
          {document.filename && document.file_type && (
            <button 
              onClick={handleOpenPdf}
              className="action-btn action-primary"
            >
              <span className="btn-icon">📄</span>
              Ver Documento Completo
            </button>
          )}
          
          <button 
            onClick={() => setShowDetails(!showDetails)}
            className="action-btn action-secondary"
          >
            <span className="btn-icon">{showDetails ? '▲' : '▼'}</span>
            {showDetails ? 'Ocultar' : 'Ver'} Detalles Técnicos
          </button>
        </div>

        {/* Detalles técnicos (expandible) */}
        {showDetails && (
          <div className="summary-technical-details">
            <h4 className="details-title">
              <span className="details-icon">⚙️</span>
              Información Técnica Detallada
            </h4>
            
            <div className="details-grid">
              <div className="detail-row">
                <span className="detail-label">ID del Documento:</span>
                <code className="detail-value">{document.document_id}</code>
              </div>
              
              {document.number && (
                <div className="detail-row">
                  <span className="detail-label">Número de Identificación:</span>
                  <code className="detail-value">{document.number}</code>
                </div>
              )}
              
              {document.filename && (
                <div className="detail-row">
                  <span className="detail-label">Nombre del Archivo:</span>
                  <code className="detail-value">{document.filename}</code>
                </div>
              )}
              
              <div className="detail-row">
                <span className="detail-label">Tipo de Documento:</span>
                <span className="detail-value">{document.doc_type || 'No especificado'}</span>
              </div>
              
              {document.revision && (
                <div className="detail-row">
                  <span className="detail-label">Revisión:</span>
                  <span className="detail-value">{document.revision}</span>
                </div>
              )}
              
              <div className="detail-row">
                <span className="detail-label">Proyecto Asociado:</span>
                <span className="detail-value">{document.project_id || 'N/A'}</span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">Score de Búsqueda:</span>
                <span className="detail-value">
                  <div className="score-bar">
                    <div 
                      className="score-fill" 
                      style={{ width: `${document.score * 100}%` }}
                    />
                  </div>
                  {(document.score * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer informativo */}
      <div className="summary-footer">
        <p className="footer-text">
          💡 <strong>Tip:</strong> Este es el documento con mayor relevancia. 
          Desplázate hacia abajo para ver más resultados.
        </p>
      </div>
    </div>
  );
};
