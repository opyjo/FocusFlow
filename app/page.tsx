import { PomodoroTimer } from "@/components/pomodoro-timer"
import { ThemeProvider } from "@/components/theme-provider"

export default function Home() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-rose-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="max-w-md w-full">
          <h1 className="text-3xl font-bold text-center mb-2 text-rose-600 dark:text-rose-400">FocusFlow</h1>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-8">Stay productive with timed focus sessions</p>
          <PomodoroTimer />
        </div>
      </main>
    </ThemeProvider>
  )
}
