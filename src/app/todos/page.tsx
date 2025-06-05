'use client'

import { useState, useEffect } from 'react'
import { Plus, Check, Edit2, Trash2, Calendar } from 'lucide-react'
import { DatePicker } from '@/components/ui/date-picker'
import toast from 'react-hot-toast'

interface Todo {
  id: string
  title: string
  description?: string | null
  is_completed: boolean
  due_date?: string | null
  reminder_time?: string | null
  completed_at?: string | null
  created_at: string
  updated_at: string
}

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [newTodo, setNewTodo] = useState('')
  const [newTodoDueDate, setNewTodoDueDate] = useState<Date | undefined>()
  const [isAdding, setIsAdding] = useState(false)

  // Get due date status for color coding
  const getDueDateStatus = (dueDateString?: string | null) => {
    if (!dueDateString) return 'none'
    
    const dueDate = new Date(dueDateString)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)
    
    // Reset time to compare dates only
    dueDate.setHours(0, 0, 0, 0)
    today.setHours(0, 0, 0, 0)
    tomorrow.setHours(0, 0, 0, 0)
    
    // Debug log
    console.log('Due date:', dueDate.toDateString(), 'Today:', today.toDateString())
    
    if (dueDate < today) return 'overdue'     // 期限切れ
    if (dueDate.getTime() === today.getTime()) return 'today'      // 今日
    if (dueDate.getTime() === tomorrow.getTime()) return 'tomorrow'   // 明日
    return 'upcoming'                         // まだ余裕
  }

  // Get color classes based on due date status
  const getDueDateClasses = (status: string) => {
    console.log('Due date status:', status) // Debug log
    switch (status) {
      case 'overdue':
        return 'border-l-4 border-red-500 bg-red-50 dark:bg-red-950/20'
      case 'today':
        return 'border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20'
      case 'tomorrow':
        return 'border-l-4 border-orange-500 bg-orange-50 dark:bg-orange-950/20'
      case 'upcoming':
        return 'border-l-4 border-green-500 bg-green-50 dark:bg-green-950/20'
      default:
        return ''
    }
  }

  // Fetch todos from API
  const fetchTodos = async () => {
    try {
      const response = await fetch('/api/todos')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setTodos(data.todos || [])
    } catch (error) {
      console.error('Error fetching todos:', error)
      setTodos([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }

  // Add new todo
  const addTodo = async () => {
    if (!newTodo.trim()) return
    
    setIsAdding(true)
    try {
      // 一時的なユーザーIDを生成（UUIDv4形式）
      const tempUserId = '550e8400-e29b-41d4-a716-446655440000'
      
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            title: newTodo,
            user_id: tempUserId,
            due_date: newTodoDueDate?.toISOString(),
          }),
      })
      
      if (response.ok) {
        setNewTodo('')
        setNewTodoDueDate(undefined)
        fetchTodos() // Refresh list
      } else {
        const errorData = await response.json()
        console.error('Error response:', errorData)
      }
    } catch (error) {
      console.error('Error adding todo:', error)
    } finally {
      setIsAdding(false)
    }
  }

  // Toggle todo completion with optimistic UI
  const toggleTodo = async (id: string, isCompleted: boolean) => {
    // Optimistic UI: Update immediately
    setTodos(prev => prev.map(todo => 
      todo.id === id ? {
        ...todo,
        is_completed: !isCompleted,
        completed_at: !isCompleted ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      } : todo
    ))
    
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_completed: !isCompleted,
        }),
      })
      
      if (response.ok) {
        const data = await response.json()
        // Update with server response
        setTodos(prev => prev.map(todo => 
          todo.id === id ? data.todo : todo
        ))
        toast.success(!isCompleted ? 'Task completed!' : 'Task reopened!')
      } else {
        throw new Error('Failed to update todo')
      }
    } catch (error) {
      console.error('Error updating todo:', error)
      // Rollback: Revert optimistic update
      setTodos(prev => prev.map(todo => 
        todo.id === id ? {
          ...todo,
          is_completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null
        } : todo
      ))
      toast.error('Failed to update task')
    }
  }

  // Delete todo with optimistic UI
  const deleteTodo = async (id: string) => {
    // Store original todo for rollback
    const originalTodo = todos.find(todo => todo.id === id)
    if (!originalTodo) return
    
    // Optimistic UI: Remove immediately
    setTodos(prev => prev.filter(todo => todo.id !== id))
    
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        toast.success('Task deleted successfully!')
      } else {
        throw new Error('Failed to delete todo')
      }
    } catch (error) {
      console.error('Error deleting todo:', error)
      // Rollback: Restore deleted todo
      setTodos(prev => {
        const newTodos = [...prev]
        const originalIndex = todos.findIndex(t => t.id === id)
        newTodos.splice(originalIndex, 0, originalTodo)
        return newTodos
      })
      toast.error('Failed to delete task')
    }
  }

  useEffect(() => {
    fetchTodos()
  }, [])

  // Calculate completion stats
  const totalTodos = todos.length
  const completedTodos = todos.filter(todo => todo.is_completed).length
  const completionRate = totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg text-muted-foreground">Loading todos...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">My TODOs</h1>
          <p className="text-muted-foreground">Manage your tasks efficiently</p>
          
          {/* Progress Bar */}
          {totalTodos > 0 && (
            <div className="mt-6 p-4 bg-card rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">
                  Progress: {completedTodos}/{totalTodos} completed
                </span>
                <span className="text-sm font-bold text-primary">
                  {completionRate}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${completionRate}%` }}
                ></div>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                {completionRate === 100 ? (
                  <span className="text-green-600 font-medium">🎉 All tasks completed!</span>
                ) : completedTodos === 0 ? (
                  <span>Get started by completing your first task!</span>
                ) : (
                  <span>{totalTodos - completedTodos} tasks remaining</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Add Todo Form */}
        <div className="bg-card rounded-lg border p-6 mb-6">
          <div className="space-y-4">
            {/* Title Input */}
            <div className="flex gap-3">
              <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="Add a new todo..."
                className="flex-1 px-4 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                onKeyPress={(e) => e.key === 'Enter' && addTodo()}
              />
              <button
                onClick={addTodo}
                disabled={isAdding || !newTodo.trim()}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                {isAdding ? 'Adding...' : 'Add'}
              </button>
            </div>
            
            {/* Due Date Input */}
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <DatePicker
                date={newTodoDueDate}
                onDateChange={setNewTodoDueDate}
                placeholder="Set due date (optional)"
              />
              {newTodoDueDate && (
                <button
                  onClick={() => setNewTodoDueDate(undefined)}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Todo List */}
        <div className="space-y-3">
          {todos.length === 0 ? (
            <div className="bg-card rounded-lg border p-8 text-center">
              <p className="text-muted-foreground text-lg">No todos yet</p>
              <p className="text-sm text-muted-foreground mt-1">Add your first todo above!</p>
            </div>
          ) : (
            todos.map((todo) => {
              const dueDateStatus = getDueDateStatus(todo.due_date)
              const dueDateClasses = getDueDateClasses(dueDateStatus)
              
              return (
                <div
                  key={todo.id}
                  className={`bg-card rounded-lg border p-4 transition-all duration-200 ${
                    todo.is_completed ? 'opacity-75' : ''
                  } ${dueDateClasses}`}
                >
                  <div className="flex items-center gap-3">
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleTodo(todo.id, todo.is_completed)}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        todo.is_completed
                          ? 'bg-primary border-primary text-primary-foreground'
                          : 'border-input hover:border-primary'
                      }`}
                    >
                      {todo.is_completed && <Check className="h-3 w-3" />}
                    </button>

                    {/* Todo Content */}
                    <div className="flex-1">
                      <h3
                        className={`font-medium ${
                          todo.is_completed
                            ? 'line-through text-muted-foreground'
                            : 'text-foreground'
                        }`}
                      >
                        {todo.title}
                      </h3>
                      {todo.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {todo.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2">
                        <p className="text-xs text-muted-foreground">
                          Created: {new Date(todo.created_at).toLocaleDateString()}
                          {todo.completed_at && (
                            <span className="ml-3">
                              Completed: {new Date(todo.completed_at).toLocaleDateString()}
                            </span>
                          )}
                        </p>
                        {todo.due_date && (
                          <p className={`text-xs px-2 py-1 rounded-full ${
                            dueDateStatus === 'overdue' ? 'text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/50' :
                            dueDateStatus === 'today' ? 'text-yellow-700 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-900/50' :
                            dueDateStatus === 'tomorrow' ? 'text-orange-700 bg-orange-100 dark:text-orange-300 dark:bg-orange-900/50' :
                            'text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/50'
                          }`}>
                            Due: {new Date(todo.due_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => {/* Edit functionality - implement later */}}
                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteTodo(todo.id)}
                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-muted rounded"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}