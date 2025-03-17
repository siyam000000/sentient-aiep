"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"

export function Settings({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: "100%" }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: "100%" }}
          transition={{ duration: 0.3 }}
          className="fixed top-0 right-0 h-full w-80 bg-gray-900 p-6 shadow-lg"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Settings</h2>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-1 rounded-full bg-gray-800"
            >
              <X size={24} />
            </motion.button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Voice</label>
              <select className="w-full bg-gray-800 rounded p-2">
                <option>Default</option>
                <option>Male</option>
                <option>Female</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Language</label>
              <select className="w-full bg-gray-800 rounded p-2">
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
              </select>
            </div>
            <div>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span>Enable dark mode</span>
              </label>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="mt-6 w-full bg-blue-500 text-white rounded py-2 hover:bg-blue-600 transition-colors"
          >
            Save Changes
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

