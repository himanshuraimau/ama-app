"use client"

import React, { useState, useEffect } from 'react'
import { ApiResponse } from '@/types/ApiResponse'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import axios, { AxiosError } from 'axios'
import { Loader2, User, Mail, Lock, CheckCircle, XCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { signUpSchema } from '@/schemas/signUpSchema'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

const useUsernameCheck = (initialUsername: string) => {
  const [username, setUsername] = useState(initialUsername)
  const [usernameMessage, setUsernameMessage] = useState('')
  const [isCheckingUsername, setIsCheckingUsername] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (username) {
        checkUsernameUnique(username)
      } else {
        setUsernameMessage('')
        setIsCheckingUsername(false)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [username])

  const checkUsernameUnique = async (value: string) => {
    setIsCheckingUsername(true)
    setUsernameMessage('')
    try {
      const response = await axios.get<ApiResponse>(
        `/api/check-username-unique?username=${value}`
      )
      setUsernameMessage(response.data.message)
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      setUsernameMessage(
        axiosError.response?.data.message ?? 'Error checking username'
      )
    } finally {
      setIsCheckingUsername(false)
    }
  }

  return { username, setUsername, usernameMessage, isCheckingUsername }
}

export default function SignUpForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const { username, setUsername, usernameMessage, isCheckingUsername } = useUsernameCheck('')

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
  })

  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    if (isCheckingUsername || usernameMessage !== 'Username is unique') {
      toast({
        title: 'Error',
        description: 'Please wait for username validation or choose a unique username.',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)
    try {
      const response = await axios.post<ApiResponse>('/api/sign-up', data)

      toast({
        title: 'Success',
        description: response.data.message,
      })

      router.replace(`/verify/${username}`)
    } catch (error) {
      console.error('Error during sign-up:', error)

      const axiosError = error as AxiosError<ApiResponse>
      const errorMessage = axiosError.response?.data.message || 'There was a problem with your sign-up. Please try again.'

      toast({
        title: 'Sign Up Failed',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Join True Feedback</CardTitle>
          <p className="text-center text-muted-foreground">Sign up to start your anonymous adventure</p>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                name="username"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          className="pl-8"
                          placeholder="Choose a unique username"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e)
                            setUsername(e.target.value)
                          }}
                        />
                      </div>
                    </FormControl>
                    {isCheckingUsername && (
                      <div className="flex items-center text-muted-foreground">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Checking username...
                      </div>
                    )}
                    {!isCheckingUsername && usernameMessage && (
                      <div className={`flex items-center ${
                        usernameMessage === 'Username is unique' ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {usernameMessage === 'Username is unique' ? (
                          <CheckCircle className="mr-2 h-4 w-4" />
                        ) : (
                          <XCircle className="mr-2 h-4 w-4" />
                        )}
                        {usernameMessage}
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="email"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input className="pl-8" placeholder="Enter your email" {...field} />
                      </div>
                    </FormControl>
                    <p className='text-sm text-muted-foreground'>We'll send you a verification code</p>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="password"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input className="pl-8" type="password" placeholder="Create a strong password" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                className="w-full"
                disabled={isSubmitting || isCheckingUsername || usernameMessage !== 'Username is unique'}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing Up...
                  </>
                ) : (
                  'Sign Up'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter>
          <p className="text-center text-sm text-muted-foreground w-full">
            Already a member?{' '}
            <Link href="/sign-in" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}