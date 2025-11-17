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
import type { SearchRow } from '../../api';
import './ResultCard.css';

interface ResultCardProps {
  result: SearchRow;
  index: number;
}

export const ResultCard: React.FC<ResultCardProps> = ({ result, index }) => {
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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

  // Obtener icono por tipo
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

  // Extracto de contenido
  const getExcerpt = (snippet: string | null) => {
    if (!snippet) return 'No hay contenido disponible para vista previa.';
    return snippet.length > 250 
      ? snippet.substring(0, 250) + '...'
      : snippet;
  };

  const handleOpenPdf = async () => {
    if (!result.filename || !result.file_type) {
      alert('⚠️ Este documento no tiene un archivo asociado');
      return;
    }
    setLoadingPdf(true);
    try {
      const url = `${API_URL}/document/${result.document_id}/file`;
      window.open(url, '_blank');
    } catch (err) {
      console.error('Error opening PDF:', err);
      alert('❌ Error al abrir el archivo');
    } finally {
      setLoadingPdf(false);
    }
  };

  return (
    <div className="summary-card" style={{ marginBottom: '1.5rem', animationDelay: `${index * 50}ms` }}>
      {/* Información principal */}
      <div className="summary-main">
        <div className="doc-icon-large">
          {getDocIcon(result.doc_type)}
        </div>
        
        <div className="doc-info">
          <h2 className="doc-title" style={{ color: '#1f2937', fontSize: '1.25rem' }}>
            {result.title || 'Sin título'}
          </h2>
          
          <div className="doc-meta-grid">
            <div className="meta-item">
              <span className="meta-label" style={{ color: '#6b7280' }}>📋 Número:</span>
              <span className="meta-value" style={{ color: '#1f2937' }}>
                {result.number || 'N/A'}
              </span>
            </div>
            
            <div className="meta-item">
              <span className="meta-label" style={{ color: '#6b7280' }}>🏢 Proyecto:</span>
              <span className="meta-value" style={{ color: '#1f2937' }}>
                {result.project_id || 'N/A'}
              </span>
            </div>
            
            <div className="meta-item">
              <span className="meta-label" style={{ color: '#6b7280' }}>📂 Categoría:</span>
              <span className="meta-value" style={{ color: '#1f2937' }}>
                {result.category || 'Sin categoría'}
              </span>
            </div>
            
            <div className="meta-item">
              <span className="meta-label" style={{ color: '#6b7280' }}>📅 Fecha:</span>
              <span className="meta-value" style={{ color: '#1f2937' }}>
                {formatDate(result.date_modified)}
              </span>
            </div>
          </div>

          {/* Badges de estado */}
          <div className="doc-badges">
            {result.doc_type && (
              <span className="badge badge-type">
                {getDocIcon(result.doc_type)} {result.doc_type}
              </span>
            )}
            {result.revision && (
              <span className="badge badge-revision">
                🔄 {result.revision}
              </span>
            )}
            {result.file_type && (
              <span className="badge badge-file">
                📎 {result.file_type.toUpperCase()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Vista previa del contenido */}
      <div className="summary-content">
        <h3 className="content-label" style={{ color: '#4b5563' }}>
          <span className="label-icon">👁️</span>
          Vista Previa del Contenido
        </h3>
        <p className="content-excerpt" style={{ color: '#1f2937' }}>
          {getExcerpt(result.snippet)}
        </p>
      </div>

      {/* Botones de acción */}
      <div className="summary-actions">
        {result.filename && result.file_type && (
          <button 
            onClick={handleOpenPdf}
            className="action-btn action-primary"
            style={{ 
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: '600'
            }}
            disabled={loadingPdf}
          >
            <span className="btn-icon">{loadingPdf ? '⏳' : '📄'}</span>
            Ver Documento Completo
          </button>
        )}
        
        <button 
          onClick={() => setShowDetails(!showDetails)}
          className="action-btn action-secondary"
          style={{
            background: 'white',
            color: '#1f2937',
            border: '2px solid #e5e7eb',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: '600'
          }}
        >
          <span className="btn-icon">{showDetails ? '▲' : '▼'}</span>
          {showDetails ? 'Ocultar' : 'Ver'} Detalles Técnicos
        </button>
      </div>

      {/* Detalles técnicos expandibles */}
      {showDetails && (
        <div className="summary-technical-details">
          <h4 className="details-title" style={{ color: '#1f2937' }}>
            <span className="details-icon">⚙️</span>
            Información Técnica Detallada
          </h4>
          
          <div className="details-grid">
            <div className="detail-row">
              <span className="detail-label" style={{ color: '#374151', fontWeight: '600' }}>
                ID del Documento:
              </span>
              <code className="detail-value" style={{ color: '#1f2937' }}>
                {result.document_id}
              </code>
            </div>
            
            {result.number && (
              <div className="detail-row">
                <span className="detail-label" style={{ color: '#374151', fontWeight: '600' }}>
                  Número de Identificación:
                </span>
                <code className="detail-value" style={{ color: '#1f2937' }}>
                  {result.number}
                </code>
              </div>
            )}
            
            {result.filename && (
              <div className="detail-row">
                <span className="detail-label" style={{ color: '#374151', fontWeight: '600' }}>
                  Nombre del Archivo:
                </span>
                <code className="detail-value" style={{ color: '#1f2937' }}>
                  {result.filename}
                </code>
              </div>
            )}
            
            <div className="detail-row">
              <span className="detail-label" style={{ color: '#374151', fontWeight: '600' }}>
                Tipo de Documento:
              </span>
              <span className="detail-value" style={{ color: '#1f2937', fontWeight: '500' }}>
                {result.doc_type || 'No especificado'}
              </span>
            </div>
            
            {result.revision && (
              <div className="detail-row">
                <span className="detail-label" style={{ color: '#374151', fontWeight: '600' }}>
                  Revisión:
                </span>
                <span className="detail-value" style={{ color: '#1f2937', fontWeight: '500' }}>
                  {result.revision}
                </span>
              </div>
            )}
            
            <div className="detail-row">
              <span className="detail-label" style={{ color: '#374151', fontWeight: '600' }}>
                Proyecto Asociado:
              </span>
              <span className="detail-value" style={{ color: '#1f2937', fontWeight: '500' }}>
                {result.project_id || 'N/A'}
              </span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label" style={{ color: '#374151', fontWeight: '600' }}>
                Score de Búsqueda:
              </span>
              <span className="detail-value" style={{ color: '#1f2937', fontWeight: '500' }}>
                <div className="score-bar">
                  <div 
                    className="score-fill" 
                    style={{ width: `${result.score * 100}%` }}
                  />
                </div>
                {(result.score * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
