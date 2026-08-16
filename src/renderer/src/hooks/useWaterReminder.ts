import { useState, useEffect } from 'react'
import type { IpcRendererEvent } from 'electron'

interface WaterData {
  drinks: number
  date: string
}

export function useWaterReminder() {
  const [cycleMinutes, setCycleMinutes] = useState<number>(60)
  const [isActive, setIsActive] = useState<boolean>(false)
  const [timeLeft, setTimeLeft] = useState<number>(60 * 60)
  const [showPopup, setShowPopup] = useState<boolean>(false) // we don't strictly need this UI popup in the main window anymore, but good to keep state
  const [todayDrinks, setTodayDrinks] = useState<number>(0)

  // Load data on mount
  useEffect(() => {
    const savedData = localStorage.getItem('waterData')
    const savedCycle = localStorage.getItem('waterCycle')

    if (savedCycle) {
      const min = Number(savedCycle)
      setCycleMinutes(min)
      setTimeLeft(min * 60)
    }

    const today = new Date().toLocaleDateString()
    if (savedData) {
      const data: WaterData = JSON.parse(savedData)
      if (data.date === today) {
        setTodayDrinks(data.drinks)
      } else {
        // New day
        setTodayDrinks(0)
        localStorage.setItem('waterData', JSON.stringify({ drinks: 0, date: today }))
      }
    } else {
      localStorage.setItem('waterData', JSON.stringify({ drinks: 0, date: today }))
    }
  }, [])

  const handleDrink = () => {
    setTodayDrinks((prev) => {
      const newDrinks = prev + 1
      const today = new Date().toLocaleDateString()
      localStorage.setItem('waterData', JSON.stringify({ drinks: newDrinks, date: today }))
      return newDrinks
    })
    setShowPopup(false)
    setTimeLeft(cycleMinutes * 60)
    setIsActive(true) // auto-restart
  }

  const handleSnooze = () => {
    setShowPopup(false)
    // 5 minute snooze
    setTimeLeft(5 * 60)
    setIsActive(true)
  }

  // Setup IPC listener for popup actions from the separate window
  useEffect(() => {
    if (!window.electron) return

    const listener = (_event: IpcRendererEvent, actionType: string) => {
      if (actionType === 'drink') {
        handleDrink()
      } else if (actionType === 'snooze') {
        handleSnooze()
      }
    }

    // Must assert any to avoid type errors since IpcRenderer Event parameter signature may vary
    window.electron.ipcRenderer.on('water-action-reply', listener as any)

    return () => {
      window.electron.ipcRenderer.removeAllListeners('water-action-reply')
    }
  }, [cycleMinutes]) // Dependency array requires cycleMinutes to re-bind closures properly

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1)
      }, 1000)
    } else if (isActive && timeLeft <= 0) {
      setIsActive(false) // Pause until they interact

      // Always show in-app popup as fallback/sync
      setShowPopup(true)

      // Spawn actual OS Window via IPC
      if (window.electron && window.electron.ipcRenderer) {
        window.electron.ipcRenderer.send('show-water-popup', cycleMinutes)
      }
    }

    return () => clearInterval(interval)
  }, [isActive, timeLeft, cycleMinutes])

  const startTimer = () => {
    setIsActive(true)
  }

  const pauseTimer = () => {
    setIsActive(false)
  }

  const resetTimer = () => {
    setIsActive(false)
    setTimeLeft(cycleMinutes * 60)
  }

  const updateCycle = (minutes: number) => {
    setCycleMinutes(minutes)
    setTimeLeft(minutes * 60)
    setIsActive(false)
    localStorage.setItem('waterCycle', minutes.toString())
  }

  const handleTimeLeftChange = (seconds: number) => {
    setTimeLeft(seconds)
  }

  return {
    cycleMinutes,
    updateCycle,
    timeLeft,
    handleTimeLeftChange,
    isActive,
    startTimer,
    pauseTimer,
    resetTimer,
    showPopup,
    todayDrinks,
    handleDrink,
    handleSnooze
  }
}
