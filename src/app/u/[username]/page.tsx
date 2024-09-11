'use client'

import React, { useState } from 'react'
import axios, { AxiosError } from 'axios'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Loader2, Send, RefreshCw, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { CardHeader, CardContent, Card } from '@/components/ui/card'
import { useCompletion } from 'ai/react'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/components/ui/use-toast'
import * as z from 'zod'
import { ApiResponse } from '@/types/ApiResponse'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { messageSchema } from '@/schemas/messageSchema'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

const specialChar = '||'

const parseStringMessages = (messageString: string): string[] => {
  return messageString.split(specialChar)
}

const initialMessageString =
  "What's your favorite movie?||Do you have any pets?||What's your dream job?"

export default function SendMessage() {
  const params = useParams<{ username: string }>()
  const username = params.username

  const {
    complete,
    completion,
    isLoading: isSuggestLoading,
    error,
  } = useCompletion({
    api: '/api/suggest-messages',
    initialCompletion: initialMessageString,
  })

  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
  })

  const messageContent = form.watch('content')

  const handleMessageClick = (message: string) => {
    form.setValue('content', message)
  }

  const [isLoading, setIsLoading] = useState(false)

  const onSubmit = async (data: z.infer<typeof messageSchema>) => {
    setIsLoading(true)
    try {
      const response = await axios.post<ApiResponse>('/api/send-message', {
        ...data,
        username,
      })

      toast({
        title: 'Success',
        description: response.data.message,
        variant: 'default',
      })
      form.reset({ ...form.getValues(), content: '' })
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      toast({
        title: 'Error',
        description:
          axiosError.response?.data.message ?? 'Failed to send message',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchSuggestedMessages = async () => {
    try {
      complete('')
    } catch (error) {
      console.error('Error fetching messages:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch suggested messages',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="container mx-auto my-8 p-6 bg-gradient-to-b from-gray-50 to-white rounded-lg shadow-md max-w-4xl">
      <h1 className="text-4xl font-bold mb-6 text-center text-gray-800">
        Send a Message to @{username}
      </h1>
      <Alert className="mb-6">
        <MessageSquare className="h-4 w-4" />
        <AlertTitle>Anonymous Messaging</AlertTitle>
        <AlertDescription>
          Your message will be sent anonymously. Be kind and respectful!
        </AlertDescription>
      </Alert>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-semibold text-gray-700">Your Message</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Write your anonymous message here..."
                    className="resize-none h-32 focus:ring-2 focus:ring-blue-500"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-center">
            <Button
              type="submit"
              disabled={isLoading || !messageContent}
              className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-5 w-5" />
                  Send Message
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>

      <div className="space-y-4 my-8">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <Button
            onClick={fetchSuggestedMessages}
            className="mb-4 sm:mb-0 bg-gray-200 text-gray-800 hover:bg-gray-300"
            disabled={isSuggestLoading}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            {isSuggestLoading ? 'Suggesting...' : 'Suggest Messages'}
          </Button>
          <p className="text-sm text-gray-600 italic">Click on any message below to use it</p>
        </div>
        <Card className="bg-white shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <h3 className="text-xl font-semibold text-gray-800">Suggested Messages</h3>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4">
            {error ? (
              <p className="text-red-500 col-span-full">{error.message}</p>
            ) : (
              parseStringMessages(completion).map((message, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="text-left h-auto py-2 px-4 border border-gray-300 hover:border-blue-500 hover:bg-blue-50 whitespace-normal break-words"
                  onClick={() => handleMessageClick(message)}
                >
                  {message}
                </Button>
              ))
            )}
          </CardContent>
        </Card>
      </div>
      <Separator className="my-8" />
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">Want Your Own Message Board?</h3>
        <Link href="/sign-up">
          <Button className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-full transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg">
            Create Your Account
          </Button>
        </Link>
      </div>
    </div>
  )
}