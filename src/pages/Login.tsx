
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import BlurredCard from '@/components/ui/BlurredCard';
import FadeIn from '@/components/animations/FadeIn';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

// Login form schema
const loginFormSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

// Sign up form schema
const signupFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;
type SignupFormValues = z.infer<typeof signupFormSchema>;

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, signUp, isAuthenticated, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('login');

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect based on user role
      if (user.role === 'student') navigate('/student');
      else if (user.role === 'reception') navigate('/reception');
      else if (user.role === 'admin') navigate('/admin');
      else navigate('/');
    }
  }, [isAuthenticated, user, navigate]);

  // Initialize login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Initialize signup form
  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const onLoginSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      // Navigation is handled by the useEffect above
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
    }
  };

  const onSignupSubmit = async (data: SignupFormValues) => {
    setIsLoading(true);
    try {
      await signUp(data.email, data.password, data.name);
      setActiveTab('login');
      // Pre-fill login form with signup email
      loginForm.setValue('email', data.email);
    } catch (error) {
      console.error('Signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Sample user credentials for demonstration
  const sampleUsers = [
    { email: 'student@bits.ac.in', password: 'password', role: 'Student' },
    { email: 'reception@bits.ac.in', password: 'password', role: 'Reception' },
    { email: 'admin@bits.ac.in', password: 'password', role: 'Admin' },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <FadeIn className="w-full max-w-md">
        <BlurredCard glowEffect className="shadow-xl">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-academic-light rounded-full flex items-center justify-center">
                <span className="font-serif text-white text-xl font-bold">B</span>
              </div>
            </div>
            <h2 className="text-2xl font-serif font-bold text-academic">
              BITS Hostel Management
            </h2>
            <p className="text-academic-text/70 mt-2">
              Access the hostel booking management system
            </p>
          </div>

          <Tabs 
            defaultValue="login" 
            value={activeTab} 
            onValueChange={setActiveTab} 
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-5">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your email"
                            {...field}
                            disabled={isLoading}
                            className="bg-white/50"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder="Enter your password"
                              type={showPassword ? 'text' : 'password'}
                              {...field}
                              disabled={isLoading}
                              className="bg-white/50 pr-10"
                            />
                            <button
                              type="button"
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                              onClick={() => setShowPassword(!showPassword)}
                              tabIndex={-1}
                            >
                              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full bg-academic hover:bg-academic/90 btn-transition"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      'Sign in'
                    )}
                  </Button>
                </form>
              </Form>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-sm text-academic-text/70 mb-4 text-center">
                  Demo Accounts (use password: "password")
                </p>
                <div className="space-y-3">
                  {sampleUsers.map((user, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-2 rounded-md bg-academic-light/5 hover:bg-academic-light/10 cursor-pointer transition-colors"
                      onClick={() => {
                        loginForm.setValue('email', user.email);
                        loginForm.setValue('password', user.password);
                      }}
                    >
                      <span className="text-sm font-medium text-academic-text">{user.email}</span>
                      <span className="text-xs px-2 py-1 rounded-full bg-academic-light/20 text-academic-text">
                        {user.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="signup">
              <Form {...signupForm}>
                <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-5">
                  <FormField
                    control={signupForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your full name"
                            {...field}
                            disabled={isLoading}
                            className="bg-white/50"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={signupForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your email"
                            {...field}
                            disabled={isLoading}
                            className="bg-white/50"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={signupForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder="Create a password"
                              type={showPassword ? 'text' : 'password'}
                              {...field}
                              disabled={isLoading}
                              className="bg-white/50 pr-10"
                            />
                            <button
                              type="button"
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                              onClick={() => setShowPassword(!showPassword)}
                              tabIndex={-1}
                            >
                              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="text-xs text-academic-text/70 mt-2">
                    <p>Note: Email must end with @bits.ac.in to get student role.</p>
                    <p className="mt-1">Special accounts for reception and admin roles:</p>
                    <p>reception@bits.ac.in & admin@bits.ac.in</p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-academic hover:bg-academic/90 btn-transition"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </BlurredCard>
      </FadeIn>
    </div>
  );
};

export default Login;
