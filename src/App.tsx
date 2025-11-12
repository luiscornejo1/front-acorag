import { useState, useRef } from "react";
import SearchBar from "./components/SearchBar";
import ResultsList from "./components/ResultsList";
import ChatAssistant from "./components/ChatAssistant";
import DocumentUploader from "./components/DocumentUploader";
import { SystemStatus, type SystemState } from "./components/SystemStatus";
import { search, type SearchRow } from "./api";
import "./App.css";

export default function App() {
  const [rows, setRows] = useState<SearchRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'search' | 'chat' | 'upload'>('search');
  const [error, setError] = useState<string | null>(null);
  
  // Refs para navegación con teclado
  const searchBarRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  
  // Estado del sistema para feedback visual - Principio #3: Feedback y Visibilidad
  const [systemState, setSystemState] = useState<SystemState>({
    status: 'idle',
    message: 'Sistema listo',
  });

  const onSubmit = async (q: string, projectId?: string) => {
    setLoading(true);
    setError(null);
    
    // Actualizar estado a "cargando" - Principio #3: Retroalimentación inmediata
    setSystemState({
      status: 'loading',
      message: 'Buscando documentos...',
      details: q ? `Búsqueda: "${q}"` : `Búsqueda por Project ID: ${projectId}`,
      progress: 0,
    });

    try {
      // Simular progreso para mejorar UX
      const progressInterval = setInterval(() => {
        setSystemState(prev => ({
          ...prev,
          progress: Math.min((prev.progress || 0) + 15, 90)
        }));
      }, 200);

      // Enviar búsqueda - el backend requiere 'query' siempre (puede ser string vacío)
      const data = await search({ 
        query: q || "", 
        project_id: projectId, 
        top_k: 8, 
        probes: 10 
      });
      
      clearInterval(progressInterval);
      setRows(data);
      
      // Estado de éxito - Principio #3: Feedback
      setSystemState({
        status: 'success',
        message: 'Búsqueda completada',
        details: `Se encontraron ${data.length} resultados`,
        progress: 100,
      });

      // Enfocar resultados para accesibilidad
      setTimeout(() => {
        resultsRef.current?.focus();
      }, 100);

      // Auto-limpiar después de 3 segundos
      setTimeout(() => {
        setSystemState({ status: 'idle', message: 'Sistema listo' });
      }, 3000);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setError(errorMessage);
      
      // Estado de error - Principio #8: Prevención de errores
      setSystemState({
        status: 'error',
        message: 'Error en la búsqueda',
        details: errorMessage,
      });
      setRows([]);

      // Limpiar error después de 5 segundos
      setTimeout(() => {
        setSystemState({ status: 'idle', message: 'Sistema listo' });
      }, 5000);
    } finally {
      setLoading(false);
    }
  };

  // Retry en caso de error - Principio #8: Reversibilidad
  const handleRetry = () => {
    setError(null);
    setSystemState({ status: 'idle', message: 'Sistema listo' });
  };

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

  return (
    <>
      {/* Skip Links - Principio #5: Accesibilidad */}
      <a href="#main-content" className="skip-link">
        Saltar al contenido principal
      </a>
      <a href="#search-bar" className="skip-link">
        Saltar a la búsqueda
      </a>

      <main id="main-content" style={{ maxWidth: 1000, margin: "20px auto", padding: "0 20px" }}>
        {/* Sistema de feedback visual - Principio #3 */}
        <SystemStatus state={systemState} />

        <div className="app-header">
          <h1>Aconex RAG System</h1>
          <div className="mode-toggle" role="tablist" aria-label="Seleccionar modo de interfaz">
            <button 
              className={mode === 'search' ? 'active' : ''} 
              onClick={() => setMode('search')}
              aria-pressed={mode === 'search'}
              aria-label="Modo de búsqueda"
              role="tab"
              aria-selected={mode === 'search'}
            >
              <span aria-hidden="true">🔍</span> Búsqueda
            </button>
            <button 
              className={mode === 'chat' ? 'active' : ''} 
              onClick={() => setMode('chat')}
              aria-pressed={mode === 'chat'}
              aria-label="Modo de chat asistente"
              role="tab"
              aria-selected={mode === 'chat'}
            >
              <span aria-hidden="true">💬</span> Chat Assistant
            </button>
            <button 
              className={mode === 'upload' ? 'active' : ''} 
              onClick={() => setMode('upload')}
              aria-pressed={mode === 'upload'}
              aria-label="Modo de subir documentos"
              role="tab"
              aria-selected={mode === 'upload'}
            >
              <span aria-hidden="true">📤</span> Subir Documento
            </button>
          </div>
        </div>

        {mode === 'search' ? (
          <div className="search-mode">
            <div id="search-bar" ref={searchBarRef} tabIndex={-1}>
              <SearchBar onSubmit={onSubmit} />
            </div>

            {/* Error state con retry - Principio #8: Reversibilidad */}
            {error && !loading && (
              <div className="error-container" role="alert" aria-live="assertive">
                <div className="error-icon" aria-hidden="true">⚠️</div>
                <div className="error-content">
                  <h3 className="error-title">Error en la búsqueda</h3>
                  <p className="error-message">{error}</p>
                  <button onClick={handleRetry} className="retry-button">
                    🔄 Intentar nuevamente
                  </button>
                </div>
              </div>
            )}

            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner" aria-hidden="true"></div>
                <p className="loading">Buscando…</p>
              </div>
            ) : (
              <div ref={resultsRef} tabIndex={-1} aria-live="polite" aria-atomic="false">
                <ResultsList rows={rows} />
              </div>
            )}
          </div>
        ) : mode === 'chat' ? (
          <div className="chat-mode">
            <ChatAssistant apiUrl={apiUrl} />
          </div>
        ) : (
          <div className="upload-mode">
            <DocumentUploader 
              onUploadSuccess={() => {
                setSystemState({
                  status: 'success',
                  message: 'Documento ingestado exitosamente',
                  details: 'Ahora puedes buscarlo en la pestaña de Búsqueda',
                });
                setTimeout(() => {
                  setSystemState({ status: 'idle', message: 'Sistema listo' });
                }, 4000);
              }}
            />
          </div>
        )}
      </main>
    </>
  );
}
