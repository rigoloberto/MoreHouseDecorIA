# More House Decor IA 🏠✨

Aplicación Web de Diseño Interior Inteligente con Inteligencia Artificial. Este prototipo funcional (MVP) permite a los usuarios cargar una fotografía real de su espacio, definir sus preferencias de diseño y recibir un render conceptual junto con sugerencias de muebles reales del catálogo oficial de **More House S.A.**

---

## 🚀 Requisitos Previos

Dado que el proyecto utiliza tecnologías de alto rendimiento modernas, es indispensable tener instalado **Bun**:
*   **Instalación rápida en Windows (PowerShell):**
    ```powershell
    powershell -c "irm bun.sh/install.ps1 | iex"
    ```
*   **Instalación en macOS / Linux:**
    ```bash
    curl -fsSL https://bun.sh/install | bash
    ```

---

## 🛠️ Configuración del Proyecto (Post-GitHub)

Al descargar el repositorio desde GitHub, notarás que faltan las dependencias (`node_modules`) y las claves de configuración de las APIs (`.env`), ya que estas están protegidas por el archivo `.gitignore`. Sigue estos pasos para configurarlo:

### 1. Configurar las Claves de API en el Backend
Navega a la carpeta `/backend` y crea un archivo llamado **`.env`** con la siguiente estructura:

```env
GEMINI_API_KEY="TU_API_KEY_DE_GEMINI"
CLOUDFLARE_ACCOUNT_ID="TU_ACCOUNT_ID_DE_CLOUDFLARE"
CLOUDFLARE_API_TOKEN="TU_API_TOKEN_DE_CLOUDFLARE"
HF_TOKEN="TU_TOKEN_DE_HUGGING_FACE"
PORT=3000
```

*   **Gemini API Key:** Se obtiene gratis en [Google AI Studio](https://aistudio.google.com/).
*   **Hugging Face Token:** Se obtiene gratis en *Settings -> Access Tokens* en [Hugging Face](https://huggingface.co/).
*   **Cloudflare Workers AI:** Se obtiene gratis en tu cuenta de [Cloudflare](https://dash.cloudflare.com/) (sección *My Profile -> API Tokens* usando la plantilla *Workers AI*).

---

## 💻 Cómo Correr la Aplicación Localmente

Abre dos terminales por separado en la raíz del proyecto para ejecutar el Backend y el Frontend en paralelo:

### Terminal 1: Iniciar el Servidor (Backend)
1. Navega a la carpeta `backend`:
   ```bash
   cd backend
   ```
2. Instala las dependencias con Bun:
   ```bash
   bun install
   ```
3. Levanta el servidor en modo desarrollo (con auto-recarga en caliente):
   ```bash
   bun run dev
   ```
   *El backend estará corriendo en: [http://localhost:3000](http://localhost:3000)*

### Terminal 2: Iniciar la Webapp (Frontend)
1. Navega a la carpeta `frontend`:
   ```bash
   cd ../frontend
   ```
2. Instala las dependencias:
   ```bash
   bun install
   ```
3. Inicia el servidor de desarrollo de Vite:
   ```bash
   bun run dev
   ```
   *El frontend estará listo y accesible en: [http://localhost:5173](http://localhost:5173)*

---

## 🔑 Credenciales para Pruebas del Panel Administrador

Para probar el panel administrativo del catálogo, ve a la pestaña **Administrador** e inicia sesión con estas credenciales:
*   **Usuario:** `admin`
*   **Contraseña:** `admin123`

Desde allí podrás simular el inventario agregando, editando o eliminando muebles reales de la base de datos local y verás cómo la IA de Gemini los prioriza en sus recomendaciones.
