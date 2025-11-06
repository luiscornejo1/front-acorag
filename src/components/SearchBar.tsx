/**
 * SearchBar Component - Enhanced with Newell's Principles
 * 
 * Implementa:
 * - GOMS: Autocompletado en tiempo real + shortcuts de teclado
 * - Flujo: Historial de búsquedas + sugerencias
 * - Accesibilidad: ARIA + navegación por teclado
 * - Interacción: Reversibilidad (clear button) + prevención de errores
 */

import { useState, useEffect, useRef } from "react";
import type { KeyboardEvent } from "react";
import "./SearchBar.css";

type Props = { 
  onSubmit: (q: string, projectId?: string) => void;
};

// Sugerencias comunes para documentos de construcción
const COMMON_SUGGESTIONS = [
  "planos estructurales",
  "especificaciones técnicas",
  "contratos",
  "informes de avance",
  "presupuestos",
  "RFI",
  "RFQ",
  "submittals",
  "change orders",
  "daily reports"
];

export default function SearchBar({ onSubmit }: Props) {
  const [q, setQ] = useState("");
  const [project, setProject] = useState<string>("");
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Cargar historial desde localStorage al montar
  useEffect(() => {
    const saved = localStorage.getItem('acorag_search_history');
    if (saved) {
      try {
        setSearchHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading search history:', e);
      }
    }

    // Shortcut global: Ctrl+K para enfocar búsqueda
    const handleGlobalKeydown = (e: globalThis.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleGlobalKeydown);
    return () => window.removeEventListener('keydown', handleGlobalKeydown);
  }, []);

  // Filtrar sugerencias en tiempo real
  useEffect(() => {
    if (q.length < 2) {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const query = q.toLowerCase();
    const allSuggestions = [...new Set([...searchHistory, ...COMMON_SUGGESTIONS])];
    const filtered = allSuggestions
      .filter(s => s.toLowerCase().includes(query) && s !== q)
      .slice(0, 5);

    setFilteredSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
    setSelectedSuggestionIndex(-1);
  }, [q, searchHistory]);

  // Guardar búsqueda en historial
  const saveToHistory = (query: string) => {
    if (!query.trim()) return;
    
    const updated = [
      query,
      ...searchHistory.filter(h => h !== query)
    ].slice(0, 10); // Máximo 10 búsquedas recientes
    
    setSearchHistory(updated);
    localStorage.setItem('acorag_search_history', JSON.stringify(updated));
  };

  // Manejar envío de búsqueda
  const handleSubmit = () => {
    if (!q.trim()) return;
    
    saveToHistory(q);
    onSubmit(q, project || undefined);
    setShowSuggestions(false);
  };

  // Navegación por teclado en sugerencias
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions) {
      if (e.key === 'Enter') {
        handleSubmit();
      } else if (e.key === 'Escape') {
        handleClear();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < filteredSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          selectSuggestion(filteredSuggestions[selectedSuggestionIndex]);
        } else {
          handleSubmit();
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
  };

  // Seleccionar sugerencia
  const selectSuggestion = (suggestion: string) => {
    setQ(suggestion);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
    inputRef.current?.focus();
  };

  // Limpiar búsqueda (reversibilidad)
  const handleClear = () => {
    setQ("");
    setProject("");
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  return (
    <div className="searchbar">
      <div className="search-input-container">
        <input 
          ref={inputRef}
          value={q}
          onChange={e => setQ(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => q.length >= 2 && setShowSuggestions(true)}
          placeholder="Buscar documentos... (Ctrl+K)"
          className="search-input"
          aria-label="Campo de búsqueda"
          aria-autocomplete="list"
          aria-controls="search-suggestions"
          aria-expanded={showSuggestions}
          autoComplete="off"
        />
        
        {q && (
          <button 
            onClick={handleClear}
            className="clear-button"
            aria-label="Limpiar búsqueda"
            title="Limpiar (Esc)"
            type="button"
          >
            ✕
          </button>
        )}

        {/* Sugerencias autocomplete */}
        {showSuggestions && (
          <div 
            ref={suggestionsRef}
            id="search-suggestions"
            className="suggestions-dropdown"
            role="listbox"
          >
            {filteredSuggestions.map((suggestion, index) => (
              <div
                key={suggestion}
                className={`suggestion-item ${index === selectedSuggestionIndex ? 'selected' : ''}`}
                onClick={() => selectSuggestion(suggestion)}
                role="option"
                aria-selected={index === selectedSuggestionIndex}
                onMouseEnter={() => setSelectedSuggestionIndex(index)}
              >
                <span className="suggestion-icon">🔍</span>
                <span className="suggestion-text">{suggestion}</span>
                {searchHistory.includes(suggestion) && (
                  <span className="suggestion-badge">Reciente</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <input 
        value={project}
        onChange={e => setProject(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleSubmit()}
        placeholder="Project ID (opcional)"
        className="project-input"
        aria-label="ID del proyecto (opcional)"
      />

      <button 
        onClick={handleSubmit}
        disabled={!q.trim()}
        className="search-button"
        aria-label="Buscar"
      >
        <span className="button-icon">🔍</span>
        <span className="button-text">Buscar</span>
      </button>

      {/* Hint de shortcuts */}
      <div className="keyboard-hints" aria-live="polite" aria-atomic="true">
        <kbd>Enter</kbd> buscar · <kbd>Esc</kbd> limpiar · <kbd>↑↓</kbd> navegar
      </div>
    </div>
  );
}
