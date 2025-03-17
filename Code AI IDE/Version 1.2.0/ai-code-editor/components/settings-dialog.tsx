"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Settings, Monitor, Type, Code, Save, Undo } from "lucide-react"
import { useTranslation } from "@/hooks/use-translation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAppContext } from "@/context/app-context"
import type { EditorSettings } from "@/types"

export function SettingsDialog() {
  const { t } = useTranslation()
  const { state, dispatch } = useAppContext()
  const [isOpen, setIsOpen] = useState(false)
  const [localSettings, setLocalSettings] = useState<EditorSettings>(state.userPreferences.editorSettings)

  const handleSettingChange = <K extends keyof EditorSettings>(key: K, value: EditorSettings[K]) => {
    setLocalSettings((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const saveSettings = () => {
    dispatch({
      type: "UPDATE_EDITOR_SETTINGS",
      payload: localSettings,
    })
    setIsOpen(false)
  }

  const resetSettings = () => {
    dispatch({
      type: "RESET_TO_DEFAULTS",
    })
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white" aria-label={t("settings")}>
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2 text-blue-400">
            <Settings className="h-5 w-5" />
            {t("settings")}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="editor" className="mt-4">
          <TabsList className="bg-gray-800 border-gray-700">
            <TabsTrigger value="editor" className="data-[state=active]:bg-blue-600">
              <Code className="h-4 w-4 mr-2" />
              {t("editor")}
            </TabsTrigger>
            <TabsTrigger value="appearance" className="data-[state=active]:bg-blue-600">
              <Monitor className="h-4 w-4 mr-2" />
              {t("appearance")}
            </TabsTrigger>
            <TabsTrigger value="format" className="data-[state=active]:bg-blue-600">
              <Type className="h-4 w-4 mr-2" />
              {t("formatting")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="editor" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="theme">{t("theme")}</Label>
                <Select
                  value={localSettings.theme}
                  onValueChange={(value) => handleSettingChange("theme", value as EditorSettings["theme"])}
                >
                  <SelectTrigger id="theme" className="bg-gray-800 border-gray-700">
                    <SelectValue placeholder={t("selectTheme")} />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="vs-dark">{t("dark")}</SelectItem>
                    <SelectItem value="light">{t("light")}</SelectItem>
                    <SelectItem value="high-contrast">{t("highContrast")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fontSize">
                  {t("fontSize")}: {localSettings.fontSize}px
                </Label>
                <Slider
                  id="fontSize"
                  min={10}
                  max={24}
                  step={1}
                  value={[localSettings.fontSize]}
                  onValueChange={(value) => handleSettingChange("fontSize", value[0])}
                  className="py-2"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tabSize">
                  {t("tabSize")}: {localSettings.tabSize}
                </Label>
                <Slider
                  id="tabSize"
                  min={2}
                  max={8}
                  step={2}
                  value={[localSettings.tabSize]}
                  onValueChange={(value) => handleSettingChange("tabSize", value[0])}
                  className="py-2"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lineNumbers">{t("lineNumbers")}</Label>
                <Select
                  value={localSettings.lineNumbers}
                  onValueChange={(value) => handleSettingChange("lineNumbers", value as EditorSettings["lineNumbers"])}
                >
                  <SelectTrigger id="lineNumbers" className="bg-gray-800 border-gray-700">
                    <SelectValue placeholder={t("selectLineNumbers")} />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="on">{t("on")}</SelectItem>
                    <SelectItem value="off">{t("off")}</SelectItem>
                    <SelectItem value="relative">{t("relative")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="wordWrap">{t("wordWrap")}</Label>
                  <Switch
                    id="wordWrap"
                    checked={localSettings.wordWrap === "on"}
                    onCheckedChange={(checked) => handleSettingChange("wordWrap", checked ? "on" : "off")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="minimap">{t("minimap")}</Label>
                  <Switch
                    id="minimap"
                    checked={localSettings.minimap}
                    onCheckedChange={(checked) => handleSettingChange("minimap", checked)}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="appearance" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("language")}</Label>
                <div className="flex space-x-2">
                  <Button
                    variant={state.userPreferences.language === "en" ? "default" : "outline"}
                    onClick={() => dispatch({ type: "SET_LANGUAGE", payload: "en" })}
                    className="flex-1"
                  >
                    English
                  </Button>
                  <Button
                    variant={state.userPreferences.language === "bg" ? "default" : "outline"}
                    onClick={() => dispatch({ type: "SET_LANGUAGE", payload: "bg" })}
                    className="flex-1"
                  >
                    Български
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="format" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="autoSave">{t("autoSave")}</Label>
                  <Switch
                    id="autoSave"
                    checked={localSettings.autoSave}
                    onCheckedChange={(checked) => handleSettingChange("autoSave", checked)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="formatOnSave">{t("formatOnSave")}</Label>
                  <Switch
                    id="formatOnSave"
                    checked={localSettings.formatOnSave}
                    onCheckedChange={(checked) => handleSettingChange("formatOnSave", checked)}
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={resetSettings} className="border-gray-700 text-gray-300 hover:bg-gray-700">
            <Undo className="h-4 w-4 mr-2" />
            {t("resetToDefaults")}
          </Button>
          <Button onClick={saveSettings} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Save className="h-4 w-4 mr-2" />
            {t("saveSettings")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

