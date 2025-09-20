import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Mail, ArrowLeft, Heart, Check } from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import { authService } from '@/services/auth'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  
  const navigate = useNavigate()

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!email.trim()) {
      errors.email = 'Email is verplicht'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Ongeldig email format'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const response = await authService.resetPassword(email)
      
      if (!response.success) {
        setError(response.error || 'Er is iets misgegaan')
      } else {
        setIsSuccess(true)
      }
    } catch (err) {
      console.error('Password reset error:', err)
      setError('Er is iets misgegaan. Probeer het later opnieuw.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToLogin = () => {
    navigate('/login')
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                <Check size={32} className="text-green-500" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-foreground">
              Email verzonden!
            </h1>
            <p className="text-muted-foreground">
              Controleer je inbox voor instructies
            </p>
          </div>

          {/* Success Card */}
          <Card className="shadow-lg">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Instructies verzonden</h3>
                  <p className="text-sm text-muted-foreground">
                    We hebben een email gestuurd naar{' '}
                    <span className="font-medium text-foreground">{email}</span>{' '}
                    met instructies om je wachtwoord te resetten.
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Geen email ontvangen? Controleer je spam folder of probeer het opnieuw.
                  </p>
                </div>

                <div className="space-y-3 pt-4">
                  <Button
                    onClick={() => setIsSuccess(false)}
                    variant="outline"
                    className="w-full"
                  >
                    Opnieuw verzenden
                  </Button>
                  
                  <Button
                    onClick={handleBackToLogin}
                    className="w-full"
                  >
                    Terug naar inloggen
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <Heart size={32} className="text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            Wachtwoord vergeten?
          </h1>
          <p className="text-muted-foreground">
            Geen probleem! Voer je email in en we sturen je reset instructies.
          </p>
        </div>

        {/* Reset Form */}
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle>Wachtwoord resetten</CardTitle>
            <CardDescription>
              Voer het email adres van je account in
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error Alert */}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email adres</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="naam@voorbeeld.nl"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`pl-10 ${validationErrors.email ? 'border-destructive' : ''}`}
                    disabled={isLoading}
                  />
                </div>
                {validationErrors.email && (
                  <p className="text-sm text-destructive">{validationErrors.email}</p>
                )}
              </div>

              {/* Info Text */}
              <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                <p>
                  Na het versturen ontvang je een email met een link om je wachtwoord 
                  te resetten. De link is 24 uur geldig.
                </p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Versturen...' : 'Reset instructies versturen'}
              </Button>

              {/* Back to Login */}
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={handleBackToLogin}
                disabled={isLoading}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Terug naar inloggen
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Register Link */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Nog geen account?{' '}
            <Link
              to="/register"
              className="text-primary hover:underline font-medium"
            >
              Registreer hier
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword