'use client'

import { useState, useEffect } from 'react'
import { Plus, Check, Edit2, Trash2, Calendar } from 'lucide-react'
import { DatePicker } from '@/components/ui/date-picker'

interface Todo {
  id: string
  title: string
  description?: string
  is_completed: boolean
  due_date?: string
  reminder_time?: string
  completed_at?: string
  created_at: string
  updated_at: string
}

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [newTodo, setNewTodo] = useState('')
  const [newTodoDueDate, setNewTodoDueDate] = useState<Date | undefined>()
  const [isAdding, setIsAdding] = useState(false)

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
      const tempUserId = crypto.randomUUID()
      
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newTodo,
          user_id: tempUserId,
        }),
      })
      
      if (response.ok) {
        setNewTodo('')
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

  // Toggle todo completion
  const toggleTodo = async (id: string, isCompleted: boolean) => {
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
        fetchTodos() // Refresh list
      }
    } catch (error) {
      console.error('Error updating todo:', error)
    }
  }

  // Delete todo
  const deleteTodo = async (id: string) => {
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        fetchTodos() // Refresh list
      }
    } catch (error) {
      console.error('Error deleting todo:', error)
    }
  }

  useEffect(() => {
    fetchTodos()
  }, [])

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
            todos.map((todo) => (
              <div
                key={todo.id}
                className={`bg-card rounded-lg border p-4 transition-all duration-200 ${
                  todo.is_completed ? 'opacity-75' : ''
                }`}
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
                    <p className="text-xs text-muted-foreground mt-2">
                      Created: {new Date(todo.created_at).toLocaleDateString()}
                      {todo.completed_at && (
                        <span className="ml-3">
                          Completed: {new Date(todo.completed_at).toLocaleDateString()}
                        </span>
                      )}
                    </p>
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
            ))
          )}
        </div>
      </div>
    </div>
  )
}