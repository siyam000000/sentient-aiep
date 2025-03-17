"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { HelpCircle, Code, Lightbulb, MessageSquare, Sparkles, CheckCircle } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

export function AIHelpPanel() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white" aria-label="AI Help">
          <HelpCircle className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2 text-blue-400">
            <Sparkles className="h-5 w-5" />
            AI Coding Helper Guide
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-6 py-2">
            <p className="text-gray-300">
              The Sentient AI Coding Helper is powered by Llama 3.3 70B and can assist you with various coding tasks.
              Here's how to make the most of it:
            </p>

            <div className="space-y-4">
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <div className="flex items-center gap-2 mb-2 text-blue-400">
                  <Code className="h-5 w-5" />
                  <h4 className="font-medium">Code Generation</h4>
                </div>
                <p className="text-sm text-gray-300 mb-2">
                  Ask the AI to generate code snippets or complete functions for you.
                </p>
                <div className="bg-gray-900 p-2 rounded text-xs text-gray-400">
                  "Generate a responsive navbar with HTML and CSS"
                  <br />
                  "Create a function to sort an array of objects by date"
                </div>
              </div>

              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <div className="flex items-center gap-2 mb-2 text-blue-400">
                  <Lightbulb className="h-5 w-5" />
                  <h4 className="font-medium">Debugging & Problem Solving</h4>
                </div>
                <p className="text-sm text-gray-300 mb-2">Get help identifying and fixing bugs in your code.</p>
                <div className="bg-gray-900 p-2 rounded text-xs text-gray-400">
                  "Why isn't my flexbox layout working correctly?"
                  <br />
                  "Debug this JavaScript function that's causing an error"
                </div>
              </div>

              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <div className="flex items-center gap-2 mb-2 text-blue-400">
                  <MessageSquare className="h-5 w-5" />
                  <h4 className="font-medium">Learning & Explanations</h4>
                </div>
                <p className="text-sm text-gray-300 mb-2">
                  Get explanations for code concepts or learn how features work.
                </p>
                <div className="bg-gray-900 p-2 rounded text-xs text-gray-400">
                  "Explain how JavaScript promises work"
                  <br />
                  "What's the difference between var, let, and const?"
                </div>
              </div>

              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <div className="flex items-center gap-2 mb-2 text-blue-400">
                  <CheckCircle className="h-5 w-5" />
                  <h4 className="font-medium">Best Practices & Optimization</h4>
                </div>
                <p className="text-sm text-gray-300 mb-2">
                  Get suggestions to improve your code quality and performance.
                </p>
                <div className="bg-gray-900 p-2 rounded text-xs text-gray-400">
                  "How can I optimize this function for better performance?"
                  <br />
                  "What are the best practices for form validation?"
                </div>
              </div>
            </div>

            <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-800/50">
              <h4 className="font-medium text-blue-400 mb-2">Pro Tips</h4>
              <ul className="text-sm text-gray-300 space-y-2 list-disc pl-5">
                <li>Be specific in your questions to get more accurate responses</li>
                <li>You can apply code directly to your editor by clicking the "Apply" button</li>
                <li>The AI has context about your current file, so you can ask specific questions about your code</li>
                <li>For complex problems, break them down into smaller, more specific questions</li>
              </ul>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

