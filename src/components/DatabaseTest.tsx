import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import type { User } from '@supabase/supabase-js'

export const DatabaseTest = () => {
  const [status, setStatus] = useState<string>('Testing connection...')
  const [user, setUser] = useState<User | null>(null)

  const testConnection = async () => {
    try {
      // Test database connection
      const { data, error } = await supabase.from('users').select('*').limit(1)
      
      if (error) {
        setStatus(`❌ Database Error: ${error.message}`)
      } else {
        setStatus('✅ Database Connected Successfully!')
      }
    } catch (err) {
      setStatus(`❌ Connection Error: ${err}`)
    }
  }

  const testAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    } catch (err) {
      console.error('Auth test failed:', err)
    }
  }

  useEffect(() => {
    testConnection()
    testAuth()
  }, [])

  return (
    <div className="p-4 border rounded-lg bg-muted/30">
      <h3 className="font-semibold mb-2">🔧 Database Status</h3>
      <p className="text-sm mb-2">{status}</p>
      
      <div className="flex gap-2">
        <Button onClick={testConnection} size="sm">
          Test Connection
        </Button>
        <Button onClick={testAuth} size="sm" variant="outline">
          Test Auth: {user ? '✅ Signed In' : '❌ Not Signed In'}
        </Button>
      </div>
    </div>
  )
}

export default DatabaseTest