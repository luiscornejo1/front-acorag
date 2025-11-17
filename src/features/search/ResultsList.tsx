/**
 * ResultsList Component - Enhanced with Newell's Principles
 * 
 * Implementa:
 * - Carga Cognitiva: Paginación de 10 resultados máximo por página
 * - Gestión de Información: Filtrado multinivel + ordenamiento flexible
 * - Flujo: Acciones rápidas + navegación clara
 * - Accesibilidad: ARIA + navegación por teclado
 */

import { useState, useMemo } from "react";
import type { SearchRow } from "../../api";
import { ResultCard } from "./ResultCard";
import { DocumentSummary } from "../upload/DocumentSummary";
import "./ResultsList.css";

type SortBy = 'relevance' | 'date' | 'type' | 'title';
type FilterCategory = 'all' | 'planos' | 'contratos' | 'reportes' | 'otros';

interface ResultsListProps {
  rows: SearchRow[];
}

export default function ResultsList({ rows }: ResultsListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortBy>('relevance');
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('all');
  const [itemsPerPage] = useState(10); // Máximo 10 por página - Principio de Carga Cognitiva

  // Filtrar resultados por categoría
  const filteredRows = useMemo(() => {
    if (filterCategory === 'all') return rows;

    return rows.filter(row => {
      const cat = row.category?.toLowerCase() || '';
      const type = row.doc_type?.toLowerCase() || '';
      
      switch (filterCategory) {
        case 'planos':
          return cat.includes('plan') || type.includes('drawing') || type.includes('plan');
        case 'contratos':
          return cat.includes('contract') || type.includes('contract');
        case 'reportes':
          return cat.includes('report') || type.includes('report');
        default:
          return true;
      }
    });
  }, [rows, filterCategory]);

  // Ordenar resultados
  const sortedRows = useMemo(() => {
    const sorted = [...filteredRows];

    switch (sortBy) {
      case 'relevance':
        return sorted.sort((a, b) => b.score - a.score);
      case 'date':
        return sorted.sort((a, b) => {
          const dateA = a.date_modified ? new Date(a.date_modified).getTime() : 0;
          const dateB = b.date_modified ? new Date(b.date_modified).getTime() : 0;
          return dateB - dateA;
        });
      case 'type':
        return sorted.sort((a, b) => (a.doc_type || '').localeCompare(b.doc_type || ''));
      case 'title':
        return sorted.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
      default:
        return sorted;
    }
  }, [filteredRows, sortBy]);

  // Paginación
  const totalPages = Math.ceil(sortedRows.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRows = sortedRows.slice(startIndex, endIndex);

  // Resetear a página 1 cuando cambian filtros
  useMemo(() => {
    setCurrentPage(1);
  }, [filterCategory, sortBy]);

  // Navegar páginas con teclado
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!rows?.length) {
    return (
      <div className="no-results-container">
        <div className="no-results-icon" aria-hidden="true">🔍</div>
        <p className="no-results">Sin resultados encontrados.</p>
        <p className="no-results-hint">Intenta con otros términos de búsqueda</p>
      </div>
    );
  }

  return (
    <div className="results-container">
      {/* Header con contador y controles */}
      <div className="results-header">
        <div className="results-count-section">
          <h2 className="results-count">
            <span className="count-number">{filteredRows.length}</span>
            <span className="count-label">
              {filteredRows.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
            </span>
          </h2>
          {filteredRows.length !== rows.length && (
            <span className="filter-indicator">
              (filtrado de {rows.length} totales)
            </span>
          )}
        </div>

        {/* Controles de Filtrado y Ordenamiento */}
        <div className="results-controls">
          {/* Filtro por categoría */}
          <div className="filter-group">
            <label htmlFor="category-filter" className="filter-label">
              <span className="filter-icon">🏷️</span>
              Categoría:
            </label>
            <select
              id="category-filter"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as FilterCategory)}
              className="filter-select"
              aria-label="Filtrar por categoría"
            >
              <option value="all">Todas</option>
              <option value="planos">Planos</option>
              <option value="contratos">Contratos</option>
              <option value="reportes">Reportes</option>
              <option value="otros">Otros</option>
            </select>
          </div>

          {/* Ordenamiento */}
          <div className="filter-group">
            <label htmlFor="sort-by" className="filter-label">
              <span className="filter-icon">⚡</span>
              Ordenar por:
            </label>
            <select
              id="sort-by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="filter-select"
              aria-label="Ordenar resultados"
            >
              <option value="relevance">Relevancia</option>
              <option value="date">Fecha</option>
              <option value="type">Tipo</option>
              <option value="title">Título</option>
            </select>
          </div>
        </div>
      </div>

      {/* Resumen del documento más relevante (solo primera página) */}
      {currentPage === 1 && sortedRows.length > 0 && (
        <DocumentSummary 
          document={sortedRows[0]}
          totalResults={sortedRows.length}
        />
      )}

      {/* Lista de resultados paginada */}
      <div className="results-list" role="list" aria-live="polite">
        {currentRows.map((result, index) => (
          <ResultCard 
            key={`${result.document_id}-${index}`}
            result={result}
            index={startIndex + index}
          />
        ))}
      </div>

      {/* Paginación - Principio de Carga Cognitiva */}
      {totalPages > 1 && (
        <nav className="pagination" role="navigation" aria-label="Paginación de resultados">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="pagination-button"
            aria-label="Página anterior"
          >
            ← Anterior
          </button>

          <div className="pagination-numbers">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              // Mostrar solo páginas cercanas (max 7 botones)
              const showPage = 
                page === 1 ||
                page === totalPages ||
                Math.abs(page - currentPage) <= 2;

              if (!showPage) {
                if (page === currentPage - 3 || page === currentPage + 3) {
                  return <span key={page} className="pagination-ellipsis">...</span>;
                }
                return null;
              }

              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`pagination-number ${page === currentPage ? 'active' : ''}`}
                  aria-label={`Página ${page}`}
                  aria-current={page === currentPage ? 'page' : undefined}
                >
                  {page}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="pagination-button"
            aria-label="Página siguiente"
          >
            Siguiente →
          </button>

          <div className="pagination-info">
            Mostrando {startIndex + 1}-{Math.min(endIndex, filteredRows.length)} de {filteredRows.length}
          </div>
        </nav>
      )}
    </div>
  );
}
