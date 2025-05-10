"use client"

import { useState, useEffect, useRef } from "react"
import { Play, Pause, RotateCcw, Settings2, Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TimerSettings } from "@/components/timer-settings"
import { BreakSuggestions } from "@/components/break-suggestions"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type TimerMode = "focus" | "shortBreak" | "longBreak"

const DEFAULT_TIMES = {
  focus: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
}

export function PomodoroTimer() {
  const [mode, setMode] = useState<TimerMode>("focus")
  const [timeLeft, setTimeLeft] = useState(DEFAULT_TIMES.focus)
  const [isRunning, setIsRunning] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [times, setTimes] = useState(DEFAULT_TIMES)
  const [completedSessions, setCompletedSessions] = useState(0)
  const [showBreakSuggestions, setShowBreakSuggestions] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [showTimerComplete, setShowTimerComplete] = useState(false)
  const [completedMode, setCompletedMode] = useState<TimerMode>("focus")
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const { toast } = useToast()

  // Calculate progress percentage
  const totalTime = times[mode]
  const progress = ((totalTime - timeLeft) / totalTime) * 100

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Play notification sound
  const playNotificationSound = () => {
    if (!soundEnabled) return

    try {
      // Create audio context
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioContext) {
        console.warn("AudioContext not supported in this browser")
        return
      }

      const audioCtx = new AudioContext()

      // Create oscillator (sound generator)
      const oscillator = audioCtx.createOscillator()
      const gainNode = audioCtx.createGain()

      // Configure sound
      oscillator.type = "sine" // Sine wave - smooth sound
      oscillator.frequency.setValueAtTime(830, audioCtx.currentTime) // Frequency in hertz

      // Configure volume
      gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime) // Set volume (0-1)

      // Connect nodes
      oscillator.connect(gainNode)
      gainNode.connect(audioCtx.destination)

      // Play sound
      oscillator.start()

      // Stop after 0.2 seconds
      oscillator.stop(audioCtx.currentTime + 0.2)

      // Play a second beep after a short delay
      setTimeout(() => {
        const oscillator2 = audioCtx.createOscillator()
        oscillator2.type = "sine"
        oscillator2.frequency.setValueAtTime(880, audioCtx.currentTime)
        oscillator2.connect(gainNode)
        oscillator2.start()
        oscillator2.stop(audioCtx.currentTime + 0.2)
      }, 300)
    } catch (error) {
      console.error("Error playing notification sound:", error)
      // Fallback to visual notification only
    }
  }

  // Handle timer completion
  const handleTimerComplete = () => {
    // Store the completed mode before changing it
    setCompletedMode(mode)

    // Play sound notification
    playNotificationSound()

    // Show visual notification
    setShowTimerComplete(true)

    // Show toast notification
    toast({
      title: `${mode === "focus" ? "Focus" : mode === "shortBreak" ? "Short Break" : "Long Break"} Complete!`,
      description: mode === "focus" ? "Great job! Time for a break." : "Break time is over. Ready to focus again?",
    })

    // Handle session completion
    if (mode === "focus") {
      const newCompletedSessions = completedSessions + 1
      setCompletedSessions(newCompletedSessions)

      // Show break suggestions when focus session ends
      setShowBreakSuggestions(true)

      // Determine next break type
      if (newCompletedSessions % 4 === 0) {
        setMode("longBreak")
        setTimeLeft(times.longBreak)
      } else {
        setMode("shortBreak")
        setTimeLeft(times.shortBreak)
      }
    } else {
      // Break ended, go back to focus
      setMode("focus")
      setTimeLeft(times.focus)
      setShowBreakSuggestions(false)
    }
  }

  // Handle timer tick
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Timer completed
            clearInterval(timerRef.current!)
            setIsRunning(false)
            handleTimerComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isRunning, mode, completedSessions, times, soundEnabled])

  // Update timeLeft when mode changes
  useEffect(() => {
    setTimeLeft(times[mode])
  }, [mode, times])

  // Toggle timer
  const toggleTimer = () => {
    setIsRunning(!isRunning)
  }

  // Reset timer
  const resetTimer = () => {
    setIsRunning(false)
    setTimeLeft(times[mode])
    setShowBreakSuggestions(false)
  }

  // Update timer settings
  const updateSettings = (newTimes: typeof DEFAULT_TIMES) => {
    setTimes(newTimes)
    setTimeLeft(newTimes[mode])
    setShowSettings(false)
  }

  // Create a smooth attention effect for the dialog
  useEffect(() => {
    if (showTimerComplete) {
      // Add a subtle scale animation when the dialog appears
      const dialogElement = document.querySelector('[role="dialog"]')
      if (dialogElement) {
        dialogElement.animate(
          [
            { transform: "scale(0.95)", opacity: 0 },
            { transform: "scale(1)", opacity: 1 },
          ],
          {
            duration: 300,
            easing: "ease-out",
            fill: "forwards",
          },
        )

        // Add a subtle bounce effect after the initial animation
        setTimeout(() => {
          if (dialogElement) {
            dialogElement.animate(
              [{ transform: "translateY(0)" }, { transform: "translateY(-6px)" }, { transform: "translateY(0)" }],
              {
                duration: 800,
                easing: "ease-in-out",
                iterations: 1,
              },
            )
          }
        }, 300)
      }
    }
  }, [showTimerComplete])

  return (
    <>
      <Card
        className={cn(
          "shadow-lg transition-colors duration-300",
          mode === "focus"
            ? "border-rose-200 dark:border-rose-800"
            : mode === "shortBreak"
              ? "border-emerald-200 dark:border-emerald-800"
              : "border-blue-200 dark:border-blue-800",
        )}
      >
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <Tabs
              value={mode}
              onValueChange={(v) => {
                setMode(v as TimerMode)
                setIsRunning(false)
                setShowBreakSuggestions(false)
              }}
              className="w-full"
            >
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="focus">Focus</TabsTrigger>
                <TabsTrigger value="shortBreak">Short Break</TabsTrigger>
                <TabsTrigger value="longBreak">Long Break</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="ml-1"
                title={soundEnabled ? "Disable sound" : "Enable sound"}
              >
                {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                <span className="sr-only">{soundEnabled ? "Disable sound" : "Enable sound"}</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSettings(true)}
                className="ml-1"
                title="Settings"
              >
                <Settings2 className="h-4 w-4" />
                <span className="sr-only">Settings</span>
              </Button>
            </div>
          </div>

          <div
            className={cn(
              "flex flex-col items-center justify-center py-10 transition-colors",
              mode === "focus"
                ? "text-rose-600 dark:text-rose-400"
                : mode === "shortBreak"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-blue-600 dark:text-blue-400",
            )}
          >
            <div className="flex items-center gap-2 mb-8">
              <div className="text-7xl font-bold">{formatTime(timeLeft)}</div>
              {mode === "focus" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettings(true)}
                  className="ml-1 h-8 rounded-full"
                  title="Change focus time"
                >
                  <Settings2 className="h-4 w-4" />
                  <span className="sr-only">Edit focus time</span>
                </Button>
              )}
            </div>
            <Progress
              value={progress}
              className={cn(
                "w-full h-2 mb-8",
                mode === "focus"
                  ? "bg-rose-100 dark:bg-rose-950"
                  : mode === "shortBreak"
                    ? "bg-emerald-100 dark:bg-emerald-950"
                    : "bg-blue-100 dark:bg-blue-950",
              )}
              indicatorClassName={cn(
                mode === "focus"
                  ? "bg-rose-500 dark:bg-rose-400"
                  : mode === "shortBreak"
                    ? "bg-emerald-500 dark:bg-emerald-400"
                    : "bg-blue-500 dark:bg-blue-400",
              )}
            />
            <div className="flex gap-4">
              <Button
                onClick={toggleTimer}
                className={cn(
                  "w-32 transition-colors",
                  mode === "focus"
                    ? "bg-rose-600 hover:bg-rose-700 dark:bg-rose-700 dark:hover:bg-rose-600"
                    : mode === "shortBreak"
                      ? "bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600"
                      : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600",
                )}
              >
                {isRunning ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                {isRunning ? "Pause" : "Start"}
              </Button>
              <Button variant="outline" onClick={resetTimer}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>

          <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
            {completedSessions > 0 && <p>Completed sessions: {completedSessions}</p>}
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              <div className="flex items-center">
                <Volume2 className="h-3 w-3 mr-1" />
                <span>{soundEnabled ? "Sound on" : "Sound off"}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {showBreakSuggestions && mode !== "focus" && (
        <div className="mt-6">
          <BreakSuggestions breakType={mode} />
        </div>
      )}

      {showSettings && <TimerSettings times={times} onSave={updateSettings} onCancel={() => setShowSettings(false)} />}

      <AlertDialog open={showTimerComplete} onOpenChange={setShowTimerComplete}>
        <AlertDialogContent
          className={cn(
            "border-4 shadow-lg transition-all duration-300",
            completedMode === "focus"
              ? "border-rose-500 shadow-rose-100 dark:shadow-rose-900/30"
              : completedMode === "shortBreak"
                ? "border-emerald-500 shadow-emerald-100 dark:shadow-emerald-900/30"
                : "border-blue-500 shadow-blue-100 dark:shadow-blue-900/30",
          )}
        >
          <AlertDialogHeader>
            <AlertDialogTitle
              className={cn(
                "text-2xl",
                completedMode === "focus"
                  ? "text-rose-600 dark:text-rose-400"
                  : completedMode === "shortBreak"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-blue-600 dark:text-blue-400",
              )}
            >
              {completedMode === "focus"
                ? "Focus Session Complete!"
                : completedMode === "shortBreak"
                  ? "Short Break Complete!"
                  : "Long Break Complete!"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-lg">
              {completedMode === "focus"
                ? "Great job! Time for a well-deserved break."
                : "Break time is over. Ready to focus again?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              className={cn(
                completedMode === "focus"
                  ? "bg-rose-600 hover:bg-rose-700"
                  : completedMode === "shortBreak"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-blue-600 hover:bg-blue-700",
              )}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
