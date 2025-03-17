import "./App.css"
import Home from "./pages/Home"
import ActiveSectionContextProvider from "./context/active-section-context"
import ThemeContextProvider from "./context/theme-context"
import LanguageContextProvider from "./context/language-context"

function App() {
  return (
    <ThemeContextProvider>
      <LanguageContextProvider>
        <ActiveSectionContextProvider>
          <Home />
        </ActiveSectionContextProvider>
      </LanguageContextProvider>
    </ThemeContextProvider>
  )
}

export default App

