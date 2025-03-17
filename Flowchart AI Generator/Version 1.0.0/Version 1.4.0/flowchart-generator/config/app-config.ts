/**
 * Application-wide configuration settings
 */

// API endpoints
export const API_ROUTES = {
  GENERATE_FLOWCHART: "/api/generate-flowchart",
  ENHANCE_PROMPT: "/api/enhance-prompt",
  FIX_MERMAID_CODE: "/api/fix-mermaid-code",
  DEBUG_MERMAID_CODE: "/api/debug-mermaid-code",
  SET_CLAUDE_KEY: "/api/set-claude-key",
  SET_OPENAI_KEY: "/api/set-openai-key",
} as const

// Claude API configuration
export const CLAUDE_API_CONFIG = {
  API_URL: "https://api.anthropic.com/v1/messages",
  API_VERSION: "2023-06-01",
  MODEL: "claude-3-5-sonnet-20240620",
  DEFAULT_MAX_TOKENS: 150,
  DEFAULT_TIMEOUT_MS: 15000,
} as const

// Mermaid configuration
export const MERMAID_CONFIG = {
  DEFAULT_THEME: "default",
  DEFAULT_ORIENTATION: "TD",
  MAX_CODE_LENGTH: 4000,
  MAX_AUTO_FIX_ATTEMPTS: 3,
} as const

// UI configuration
export const UI_CONFIG = {
  MAX_ZOOM: 2,
  MIN_ZOOM: 0.5,
  ZOOM_STEP: 0.1,
  COPY_TIMEOUT_MS: 2000,
  DOWNLOAD_FILENAME: "flowchart.svg",
} as const

// Supported languages
export const SUPPORTED_LANGUAGES = ["en", "bg"] as const
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]

// Translation keys
export const TRANSLATIONS = {
  en: {
    flowchartDescription: "Flowchart Description",
    generateFlowchart: "Generate Flowchart",
    enhancePrompt: "Enhance Prompt",
    enhancing: "Enhancing...",
    generating: "Generating...",
    downloadAsSVG: "Download as SVG",
    copyCode: "Copy Code",
    copied: "Copied!",
    settings: "Settings",
    error: "Error",
    warning: "Warning",
    newChat: "New Chat",
    website: "Website",
    useEnhancedPrompt: "Use Enhanced Prompt",
    enhancedPrompt: "Enhanced Prompt:",
    flowchartPlaceholder: "Your generated flowchart will appear here",
    descriptionPlaceholder: "Describe your flowchart (e.g., 'Create a flowchart for a user login process')",
    emptyInputError: "Please enter a description for your flowchart",
    downloadError: "No flowchart to download. Please generate a flowchart first.",
    rendererError: "Diagram renderer not initialized. Please try refreshing the page.",
  },
  bg: {
    flowchartDescription: "Описание на диаграмата",
    generateFlowchart: "Генерирай диаграма",
    enhancePrompt: "Подобри описанието",
    enhancing: "Подобряване...",
    generating: "Генериране...",
    downloadAsSVG: "Изтегли като SVG",
    copyCode: "Копирай код",
    copied: "Копирано!",
    settings: "Настройки",
    error: "Грешка",
    warning: "Предупреждение",
    newChat: "Нов чат",
    website: "Уебсайт",
    useEnhancedPrompt: "Използвай подобреното описание",
    enhancedPrompt: "Подобрено описание:",
    flowchartPlaceholder: "Вашата генерирана диаграма ще се появи тук",
    descriptionPlaceholder: "Опишете вашата диаграма (напр., 'Създайте диаграма за процеса на вход на потребител')",
    emptyInputError: "Моля, въведете описание за вашата диаграма",
    downloadError: "Няма диаграма за изтегляне. Моля, първо генерирайте диаграма.",
    rendererError: "Рендерът на диаграмата не е инициализиран. Моля, опитайте да опресните страницата.",
  },
} as const

