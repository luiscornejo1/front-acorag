import React, { useState } from 'react';
import './DocumentUpload.css';

interface UploadResult {
  document_id: string;
  chunks_created: number;
  text_length: number;
  filename: string;
}

interface QueryResult {
  question: string;
  answer: string;
  sources: any[];
}

const DocumentUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [question, setQuestion] = useState('');
  const [metadata, setMetadata] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [error, setError] = useState('');
  const [uploadMode, setUploadMode] = useState<'simple' | 'with-query'>('simple');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Por favor selecciona un archivo');
      return;
    }

    setLoading(true);
    setError('');
    setUploadResult(null);
    setQueryResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      if (metadata) {
        try {
          JSON.parse(metadata); // Validar JSON
          formData.append('metadata', metadata);
        } catch {
          setError('Metadata debe ser un JSON válido');
          setLoading(false);
          return;
        }
      }

      if (uploadMode === 'with-query') {
        if (!question) {
          setError('Por favor ingresa una pregunta');
          setLoading(false);
          return;
        }
        formData.append('question', question);
      }

      const endpoint = uploadMode === 'simple' ? '/upload' : '/upload-and-query';
      const API_URL = import.meta.env.VITE_API_URL || 'https://back-acorag-production.up.railway.app';
      
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al subir el archivo');
      }

      const result = await response.json();
      
      if (uploadMode === 'simple') {
        setUploadResult(result.data);
      } else {
        setUploadResult(result.upload_result);
        setQueryResult(result.query_result);
      }

    } catch (err: any) {
      setError(err.message || 'Error al procesar el archivo');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setQuestion('');
    setMetadata('');
    setUploadResult(null);
    setQueryResult(null);
    setError('');
  };

  return (
    <div className="document-upload">
      <div className="upload-header">
        <h2>📤 Subir Documento Nuevo</h2>
        <p>Sube documentos PDF, TXT, DOCX o JSON para agregarlos al sistema</p>
      </div>

      <div className="upload-mode-selector">
        <button
          className={`mode-btn ${uploadMode === 'simple' ? 'active' : ''}`}
          onClick={() => setUploadMode('simple')}
        >
          📄 Solo Subir
        </button>
        <button
          className={`mode-btn ${uploadMode === 'with-query' ? 'active' : ''}`}
          onClick={() => setUploadMode('with-query')}
        >
          💬 Subir y Consultar
        </button>
      </div>

      <div className="upload-form">
        <div className="form-group">
          <label htmlFor="file-input">
            <span className="label-icon">📁</span>
            Seleccionar archivo
          </label>
          <input
            id="file-input"
            type="file"
            accept=".pdf,.txt,.docx,.json"
            onChange={handleFileChange}
            disabled={loading}
          />
          {file && (
            <div className="file-preview">
              <span className="file-icon">📄</span>
              <span className="file-name">{file.name}</span>
              <span className="file-size">
                ({(file.size / 1024).toFixed(2)} KB)
              </span>
            </div>
          )}
        </div>

        {uploadMode === 'with-query' && (
          <div className="form-group">
            <label htmlFor="question-input">
              <span className="label-icon">❓</span>
              Pregunta sobre el documento
            </label>
            <input
              id="question-input"
              type="text"
              placeholder="Ej: ¿Cuál es la fecha del cronograma?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={loading}
            />
          </div>
        )}

        <div className="form-group">
          <label htmlFor="metadata-input">
            <span className="label-icon">🏷️</span>
            Metadata (opcional - JSON)
          </label>
          <textarea
            id="metadata-input"
            placeholder='{"project": "Proyecto A", "type": "plano", "category": "estructural"}'
            value={metadata}
            onChange={(e) => setMetadata(e.target.value)}
            rows={3}
            disabled={loading}
          />
        </div>

        <div className="form-actions">
          <button
            className="btn-upload"
            onClick={handleUpload}
            disabled={loading || !file}
          >
            {loading ? (
              <>
                <span className="spinner">⏳</span>
                Procesando...
              </>
            ) : (
              <>
                <span>🚀</span>
                {uploadMode === 'simple' ? 'Subir Documento' : 'Subir y Consultar'}
              </>
            )}
          </button>
          <button
            className="btn-reset"
            onClick={resetForm}
            disabled={loading}
          >
            🔄 Limpiar
          </button>
        </div>

        {error && (
          <div className="message error">
            <span className="icon">❌</span>
            {error}
          </div>
        )}

        {uploadResult && (
          <div className="message success">
            <span className="icon">✅</span>
            <div className="result-details">
              <h3>Documento subido exitosamente</h3>
              <ul>
                <li><strong>Archivo:</strong> {uploadResult.filename}</li>
                <li><strong>ID:</strong> {uploadResult.document_id}</li>
                <li><strong>Chunks creados:</strong> {uploadResult.chunks_created}</li>
                <li><strong>Caracteres:</strong> {uploadResult.text_length.toLocaleString()}</li>
              </ul>
            </div>
          </div>
        )}

        {queryResult && (
          <div className="query-result">
            <h3>💬 Respuesta a tu consulta</h3>
            <div className="question">
              <strong>Pregunta:</strong> {queryResult.question}
            </div>
            <div className="answer">
              <strong>Respuesta:</strong>
              <p>{queryResult.answer}</p>
            </div>
            {queryResult.sources.length > 0 && (
              <div className="sources">
                <strong>📚 Fuentes ({queryResult.sources.length}):</strong>
                <ul>
                  {queryResult.sources.slice(0, 3).map((source, idx) => (
                    <li key={idx}>
                      {source.title || 'Sin título'} (Score: {source.score?.toFixed(3)})
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="upload-info">
        <h4>ℹ️ Información</h4>
        <ul>
          <li><strong>Formatos soportados:</strong> PDF, TXT, DOCX, JSON</li>
          <li><strong>Procesamiento:</strong> Extracción de texto + División en chunks + Generación de embeddings</li>
          <li><strong>Búsqueda inmediata:</strong> El documento estará disponible instantáneamente</li>
          <li><strong>Metadata:</strong> Añade información adicional para mejorar las búsquedas</li>
        </ul>
      </div>
    </div>
  );
};

export default DocumentUpload;
