import { useState } from "react";
import "./DocumentUploader.css";

interface DocumentUploaderProps {
  onUploadSuccess?: () => void;
}

export default function DocumentUploader({ onUploadSuccess }: DocumentUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [projectId, setProjectId] = useState("");
  const [docType, setDocType] = useState("");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setMessage(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage({ type: "error", text: "Por favor selecciona un archivo" });
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Agregar metadata si existe
      if (projectId || docType) {
        const metadata = {
          ...(projectId && { project_id: projectId }),
          ...(docType && { doc_type: docType }),
        };
        formData.append("metadata", JSON.stringify(metadata));
      }

      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Error al subir el documento");
      }

      const result = await response.json();
      setMessage({
        type: "success",
        text: `✅ ${result.message}. Documento ID: ${result.data?.document_id || "N/A"}`,
      });
      
      // Limpiar formulario
      setFile(null);
      setProjectId("");
      setDocType("");
      
      // Resetear input file
      const fileInput = document.getElementById("file-input") as HTMLInputElement;
      if (fileInput) fileInput.value = "";

      // Notificar éxito
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Error desconocido al subir el archivo",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setMessage(null);
    }
  };

  return (
    <div className="document-uploader">
      <h3>📤 Subir Documento</h3>
      
      <div
        className={`drop-zone ${file ? "has-file" : ""}`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          id="file-input"
          type="file"
          accept=".pdf,.txt,.docx,.json"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
        
        {file ? (
          <div className="file-info">
            <span className="file-icon">📄</span>
            <span className="file-name">{file.name}</span>
            <span className="file-size">({(file.size / 1024).toFixed(1)} KB)</span>
            <button
              className="remove-file"
              onClick={() => setFile(null)}
              disabled={uploading}
            >
              ✕
            </button>
          </div>
        ) : (
          <label htmlFor="file-input" className="drop-label">
            <span className="drop-icon">📁</span>
            <span className="drop-text">Arrastra un archivo o haz clic para seleccionar</span>
            <span className="drop-hint">PDF, TXT, DOCX, JSON (máx. 10 MB)</span>
          </label>
        )}
      </div>

      <div className="metadata-fields">
        <input
          type="text"
          placeholder="Project ID (opcional)"
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          disabled={uploading}
        />
        <input
          type="text"
          placeholder="Tipo de documento (opcional)"
          value={docType}
          onChange={(e) => setDocType(e.target.value)}
          disabled={uploading}
        />
      </div>

      <button
        className="upload-button"
        onClick={handleUpload}
        disabled={!file || uploading}
      >
        {uploading ? (
          <>
            <span className="spinner">⏳</span>
            Subiendo...
          </>
        ) : (
          <>
            <span>📤</span>
            Subir e Ingestar
          </>
        )}
      </button>

      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}
    </div>
  );
}
