"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface TimerSettingsProps {
  times: {
    focus: number
    shortBreak: number
    longBreak: number
  }
  onSave: (times: { focus: number; shortBreak: number; longBreak: number }) => void
  onCancel: () => void
}

export function TimerSettings({ times, onSave, onCancel }: TimerSettingsProps) {
  const [focusMinutes, setFocusMinutes] = useState(Math.floor(times.focus / 60))
  const [shortBreakMinutes, setShortBreakMinutes] = useState(Math.floor(times.shortBreak / 60))
  const [longBreakMinutes, setLongBreakMinutes] = useState(Math.floor(times.longBreak / 60))

  const handleSave = () => {
    onSave({
      focus: focusMinutes * 60,
      shortBreak: shortBreakMinutes * 60,
      longBreak: longBreakMinutes * 60,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Timer Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="focus-time">Focus Time (minutes)</Label>
            <Input
              id="focus-time"
              type="number"
              min="1"
              max="120"
              value={focusMinutes}
              onChange={(e) => setFocusMinutes(Number.parseInt(e.target.value) || 25)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="short-break">Short Break (minutes)</Label>
            <Input
              id="short-break"
              type="number"
              min="1"
              max="30"
              value={shortBreakMinutes}
              onChange={(e) => setShortBreakMinutes(Number.parseInt(e.target.value) || 5)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="long-break">Long Break (minutes)</Label>
            <Input
              id="long-break"
              type="number"
              min="1"
              max="60"
              value={longBreakMinutes}
              onChange={(e) => setLongBreakMinutes(Number.parseInt(e.target.value) || 15)}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Settings</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
