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
  FaChartPie
} from 'react-icons/fa'

interface Task {
  id: string
  content: string
  completed: boolean
}

interface TimelineSlot {
  id: string
  timeLabel: string
  taskId: string | null
}

const generateEmptySlots = (): TimelineSlot[] => {
  const slots: TimelineSlot[] = []
  for (let hour = 6; hour <= 23; hour++) {
    for (let min of [0, 30]) {
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
      const savedDate = await window.electron.ipcRenderer.invoke('store-get', 'planner-date')

      const todayStr = new Date().toDateString()
      if (savedDate !== todayStr) {
        // New day! Clear the board but keep some tasks if you want, for now clear slots
        window.electron.ipcRenderer.invoke('store-set', 'planner-date', todayStr)
        setSlots(generateEmptySlots())
      } else {
        if (savedTasks) setTasks(savedTasks)
        if (savedSlots) setSlots(savedSlots)
      }
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
      // Trying to drop a task into a slot
      const updatedSlots = [...slots]
      const targetSlotIndex = updatedSlots.findIndex((s) => s.id === destination.droppableId)

      if (updatedSlots[targetSlotIndex].taskId !== null) {
        // Slot taken, abort
        return
      }

      updatedSlots[targetSlotIndex].taskId = draggableId
      setSlots(updatedSlots)
      return
    }

    if (source.droppableId.startsWith('slot-') && destination.droppableId.startsWith('slot-')) {
      const updatedSlots = [...slots]
      const sourceSlot = updatedSlots.find((s) => s.id === source.droppableId)
      const destSlotIndex = updatedSlots.findIndex((s) => s.id === destination.droppableId)

      if (updatedSlots[destSlotIndex].taskId !== null || !sourceSlot) return

      updatedSlots[destSlotIndex].taskId = sourceSlot.taskId
      sourceSlot.taskId = null
      setSlots(updatedSlots)
      return
    }

    if (source.droppableId.startsWith('slot-') && destination.droppableId === 'unassigned-tasks') {
      // Remove from slot
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
    setTasks([...tasks, { id: uid(), content: newTaskInput.trim(), completed: false }])
    setNewTaskInput('')
  }

  const toggleTaskCompletion = (taskId: string) => {
    setTasks(tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t)))
  }

  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter((t) => t.id !== taskId))
    setSlots(slots.map((s) => (s.taskId === taskId ? { ...s, taskId: null } : s)))
  }

  // Derived Review Stats
  const todayDateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const totalPlannedTimeSlots = slots.filter((s) => s.taskId !== null).length
  const totalPlannedHours = Math.floor(totalPlannedTimeSlots / 2)
  const totalPlannedMins = (totalPlannedTimeSlots % 2) * 30

  const completedTasks = tasks.filter((t) => t.completed).length
  const totalTasks = tasks.length

  const getTaskContent = (id: string) => tasks.find((t) => t.id === id)?.content || 'Unknown'
  const isTaskCompleted = (id: string) => tasks.find((t) => t.id === id)?.completed || false

  return (
    <div className="flex flex-col h-full overflow-hidden text-foreground">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">TODAY — {todayDateStr}</h2>
          <p className="text-muted mt-1">Drag your tasks into your timeline to plan your day.</p>
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

            <form onSubmit={handleAddTask} className="flex gap-2 mb-4 shrink-0">
              <input
                type="text"
                value={newTaskInput}
                onChange={(e) => setNewTaskInput(e.target.value)}
                placeholder="Add a new task..."
                className="flex-1 px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary"
              />
              <button
                type="submit"
                className="w-10 h-10 bg-primary hover:bg-primary-hover text-white rounded-xl flex items-center justify-center transition-colors"
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
                    // If a task is placed in the timeline, we still show it here but greyed out?
                    // No, usually it's better to show all tasks here as a checklist.
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
                              className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${task.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-muted hover:border-primary'}`}
                            >
                              {task.completed && <FaCheck className="w-3 h-3" />}
                            </button>

                            <span
                              className={`flex-1 text-sm ${task.completed ? 'line-through text-muted' : ''} ${isPlaced ? 'text-muted' : ''}`}
                            >
                              {task.content}
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
                  {tasks.length === 0 && (
                    <div className="text-center p-8 border-2 border-dashed border-border rounded-xl text-subtle text-sm">
                      Your task pool is empty. Add a task to start planning!
                    </div>
                  )}
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
                  : 'No time planned'}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-1 relative">
              {/* Timeline continuous vertical line */}
              <div className="absolute left-[70px] top-4 bottom-4 w-px bg-border/60 z-0 content-['']" />

              {slots.map((slot) => {
                const hour = parseInt(slot.timeLabel.split(':')[0])
                const isFullHour = slot.timeLabel.endsWith(':00')

                return (
                  <Droppable key={slot.id} droppableId={slot.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex items-stretch min-h-[44px] group relative z-10 ${snapshot.isDraggingOver ? 'bg-primary/5 rounded-xl ring-1 ring-primary/30' : ''}`}
                      >
                        <div
                          className={`w-[72px] shrink-0 flex items-center pr-4 text-xs font-semibold ${isFullHour ? 'text-foreground' : 'text-subtle'}`}
                        >
                          {slot.timeLabel}
                        </div>

                        <div className="relative flex items-center justify-center shrink-0 w-2 mr-3">
                          <div
                            className={`w-2 h-2 rounded-full border-2 ${isFullHour ? 'border-primary bg-background' : 'border-border bg-border'} z-10 transition-colors group-hover:border-primary-hover`}
                          />
                        </div>

                        <div className="flex-1 py-1">
                          {slot.taskId ? (
                            <Draggable draggableId={`timeline-${slot.taskId}-${slot.id}`} index={0}>
                              {(dragProvided, dragSnapshot) => (
                                <div
                                  ref={dragProvided.innerRef}
                                  {...dragProvided.draggableProps}
                                  {...dragProvided.dragHandleProps}
                                  className={`px-4 py-2 rounded-xl text-sm border shadow-sm flex items-center gap-3 transition-colors ${
                                    dragSnapshot.isDragging
                                      ? 'bg-background border-primary scale-[1.02] z-50 shadow-md'
                                      : isTaskCompleted(slot.taskId!)
                                        ? 'bg-surface border-border text-muted opacity-80'
                                        : 'bg-primary/10 border-primary/20 text-foreground hover:bg-primary/15'
                                  }`}
                                >
                                  {isTaskCompleted(slot.taskId!) ? (
                                    <FaCheckCircle className="text-emerald-500 shrink-0" />
                                  ) : (
                                    <div className="w-1.5 h-1.5 bg-primary rounded-full shrink-0" />
                                  )}
                                  <span
                                    className={`flex-1 truncate ${isTaskCompleted(slot.taskId!) ? 'line-through' : ''}`}
                                  >
                                    {getTaskContent(slot.taskId!)}
                                  </span>
                                </div>
                              )}
                            </Draggable>
                          ) : (
                            <div className="h-full w-full border border-transparent rounded-xl flex items-center px-4 text-xs text-transparent group-hover:bg-surface/30 group-hover:text-muted transition-colors">
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
                  <FaCheck /> Completed Tasks
                </div>
                <div className="text-xl font-bold text-emerald-500">
                  {completedTasks} <span className="text-subtle text-sm">/ {totalTasks}</span>
                </div>
              </div>

              {/* Simulated Stats for OS feel */}
              <div className="bg-surface rounded-xl p-4 border border-border">
                <div className="text-subtle text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <FaChartPie /> Focus Sessions
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
