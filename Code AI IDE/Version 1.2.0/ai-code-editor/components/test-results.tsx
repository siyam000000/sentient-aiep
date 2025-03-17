"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle, ChevronDown, ChevronRight, AlertCircle } from "lucide-react"
import { useTranslation } from "@/hooks/use-translation"
import { motion, AnimatePresence } from "framer-motion"

interface TestResult {
  name: string
  passed: boolean
  message?: string
}

interface TestSuite {
  name: string
  results: TestResult[]
  passed: boolean
  total: number
  passedCount: number
}

interface TestResultsProps {
  testResults: TestSuite[]
  isRunning: boolean
  onRunTests: () => void
}

export function TestResults({ testResults, isRunning, onRunTests }: TestResultsProps) {
  const { t } = useTranslation()
  const [expandedSuites, setExpandedSuites] = useState<Record<string, boolean>>({})

  const toggleSuite = (suiteName: string) => {
    setExpandedSuites((prev) => ({
      ...prev,
      [suiteName]: !prev[suiteName],
    }))
  }

  const totalTests = testResults.reduce((sum, suite) => sum + suite.total, 0)
  const passedTests = testResults.reduce((sum, suite) => sum + suite.passedCount, 0)
  const allPassed = passedTests === totalTests

  return (
    <Card className="w-full bg-gray-800 border-gray-700 text-white">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-lg font-semibold flex items-center">
          {allPassed ? (
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          )}
          {t("testResults")}
        </CardTitle>
        <Button onClick={onRunTests} disabled={isRunning} className="bg-blue-600 hover:bg-blue-700 text-white">
          {isRunning ? t("runningTests") : t("runTests")}
        </Button>
      </CardHeader>
      <CardContent>
        {testResults.length === 0 ? (
          <div className="text-center py-6 text-gray-400">{t("noTestsRun")}</div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-2 bg-gray-700/50 rounded">
              <div className="font-medium">{t("summary")}</div>
              <div className="flex items-center">
                <span className={allPassed ? "text-green-500" : "text-red-500"}>
                  {passedTests}/{totalTests} {t("passed")}
                </span>
                <div className="ml-3 w-24 h-2 bg-gray-600 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${allPassed ? "bg-green-500" : "bg-red-500"}`}
                    style={{ width: `${(passedTests / totalTests) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {testResults.map((suite) => (
              <div key={suite.name} className="border border-gray-700 rounded-md overflow-hidden">
                <div
                  className="flex items-center justify-between p-3 bg-gray-700/30 cursor-pointer"
                  onClick={() => toggleSuite(suite.name)}
                >
                  <div className="flex items-center">
                    {expandedSuites[suite.name] ? (
                      <ChevronDown className="h-4 w-4 mr-2" />
                    ) : (
                      <ChevronRight className="h-4 w-4 mr-2" />
                    )}
                    <span className="font-medium">{suite.name}</span>
                  </div>
                  <div className="flex items-center">
                    <span className={suite.passed ? "text-green-500" : "text-red-500"}>
                      {suite.passedCount}/{suite.total}
                    </span>
                  </div>
                </div>

                <AnimatePresence>
                  {expandedSuites[suite.name] && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="p-3 space-y-2">
                        {suite.results.map((result, index) => (
                          <div key={index} className="flex items-start p-2 rounded bg-gray-700/20">
                            {result.passed ? (
                              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                            )}
                            <div>
                              <div className="font-medium">{result.name}</div>
                              {result.message && <div className="text-sm text-gray-400 mt-1">{result.message}</div>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

