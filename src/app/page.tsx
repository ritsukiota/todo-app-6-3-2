import Link from 'next/link'
import { CheckSquare, ArrowRight } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="max-w-md w-full p-6">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <CheckSquare className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            TODO App
          </h1>
          <p className="text-muted-foreground">
            Manage your tasks efficiently with our modern todo application
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/todos"
            className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-between group"
          >
            <span className="font-medium">Get Started</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Built with Next.js, Hono, Drizzle, and Supabase
            </p>
          </div>
        </div>

        {/* Feature List */}
        <div className="mt-8 pt-8 border-t border-border">
          <h2 className="font-semibold text-foreground mb-4">Features:</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-primary" />
              Create and manage todos
            </li>
            <li className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-primary" />
              Mark tasks as complete
            </li>
            <li className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-primary" />
              Real-time updates
            </li>
            <li className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-primary" />
              Clean, modern interface
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
