import './LandingPage.css';

interface LandingPageProps {
  onGetStarted: () => void;
  onSignUp: () => void;
}

export default function LandingPage({ onGetStarted, onSignUp }: LandingPageProps) {
  return (
    <div className="landing-page">
      {/* Header */}
      <header className="landing-header">
        <div className="header-container">
          <div className="logo">
            <span className="logo-text">Aconex RAG System</span>
          </div>
          <button onClick={onGetStarted} className="header-login-btn">
            Iniciar Sesión
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <h1 className="hero-title">
          Sistema de Búsqueda Inteligente <br />
          para Documentos Empresariales
        </h1>
        
        <p className="hero-description">
          Encuentra información al instante en tu documentación usando búsqueda semántica 
          con inteligencia artificial. Optimizado para gestión documental de proyectos.
        </p>

        <div className="hero-cta">
          <button onClick={onSignUp} className="btn-primary">
            Comenzar ahora
          </button>
        </div>
      </section>

      {/* What it does */}
      <section className="what-section">
        <div className="content-container">
          <h2 className="section-title">¿Qué hace este sistema?</h2>
          <p className="section-description">
            Aconex RAG System es una plataforma que te permite buscar información en grandes 
            volúmenes de documentos de forma inteligente. En lugar de buscar por palabras exactas, 
            el sistema entiende el contexto de tu pregunta y encuentra los documentos más relevantes.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <div className="content-container">
          <h2 className="section-title">Funcionalidades principales</h2>
          
          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-icon">🔍</div>
              <h3>Búsqueda Semántica</h3>
              <p>
                Busca documentos por concepto, no por palabras exactas. El sistema encuentra 
                información relacionada aunque uses términos diferentes.
              </p>
            </div>

            <div className="feature-item">
              <div className="feature-icon">💬</div>
              <h3>Chat Asistente</h3>
              <p>
                Pregunta en lenguaje natural y obtén respuestas basadas en tus documentos. 
                Como conversar con un experto que conoce toda tu documentación.
              </p>
            </div>

            <div className="feature-item">
              <div className="feature-icon">📄</div>
              <h3>Gestión de Documentos</h3>
              <p>
                Sube y organiza PDFs, documentos Word y archivos Aconex. El sistema procesa 
                automáticamente el contenido para hacerlo buscable.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How to use */}
      <section className="howto-section">
        <div className="content-container">
          <h2 className="section-title">Cómo usar el sistema</h2>
          
          <div className="steps-list">
            <div className="step-item">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Crea tu cuenta e inicia sesión</h3>
                <p>Regístrate con tu email y contraseña para acceder al sistema.</p>
              </div>
            </div>

            <div className="step-item">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Sube tus documentos</h3>
                <p>
                  Ve a la sección "Subir Documento" y carga tus PDFs o archivos. 
                  Puedes agregar metadata como Project ID para mejor organización.
                </p>
              </div>
            </div>

            <div className="step-item">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Busca información</h3>
                <p>
                  Usa la barra de búsqueda para hacer consultas en lenguaje natural. 
                  El sistema encontrará los documentos más relevantes.
                </p>
              </div>
            </div>

            <div className="step-item">
              <div className="step-number">4</div>
              <div className="step-content">
                <h3>Usa el chat asistente (opcional)</h3>
                <p>
                  Cambia al modo "Chat Assistant" para hacer preguntas conversacionales 
                  y obtener respuestas detalladas basadas en tus documentos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="usecases-section">
        <div className="content-container">
          <h2 className="section-title">¿Donde usar el sistema?</h2>
          
          <div className="usecases-grid">
            <div className="usecase-item">
              <h3>📋 Gestión de Proyectos</h3>
              <p>
                Busca rápidamente especificaciones, planos y documentos técnicos 
                de cualquier proyecto.
              </p>
            </div>

            <div className="usecase-item">
              <h3>🏗️ Empresas de Construcción</h3>
              <p>
                Encuentra información en contratos, reportes de avance y 
                documentación de Aconex.
              </p>
            </div>

            <div className="usecase-item">
              <h3>📚 Documentación Técnica</h3>
              <p>
                Localiza procedimientos, manuales y guías sin tener que leer 
                documentos completos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <p>© 2025 Aconex RAG System - Grupo 26</p>
        </div>
      </footer>
    </div>
  );
}

