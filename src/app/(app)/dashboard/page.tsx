'use client'

import { MessageCard } from '@/components/MessageCard'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/ui/use-toast'
import { Message } from '@/model/User'
import { ApiResponse } from '@/types/ApiResponse'
import { zodResolver } from '@hookform/resolvers/zod'
import axios, { AxiosError } from 'axios'
import { Loader2, RefreshCcw, Copy, Link, Bell } from 'lucide-react'
import { User } from 'next-auth'
import { useSession } from 'next-auth/react'
import React, { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { acceptMessageSchema } from '@/schemas/acceptMessageSchema'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

function UserDashboard() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSwitchLoading, setIsSwitchLoading] = useState(false)
  const { toast } = useToast()
  const { data: session } = useSession()

  const form = useForm({
    resolver: zodResolver(acceptMessageSchema),
  })

  const { register, watch, setValue } = form
  const acceptMessages = watch('acceptMessages')

  const handleDeleteMessage = useCallback(
    (messageId: string) => {
      setMessages((prevMessages) =>
        prevMessages.filter((message) => message._id !== messageId)
      )
    },
    [setMessages]
  )

  const fetchAcceptMessages = useCallback(async () => {
    setIsSwitchLoading(true)
    try {
      const response = await axios.get<ApiResponse>('/api/accept-messages')
      setValue('acceptMessages', response.data.isAcceptingMessages)
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      toast({
        title: 'Error',
        description:
          axiosError.response?.data.message ??
          'Failed to fetch message settings',
        variant: 'destructive',
      })
    } finally {
      setIsSwitchLoading(false)
    }
  }, [setValue, toast])

  const fetchMessages = useCallback(async (refresh: boolean = false) => {
    setIsLoading(true)
    try {
      const response = await axios.get<ApiResponse>('/api/get-messages')
      setMessages(response.data.messages || [])
      if (refresh) {
        toast({
          title: 'Refreshed Messages',
          description: 'Showing latest messages',
        })
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      if (axiosError.response?.status === 404) {
        setMessages([])
        toast({
          title: 'No Messages',
          description: 'You have no messages at the moment.',
          variant: 'default',
        })
      } else {
        toast({
          title: 'Error',
          description: axiosError.response?.data.message ?? 'Failed to fetch messages',
          variant: 'destructive',
        })
      }
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    if (!session || !session.user) return
    fetchMessages()
    fetchAcceptMessages()
  }, [session, fetchAcceptMessages, fetchMessages])

    const handleSwitchChange = async () => {
      try {
        const response = await axios.post<ApiResponse>('/api/accept-messages', {
          acceptMessages: !acceptMessages,
        })
        setValue('acceptMessages', !acceptMessages)
        toast({
          title: response.data.message,
          variant: 'default',
        })
      } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>
        toast({
          title: 'Error',
          description:
            axiosError.response?.data.message ??
            'Failed to update message settings',
          variant: 'destructive',
        })
      }
    }

    if (!session || !session.user) {
      return <div></div>
    }

    const { username } = session.user as User

    const baseUrl = `${window.location.protocol}//${window.location.host}`
    const profileUrl = `${baseUrl}/u/${username}`

    const copyToClipboard = () => {
      navigator.clipboard.writeText(profileUrl)
      toast({
        title: 'URL Copied!',
        description: 'Profile URL has been copied to clipboard.',
      })
    }

    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Welcome, {username}!</CardTitle>
            <CardDescription>Manage your messages and settings here.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-2">Your Unique Link</h2>
                <div className="flex items-center space-x-2">
                  <Input value={profileUrl} readOnly className="flex-grow" />
                  <Button onClick={copyToClipboard} variant="outline">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button variant="outline" asChild>
                    <a href={profileUrl} target="_blank" rel="noopener noreferrer">
                      <Link className="h-4 w-4 mr-2" />
                      Visit
                    </a>
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    {...register('acceptMessages')}
                    checked={acceptMessages}
                    onCheckedChange={handleSwitchChange}
                    disabled={isSwitchLoading}
                  />
                  <span>Accept Messages</span>
                </div>
                <Badge variant={acceptMessages ? "default" : "secondary"}>
                  {acceptMessages ? "On" : "Off"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">Your Messages</CardTitle>
              <CardDescription>You have {messages.length} messages.</CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={() => fetchMessages(true)}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCcw className="h-4 w-4" />
              )}
              Refresh
            </Button>
          </CardHeader>
          <CardContent>
            {messages.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {messages.map((message) => (
                  <MessageCard
                    key={message._id}
                    message={message}
                    onMessageDelete={handleDeleteMessage}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-xl font-semibold text-gray-600">No messages yet</p>
                <p className="text-gray-500">Share your link to start receiving messages!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  export default UserDashboard