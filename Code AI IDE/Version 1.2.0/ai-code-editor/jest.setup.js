// Mock the DOMParser for Node.js environment
global.DOMParser = class DOMParser {
  parseFromString(string, contentType) {
    if (string.includes("<parsererror")) {
      const doc = {
        querySelector: (selector) => {
          if (selector === "parsererror") {
            return { textContent: "Parse error" }
          }
          return null
        },
        body: {
          textContent: string,
        },
      }
      return doc
    }

    if (string.includes("</h2>") && string.includes("<h1>")) {
      const doc = {
        querySelector: (selector) => {
          if (selector === "parsererror") {
            return { textContent: "Parse error" }
          }
          return null
        },
        body: {
          textContent: string,
        },
      }
      return doc
    }

    return {
      querySelector: (selector) => {
        if (selector === "h1, h2, h3, h4, h5, h6" && string.includes("<h1>")) {
          return { textContent: "Heading" }
        }
        return null
      },
      body: {
        textContent: string,
      },
    }
  }
}

// Mock localStorage
const localStorageMock = (() => {
  let store = {}
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString()
    },
    removeItem: (key) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
})

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor(callback) {
    this.callback = callback
  }
  observe() {}
  unobserve() {}
  disconnect() {}
}

