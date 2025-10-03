import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Store, User, Shield } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/auth/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false)
  const { user, loading: authLoading, signIn, signUp } = useAuth()

  if (user && !authLoading) {
    return <Navigate to="/" replace />
  }

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    const { error } = await signIn(email, password)

    if (error) {
      toast.error("Failed to sign in", { description: error.message })
    } else {
      toast.success("Successfully signed in!")
    }
    setIsLoading(false)
  }

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const fullName = formData.get("fullName") as string
    const role = formData.get("role") as "admin" | "employee"

    const { error } = await signUp(email, password, fullName, role)

    if (error) {
      toast.error("Failed to create account", { description: error.message })
    } else {
      toast.success("Account created successfully!", {
        description: "Please check your email to verify your account.",
      })
    }
    setIsLoading(false)
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-white/20 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Store size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">StoreFlow</h1>
          <p className="text-white/80">Your complete store management solution</p>
        </div>

        <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Welcome</CardTitle>
            <CardDescription className="text-center">
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="space-y-4">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      name="password"
                      type="password"
                      placeholder="Enter your password"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing In..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      name="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      name="password"
                      type="password"
                      placeholder="Choose a password"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-role">Role</Label>
                    <Select name="role" defaultValue="employee">
                      <SelectTrigger>
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="employee">
                          <div className="flex items-center gap-2">
                            <User size={16} />
                            Employee
                          </div>
                        </SelectItem>
                        <SelectItem value="admin">
                          <div className="flex items-center gap-2">
                            <Shield size={16} />
                            Admin
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-white/60 text-sm">
            Demo credentials: admin@store.com / password (Admin) | employee@store.com / password (Employee)
          </p>
        </div>
      </div>
    </div>
  )
}
