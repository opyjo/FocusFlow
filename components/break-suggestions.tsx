"use client"

import { useState } from "react"
import { RefreshCw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type BreakType = "shortBreak" | "longBreak"

interface BreakSuggestionsProps {
  breakType: BreakType
}

const SHORT_BREAK_SUGGESTIONS = [
  "Stretch your arms, neck, and shoulders",
  "Do 10 jumping jacks",
  "Take a few deep breaths",
  "Get a glass of water",
  "Rest your eyes by looking at something 20 feet away",
  "Tidy up your workspace",
  "Do a quick meditation",
  "Stand up and walk around",
  "Grab a healthy snack",
  "Listen to a favorite song",
]

const LONG_BREAK_SUGGESTIONS = [
  "Go for a short walk outside",
  "Do a 10-minute yoga session",
  "Prepare a healthy meal or snack",
  "Call a friend or family member",
  "Take a power nap (15 minutes max)",
  "Journal your thoughts or progress",
  "Do some light cleaning",
  "Listen to a podcast episode",
  "Stretch your whole body",
  "Practice mindfulness meditation",
]

export function BreakSuggestions({ breakType }: BreakSuggestionsProps) {
  const suggestions = breakType === "shortBreak" ? SHORT_BREAK_SUGGESTIONS : LONG_BREAK_SUGGESTIONS
  const [currentSuggestions, setCurrentSuggestions] = useState(() => {
    // Get 3 random suggestions
    return [...suggestions].sort(() => 0.5 - Math.random()).slice(0, 3)
  })

  const refreshSuggestions = () => {
    setCurrentSuggestions([...suggestions].sort(() => 0.5 - Math.random()).slice(0, 3))
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {breakType === "shortBreak" ? "Short Break Ideas" : "Long Break Ideas"}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={refreshSuggestions}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {currentSuggestions.map((suggestion, index) => (
            <li key={index} className="flex items-start">
              <span className="bg-rose-100 dark:bg-rose-900 text-rose-600 dark:text-rose-300 w-6 h-6 rounded-full flex items-center justify-center mr-3 mt-0.5 text-sm font-medium">
                {index + 1}
              </span>
              <span className="text-gray-700 dark:text-gray-300">{suggestion}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
