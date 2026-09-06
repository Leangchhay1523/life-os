import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd'
import {
  FaPlus,
  FaGripVertical,
  FaTrash,
  FaCheck,
  FaMoon,
  FaTint,
  FaClock,
  FaCheckCircle,
  FaChartPie,
  FaInfoCircle
} from 'react-icons/fa'

interface Task {
  id: string
  content: string
  completed: boolean
  duration: number // e.g. 0.5, 1, 2
}

interface TimelineSlot {
  id: string
  timeLabel: string
  taskId: string | null
}

const generateEmptySlots = (): TimelineSlot[] => {
  const slots: TimelineSlot[] = []
  for (let hour = 6; hour <= 23; hour++) {
    for (const min of [0, 30]) {
      const timeStr = `${hour.toString().padStart(2, '0')}:${min === 0 ? '00' : '30'}`
      slots.push({ id: `slot-${hour}-${min}`, timeLabel: timeStr, taskId: null })
    }
  }
  return slots
}

const uid = () => Math.random().toString(36).substring(2, 9)

export default function DailyPlanner() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [slots, setSlots] = useState<TimelineSlot[]>(generateEmptySlots())
  const [newTaskInput, setNewTaskInput] = useState('')
  const [showReview, setShowReview] = useState(false)

  // Initialization: load from store
  useEffect(() => {
    const loadState = async () => {
      if (!window.electron) return
      const savedTasks = await window.electron.ipcRenderer.invoke('store-get', 'planner-tasks')
      const savedSlots = await window.electron.ipcRenderer.invoke('store-get', 'planner-slots')

      // Safety check: ensure older tasks missing duration get a default
      if (savedTasks) {
        setTasks(savedTasks.map((t: any) => ({ ...t, duration: t.duration || 0.5 })))
      }
      if (savedSlots) setSlots(savedSlots)
    }
    loadState()
  }, [])

  // Persist state
  useEffect(() => {
    if (window.electron) {
      window.electron.ipcRenderer.invoke('store-set', 'planner-tasks', tasks)
      window.electron.ipcRenderer.invoke('store-set', 'planner-slots', slots)
    }
  }, [tasks, slots])

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result
    if (!destination) return

    if (
      source.droppableId === destination.droppableId &&
      source.droppableId === 'unassigned-tasks'
    ) {
      const newTasks = Array.from(tasks)
      const [reorderedItem] = newTasks.splice(source.index, 1)
      newTasks.splice(destination.index, 0, reorderedItem)
      setTasks(newTasks)
      return
    }

    if (source.droppableId === 'unassigned-tasks' && destination.droppableId.startsWith('slot-')) {
      const updatedSlots = [...slots]
      const targetSlotIndex = updatedSlots.findIndex((s) => s.id === destination.droppableId)
      const task = tasks.find((t) => t.id === draggableId)
      if (!task) return

      const span = Math.ceil(task.duration / 0.5)

      // Collision check
      for (let i = 0; i < span; i++) {
        const checkSlot = updatedSlots[targetSlotIndex + i]
        if (!checkSlot || checkSlot.taskId !== null) {
          return // Abort if collides
        }
      }

      updatedSlots[targetSlotIndex].taskId = draggableId
      setSlots(updatedSlots)
      return
    }

    if (source.droppableId.startsWith('slot-') && destination.droppableId.startsWith('slot-')) {
      const updatedSlots = [...slots]
      const sourceSlotIndex = updatedSlots.findIndex((s) => s.id === source.droppableId)
      const destSlotIndex = updatedSlots.findIndex((s) => s.id === destination.droppableId)
      const sourceSlot = updatedSlots[sourceSlotIndex]
      const taskId = sourceSlot.taskId
      if (!taskId) return

      const task = tasks.find((t) => t.id === taskId)
      if (!task) return

      // We allow self-drop to do nothing
      if (sourceSlotIndex === destSlotIndex) return

      const span = Math.ceil(task.duration / 0.5)

      // Collision check
      for (let i = 0; i < span; i++) {
        const checkIndex = destSlotIndex + i
        if (!updatedSlots[checkIndex]) return
        const slotOccupantId = updatedSlots[checkIndex].taskId
        if (slotOccupantId !== null && slotOccupantId !== taskId) {
          return // Collision with another task
        }
      }

      // Safe to move
      updatedSlots[sourceSlotIndex].taskId = null
      updatedSlots[destSlotIndex].taskId = taskId
      setSlots(updatedSlots)
      return
    }

    if (source.droppableId.startsWith('slot-') && destination.droppableId === 'unassigned-tasks') {
      const updatedSlots = [...slots]
      const sourceSlot = updatedSlots.find((s) => s.id === source.droppableId)
      if (sourceSlot) sourceSlot.taskId = null
      setSlots(updatedSlots)
      return
    }
  }

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskInput.trim()) return

    let content = newTaskInput.trim()
    let parsedDuration = 0.5 // Default 30 min (1 slot)

    // Parse comma for duration (e.g. "Read book, 2")
    if (content.includes(',')) {
      const parts = content.split(',')
      const lastPart = parts[parts.length - 1].trim()
      const possibleNum = parseFloat(lastPart)
      if (!isNaN(possibleNum) && possibleNum > 0) {
        parsedDuration = possibleNum
        content = parts.slice(0, -1).join(',').trim()
      }
    }

    setTasks([...tasks, { id: uid(), content, completed: false, duration: parsedDuration }])
    setNewTaskInput('')
  }

  const toggleTaskCompletion = (taskId: string) => {
    setTasks(tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t)))
  }

  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter((t) => t.id !== taskId))
    setSlots(slots.map((s) => (s.taskId === taskId ? { ...s, taskId: null } : s)))
  }

  // Derived Stats
  const todayDateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  // Count exact slots planned using durations
  let totalPlannedTimeSlots = 0
  for (const s of slots) {
    if (s.taskId) {
      const t = tasks.find((x) => x.id === s.taskId)
      if (t) totalPlannedTimeSlots += Math.ceil(t.duration / 0.5)
    }
  }

  const totalPlannedHours = Math.floor(totalPlannedTimeSlots / 2)
  const totalPlannedMins = (totalPlannedTimeSlots % 2) * 30
  const completedTasks = tasks.filter((t) => t.completed).length
  const totalTasks = tasks.length

  return (
    <div className="flex flex-col h-full overflow-hidden text-foreground">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border mb-6 shrink-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">TODAY — {todayDateStr}</h2>
          <p className="text-muted mt-1">Drag your tasks into your timeline to block your time.</p>
        </div>
        <button
          onClick={() => setShowReview(true)}
          className="flex items-center gap-2 px-4 py-2 bg-surface hover:bg-surface-hover border border-border rounded-xl text-primary font-bold shadow-sm transition-all"
        >
          <FaMoon /> Daily Review
        </button>
      </div>

      <div className="flex flex-1 gap-6 min-h-0 overflow-hidden">
        <DragDropContext onDragEnd={onDragEnd}>
          {/* Left Column: Task Backlog */}
          <div className="w-1/3 flex flex-col bg-surface/50 border border-border rounded-2xl p-4 shadow-inner min-h-0">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <FaCheckCircle className="text-primary" /> Task Pool
            </h3>

            {tasks.length === 0 && (
              <div className="mb-4 bg-primary/10 border border-primary/20 p-3 rounded-xl flex gap-3 text-sm text-foreground">
                <FaInfoCircle className="text-primary mt-0.5 shrink-0" />
                <p>
                  Add a task below. You can include hours using a comma, e.g.{' '}
                  <span className="font-bold bg-background px-1 rounded text-primary">
                    Write code, 2.5
                  </span>
                </p>
              </div>
            )}

            <form onSubmit={handleAddTask} className="flex gap-2 mb-4 shrink-0">
              <input
                type="text"
                value={newTaskInput}
                onChange={(e) => setNewTaskInput(e.target.value)}
                placeholder="e.g., Deep Work, 2"
                className="flex-1 px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary"
              />
              <button
                type="submit"
                className="w-10 h-10 bg-primary hover:bg-primary-hover text-white rounded-xl flex items-center justify-center transition-colors"
                title="Add Task"
              >
                <FaPlus />
              </button>
            </form>

            <Droppable droppableId="unassigned-tasks">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="flex-1 overflow-y-auto space-y-2 pr-1"
                >
                  {tasks.map((task, index) => {
                    const isPlaced = slots.some((s) => s.taskId === task.id)
                    return (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`flex items-center gap-3 p-3 rounded-xl border ${
                              snapshot.isDragging
                                ? 'bg-background border-primary shadow-lg scale-105 z-10'
                                : isPlaced
                                  ? 'bg-surface border-border opacity-70'
                                  : 'bg-card border-border hover:border-primary/50 shadow-sm'
                            } transition-transform`}
                          >
                            <div
                              {...provided.dragHandleProps}
                              className="text-muted/50 hover:text-muted cursor-grab active:cursor-grabbing px-1"
                            >
                              <FaGripVertical />
                            </div>

                            <button
                              onClick={() => toggleTaskCompletion(task.id)}
                              className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${task.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-muted hover:border-primary bg-background'}`}
                            >
                              {task.completed && <FaCheck className="w-3 h-3" />}
                            </button>

                            <span
                              className={`flex-1 text-sm ${task.completed ? 'line-through text-muted' : ''} ${isPlaced && !task.completed ? 'text-subtle' : ''}`}
                            >
                              {task.content}
                              <span className="inline-block ml-2 text-xs font-semibold px-1.5 py-0.5 rounded bg-surface border border-border text-primary/80">
                                {task.duration}h
                              </span>
                            </span>

                            <button
                              onClick={() => deleteTask(task.id)}
                              className="text-muted/50 hover:text-red-500 transition-colors p-1"
                            >
                              <FaTrash size={12} />
                            </button>
                          </div>
                        )}
                      </Draggable>
                    )
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>

          {/* Right Column: Interactive Timeline */}
          <div className="w-2/3 flex flex-col bg-card border border-border rounded-2xl shadow-card min-h-0 relative">
            <div className="p-4 border-b border-border shrink-0 bg-surface/50 rounded-t-2xl flex justify-between items-center">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <FaClock className="text-primary" /> Daily Timeline
              </h3>
              <div className="text-xs font-semibold text-muted bg-background px-3 py-1 rounded-full border border-border">
                {totalPlannedTimeSlots > 0
                  ? `${totalPlannedHours}h ${totalPlannedMins}m planned`
                  : 'Slot unused space'}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-1 relative pr-4">
              {/* Timeline continuous vertical line */}
              <div className="absolute left-[70px] top-4 bottom-4 w-px bg-border/60 z-0 content-['']" />

              {slots.map((slot, index) => {
                const hour = parseInt(slot.timeLabel.split(':')[0])
                const isFullHour = slot.timeLabel.endsWith(':00')

                // Multi-slot hidden logic
                let isHidden = false
                for (let prev = Math.max(0, index - 8); prev < index; prev++) {
                  const pSlot = slots[prev]
                  if (pSlot.taskId) {
                    const t = tasks.find((x) => x.id === pSlot.taskId)
                    if (t) {
                      const span = Math.ceil(t.duration / 0.5)
                      if (index < prev + span) {
                        isHidden = true
                        break
                      }
                    }
                  }
                }

                if (isHidden) return null

                const occupantTask = slot.taskId ? tasks.find((t) => t.id === slot.taskId) : null
                const spanCount = occupantTask ? Math.ceil(occupantTask.duration / 0.5) : 1

                return (
                  <Droppable key={slot.id} droppableId={slot.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex items-stretch group relative z-10 ${snapshot.isDraggingOver ? 'bg-primary/5 rounded-xl ring-1 ring-primary/30' : ''}`}
                        style={{
                          height: `${spanCount * 44 + (spanCount - 1) * 4}px`,
                          minHeight: '44px'
                        }}
                      >
                        <div
                          className={`w-[72px] shrink-0 flex items-start pt-3 pr-4 text-xs font-semibold ${isFullHour ? 'text-foreground' : 'text-subtle'}`}
                        >
                          {slot.timeLabel}
                        </div>

                        <div className="relative flex items-start justify-center shrink-0 w-2 mr-3 pt-3">
                          <div
                            className={`w-2 h-2 rounded-full border-2 ${isFullHour ? 'border-primary bg-background' : 'border-border bg-border'} z-10 transition-colors group-hover:border-primary-hover`}
                          />
                        </div>

                        <div className="flex-1 h-full pb-1">
                          {slot.taskId && occupantTask ? (
                            <Draggable draggableId={`timeline-${slot.taskId}-${slot.id}`} index={0}>
                              {(dragProvided, dragSnapshot) => (
                                <div
                                  ref={dragProvided.innerRef}
                                  {...dragProvided.draggableProps}
                                  {...dragProvided.dragHandleProps}
                                  className={`w-full h-full px-4 rounded-xl text-sm border shadow-sm flex items-center gap-3 transition-colors ${
                                    dragSnapshot.isDragging
                                      ? 'bg-background border-primary scale-[1.02] z-50 shadow-lg ring-4 ring-primary/20'
                                      : occupantTask.completed
                                        ? 'bg-surface border-border text-muted opacity-80'
                                        : 'bg-primary/10 border-primary/20 text-foreground hover:border-primary/50'
                                  }`}
                                >
                                  {occupantTask.completed ? (
                                    <FaCheckCircle className="text-emerald-500 shrink-0 text-xl" />
                                  ) : (
                                    <div className="w-2 h-2 bg-primary rounded-full shrink-0 ml-1 mr-1 shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p
                                      className={`font-bold truncate ${occupantTask.completed ? 'line-through' : ''}`}
                                    >
                                      {occupantTask.content}
                                    </p>
                                    {occupantTask.duration > 0.5 && (
                                      <p className="text-xs font-medium text-primary/70">
                                        {occupantTask.duration * 60} minutes
                                      </p>
                                    )}
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ) : (
                            <div className="h-full w-full border-2 border-dashed border-transparent rounded-xl flex items-center justify-center px-4 text-xs text-transparent group-hover:border-border/50 group-hover:text-muted transition-colors">
                              Drop task here...
                            </div>
                          )}
                          {provided.placeholder}
                        </div>
                      </div>
                    )}
                  </Droppable>
                )
              })}
            </div>
          </div>
        </DragDropContext>
      </div>

      {/* Nightly Review Modal */}
      {showReview && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in duration-200">
          <div className="bg-card border-2 border-border shadow-2xl rounded-2xl max-w-md w-full mx-4 overflow-hidden">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 text-white text-center">
              <FaMoon className="w-12 h-12 mx-auto mb-4 opacity-90" />
              <h3 className="text-2xl font-bold mb-1">Daily Review</h3>
              <p className="text-white/80 text-sm">
                Great job today! Here are your end of day stats.
              </p>
            </div>

            <div className="p-6 grid grid-cols-2 gap-4">
              <div className="bg-surface rounded-xl p-4 border border-border">
                <div className="text-subtle text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <FaClock /> Planned Time
                </div>
                <div className="text-xl font-bold text-foreground">
                  {totalPlannedHours}h {totalPlannedMins}m
                </div>
              </div>

              <div className="bg-surface rounded-xl p-4 border border-border">
                <div className="text-subtle text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <FaCheck /> Completed
                </div>
                <div className="text-xl font-bold text-emerald-500">
                  {completedTasks} <span className="text-subtle text-sm">/ {totalTasks}</span>
                </div>
              </div>

              <div className="bg-surface rounded-xl p-4 border border-border">
                <div className="text-subtle text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <FaChartPie /> Sessions
                </div>
                <div className="text-xl font-bold text-foreground">
                  8 <span className="text-subtle text-sm">sessions</span>
                </div>
                <div className="text-xs text-muted mt-1">4h 52m focused</div>
              </div>

              <div className="bg-surface rounded-xl p-4 border border-border">
                <div className="text-subtle text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <FaTint /> Water
                </div>
                <div className="text-xl font-bold text-blue-500">82%</div>
                <div className="w-full bg-background h-1.5 rounded-full mt-2 overflow-hidden border border-border/50">
                  <div className="bg-blue-500 h-full w-[82%]" />
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-border bg-surface/50">
              <button
                onClick={() => setShowReview(false)}
                className="w-full py-3 rounded-xl font-medium bg-primary hover:bg-primary-hover text-white shadow-md transition-all cursor-pointer"
              >
                Close Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
