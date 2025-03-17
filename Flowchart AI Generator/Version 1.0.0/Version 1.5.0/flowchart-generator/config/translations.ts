import type { SupportedLanguage } from "./app-config"

type TranslationKey =
  | "flowchartDescription"
  | "generateFlowchart"
  | "enhancePrompt"
  | "enhancing"
  | "generating"
  | "downloadAsSVG"
  | "copyCode"
  | "copied"
  | "settings"
  | "error"
  | "warning"
  | "newChat"
  | "website"
  | "useEnhancedPrompt"
  | "enhancedPrompt"
  | "flowchartPlaceholder"
  | "descriptionPlaceholder"
  | "emptyInputError"
  | "downloadError"
  | "rendererError"
  | "chats"
  | "language"
  | "theme"
  | "light"
  | "dark"
  | "system"
  | "apiSettings"
  | "saveSettings"
  | "settingsSaved"
  | "settingsError"
  | "enterApiKey"
  | "orientation"
  | "zoomIn"
  | "zoomOut"
  | "switchOrientation"
  | "showGrid"
  | "hideGrid"
  | "changeTheme"
  | "fullscreen"
  | "exitFullscreen"
  | "autoFixing"
  | "tryAgain"
  | "manualFix"
  | "showDebugLogs"
  | "hideDebugLogs"
  | "noLogsAvailable"
  | "loading"
  | "retry"
  | "cancel"
  | "confirm"
  | "back"
  | "next"
  | "finish"
  | "search"
  | "noResults"
  | "mobileView"
  | "desktopView"
  | "inputTab"
  | "outputTab"
  | "help"
  | "about"
  | "feedback"
  | "share"
  | "export"
  | "import"
  | "delete"
  | "edit"
  | "save"
  | "close"
  | "open"
  | "menu"
  | "options"
  | "welcomeTitle"
  | "welcomeDescription"
  | "getStarted"
  | "errorBoundaryTitle"
  | "errorBoundaryDescription"
  | "errorBoundaryReset"
  | "networkError"
  | "offline"
  | "online"
  | "preparingApplication"

export const TRANSLATIONS: Record<SupportedLanguage, Record<TranslationKey, string>> = {
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
    chats: "Chats",
    language: "Language",
    theme: "Theme",
    light: "Light",
    dark: "Dark",
    system: "System",
    apiSettings: "API Settings",
    saveSettings: "Save Settings",
    settingsSaved: "Settings saved successfully!",
    settingsError: "Failed to save settings. Please try again.",
    enterApiKey: "Enter your API key",
    orientation: "Orientation",
    zoomIn: "Zoom In",
    zoomOut: "Zoom Out",
    switchOrientation: "Switch Orientation",
    showGrid: "Show Grid",
    hideGrid: "Hide Grid",
    changeTheme: "Change Theme",
    fullscreen: "Fullscreen",
    exitFullscreen: "Exit Fullscreen",
    autoFixing: "Automatically fixing diagram...",
    tryAgain: "Try Again",
    manualFix: "Manual Fix",
    showDebugLogs: "Show Debug Logs",
    hideDebugLogs: "Hide Debug Logs",
    noLogsAvailable: "No logs available",
    loading: "Loading...",
    retry: "Retry",
    cancel: "Cancel",
    confirm: "Confirm",
    back: "Back",
    next: "Next",
    finish: "Finish",
    search: "Search",
    noResults: "No results found",
    mobileView: "Mobile View",
    desktopView: "Desktop View",
    inputTab: "Input",
    outputTab: "Output",
    help: "Help",
    about: "About",
    feedback: "Feedback",
    share: "Share",
    export: "Export",
    import: "Import",
    delete: "Delete",
    edit: "Edit",
    save: "Save",
    close: "Close",
    open: "Open",
    menu: "Menu",
    options: "Options",
    welcomeTitle: "Welcome to Flowchart Generator",
    welcomeDescription: "Create beautiful flowcharts with ease using AI",
    getStarted: "Get Started",
    errorBoundaryTitle: "Something went wrong",
    errorBoundaryDescription: "An unexpected error occurred",
    errorBoundaryReset: "Reload page",
    networkError: "Network error. Please check your connection.",
    offline: "You are offline",
    online: "You are back online",
    preparingApplication: "Preparing application...",
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
    chats: "Чатове",
    language: "Език",
    theme: "Тема",
    light: "Светла",
    dark: "Тъмна",
    system: "Системна",
    apiSettings: "API Настройки",
    saveSettings: "Запази настройките",
    settingsSaved: "Настройките са запазени успешно!",
    settingsError: "Неуспешно запазване на настройките. Моля, опитайте отново.",
    enterApiKey: "Въведете вашия API ключ",
    orientation: "Ориентация",
    zoomIn: "Увеличи",
    zoomOut: "Намали",
    switchOrientation: "Промени ориентацията",
    showGrid: "Покажи мрежа",
    hideGrid: "Скрий мрежа",
    changeTheme: "Промени темата",
    fullscreen: "Цял екран",
    exitFullscreen: "Изход от цял екран",
    autoFixing: "Автоматично поправяне на диаграмата...",
    tryAgain: "Опитай отново",
    manualFix: "Ръчно поправяне",
    showDebugLogs: "Покажи дебъг логове",
    hideDebugLogs: "Скрий дебъг логове",
    noLogsAvailable: "Няма налични логове",
    loading: "Зареждане...",
    retry: "Опитай отново",
    cancel: "Отказ",
    confirm: "Потвърди",
    back: "Назад",
    next: "Напред",
    finish: "Завърши",
    search: "Търсене",
    noResults: "Няма намерени резултати",
    mobileView: "Мобилен изглед",
    desktopView: "Десктоп изглед",
    inputTab: "Вход",
    outputTab: "Изход",
    help: "Помощ",
    about: "За нас",
    feedback: "Обратна връзка",
    share: "Сподели",
    export: "Експорт",
    import: "Импорт",
    delete: "Изтрий",
    edit: "Редактирай",
    save: "Запази",
    close: "Затвори",
    open: "Отвори",
    menu: "Меню",
    options: "Опции",
    welcomeTitle: "Добре дошли в Генератора на диаграми",
    welcomeDescription: "Създавайте красиви диаграми лесно с помощта на AI",
    getStarted: "Започнете",
    errorBoundaryTitle: "Нещо се обърка",
    errorBoundaryDescription: "Възникна неочаквана грешка",
    errorBoundaryReset: "Презареди страницата",
    networkError: "Мрежова грешка. Моля, проверете връзката си.",
    offline: "Вие сте офлайн",
    online: "Вие сте отново онлайн",
    preparingApplication: "Подготовка на приложението...",
  },
}

export function getTranslation(language: SupportedLanguage, key: TranslationKey, fallback?: string): string {
  return TRANSLATIONS[language][key] || fallback || key
}

export type { TranslationKey }

