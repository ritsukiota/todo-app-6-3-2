import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { eq } from 'drizzle-orm'
import { db, todos, users, type Todo, type NewTodo } from '@/lib/db'

// Hono app instance
const app = new Hono().basePath('/api')

// Health check endpoint
app.get('/health', (c) => {
  return c.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// Get all todos
app.get('/todos', async (c) => {
  try {
    const allTodos = await db.select().from(todos)
    return c.json({ todos: allTodos })
  } catch (error) {
    console.error('Error fetching todos:', error)
    return c.json({ error: 'Failed to fetch todos' }, 500)
  }
})

// Get single todo by ID
app.get('/todos/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const todo = await db.select().from(todos).where(eq(todos.id, id))
    
    if (todo.length === 0) {
      return c.json({ error: 'Todo not found' }, 404)
    }
    
    return c.json({ todo: todo[0] })
  } catch (error) {
    console.error('Error fetching todo:', error)
    return c.json({ error: 'Failed to fetch todo' }, 500)
  }
})

// Create new todo
app.post('/todos', async (c) => {
  try {
    const body = await c.req.json()
    const { title, description, user_id, due_date } = body
    
    if (!title || !user_id) {
      return c.json({ error: 'Title and user_id are required' }, 400)
    }
    
    const newTodo: NewTodo = {
      title,
      description: description || null,
      user_id,
      due_date: due_date ? new Date(due_date) : null,
      is_completed: false
    }
    
    const createdTodo = await db.insert(todos).values(newTodo).returning()
    return c.json({ todo: createdTodo[0] }, 201)
  } catch (error) {
    console.error('Error creating todo:', error)
    return c.json({ error: 'Failed to create todo' }, 500)
  }
})

// Update todo
app.put('/todos/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const body = await c.req.json()
    const { title, description, is_completed, due_date } = body
    
    const updateData: Partial<Todo> = {
      updated_at: new Date()
    }
    
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (is_completed !== undefined) {
      updateData.is_completed = is_completed
      if (is_completed) {
        updateData.completed_at = new Date()
      } else {
        updateData.completed_at = null
      }
    }
    if (due_date !== undefined) updateData.due_date = due_date ? new Date(due_date) : null
    
    const updatedTodo = await db
      .update(todos)
      .set(updateData)
      .where(eq(todos.id, id))
      .returning()
    
    if (updatedTodo.length === 0) {
      return c.json({ error: 'Todo not found' }, 404)
    }
    
    return c.json({ todo: updatedTodo[0] })
  } catch (error) {
    console.error('Error updating todo:', error)
    return c.json({ error: 'Failed to update todo' }, 500)
  }
})

// Delete todo
app.delete('/todos/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const deletedTodo = await db.delete(todos).where(eq(todos.id, id)).returning()
    
    if (deletedTodo.length === 0) {
      return c.json({ error: 'Todo not found' }, 404)
    }
    
    return c.json({ message: 'Todo deleted successfully' })
  } catch (error) {
    console.error('Error deleting todo:', error)
    return c.json({ error: 'Failed to delete todo' }, 500)
  }
})

// Users endpoints
app.get('/users', async (c) => {
  try {
    const allUsers = await db.select().from(users)
    return c.json({ users: allUsers })
  } catch (error) {
    console.error('Error fetching users:', error)
    return c.json({ error: 'Failed to fetch users' }, 500)
  }
})

// Export handlers for Next.js
export const GET = handle(app)
export const POST = handle(app)
export const PUT = handle(app)
export const DELETE = handle(app)