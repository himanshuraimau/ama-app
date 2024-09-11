"use client";
import React, { useState, useEffect } from 'react';
import { ApiResponse } from '@/types/ApiResponse';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import axios, { AxiosError } from 'axios';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signUpSchema } from '@/schemas/signUpSchema';

// Custom hook for debounced username checking
const useUsernameCheck = (initialUsername: string) => {
  const [username, setUsername] = useState(initialUsername);
  const [usernameMessage, setUsernameMessage] = useState('');
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (username) {
        checkUsernameUnique(username);
      } else {
        setUsernameMessage('');
        setIsCheckingUsername(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username]);

  const checkUsernameUnique = async (value: string) => {
    setIsCheckingUsername(true);
    setUsernameMessage('');
    try {
      const response = await axios.get<ApiResponse>(
        `/api/check-username-unique?username=${value}`
      );
      setUsernameMessage(response.data.message);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      setUsernameMessage(
        axiosError.response?.data.message ?? 'Error checking username'
      );
    } finally {
      setIsCheckingUsername(false);
    }
  };

  return { username, setUsername, usernameMessage, isCheckingUsername };
};

export default function SignUpForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const { username, setUsername, usernameMessage, isCheckingUsername } = useUsernameCheck('');

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    if (isCheckingUsername || usernameMessage !== 'Username is unique') {
      toast({
        title: 'Error',
        description: 'Please wait for username validation or choose a unique username.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post<ApiResponse>('/api/sign-up', data);

      toast({
        title: 'Success',
        description: response.data.message,
      });

      router.replace(`/verify/${username}`);
    } catch (error) {
      console.error('Error during sign-up:', error);

      const axiosError = error as AxiosError<ApiResponse>;
      const errorMessage = axiosError.response?.data.message || 'There was a problem with your sign-up. Please try again.';

      toast({
        title: 'Sign Up Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-800">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Join True Feedback
          </h1>
          <p className="mb-4">Sign up to start your anonymous adventure</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              name="username"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <Input
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      setUsername(e.target.value);
                    }}
                  />
                  {isCheckingUsername && <Loader2 className="animate-spin" />}
                  {!isCheckingUsername && usernameMessage && (
                    <p
                      className={`text-sm ${
                        usernameMessage === 'Username is unique'
                          ? 'text-green-500'
                          : 'text-red-500'
                      }`}
                    >
                      {usernameMessage}
                    </p>
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
                  <Input {...field} name="email" />
                  <p className='text-muted text-gray-400 text-sm'>We will send you a verification code</p>
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
                  <Input type="password" {...field} name="password" />
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              className='w-full' 
              disabled={isSubmitting || isCheckingUsername || usernameMessage !== 'Username is unique'}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </>
              ) : (
                'Sign Up'
              )}
            </Button>
          </form>
        </Form>
        <div className="text-center mt-4">
          <p>
            Already a member?{' '}
            <Link href="/sign-in" className="text-blue-600 hover:text-blue-800">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}