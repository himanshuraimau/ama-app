'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, RefreshCcw, Copy, Link, Bell } from 'lucide-react';
import { User } from 'next-auth';
import { Message } from '@/model/User';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import dynamic from 'next/dynamic';

// Dynamically import MessageCard with ssr: false
const MessageCard = dynamic(() => import('@/components/MessageCard'), { ssr: false });

function UserDashboard() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSwitchLoading, setIsSwitchLoading] = useState(true);
  const [acceptMessages, setAcceptMessages] = useState(false);
  const [profileUrl, setProfileUrl] = useState('');
  const { data: session, status } = useSession();
  const { toast } = useToast();

  const fetchAcceptMessages = useCallback(async () => {
    setIsSwitchLoading(true);
    try {
      const response = await axios.get('/api/accept-messages');
      setAcceptMessages(response.data.isAcceptingMessages);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch message settings',
        variant: 'destructive',
      });
    } finally {
      setIsSwitchLoading(false);
    }
  }, [toast]);

  const fetchMessages = useCallback(async (refresh: boolean = false) => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/get-messages');
      setMessages(response.data.messages || []);
      if (refresh) {
        toast({
          title: 'Refreshed Messages',
          description: 'Showing latest messages',
        });
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        setMessages([]);
        toast({
          title: 'No Messages',
          description: 'You have no messages at the moment.',
          variant: 'default',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch messages',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const baseUrl = window.location.origin;
      const { username } = session.user as User & { username: string };
      setProfileUrl(`${baseUrl}/u/${username}`);

      fetchMessages();
      fetchAcceptMessages();
    }
  }, [status, session, fetchMessages, fetchAcceptMessages]);

  const handleSwitchChange = async () => {
    try {
      const response = await axios.post('/api/accept-messages', {
        acceptMessages: !acceptMessages,
      });
      setAcceptMessages(!acceptMessages);
      toast({
        title: response.data.message,
        variant: 'default',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update message settings',
        variant: 'destructive',
      });
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl);
    toast({
      title: 'URL Copied!',
      description: 'Profile URL has been copied to clipboard.',
    });
  };

  const handleDeleteMessage = (messageId: string) => {
    setMessages(messages.filter((message) => message._id !== messageId));
  };

  if (status === 'loading' || !session) {
    return <div>Loading...</div>;
  }

  const { username } = session.user as User & { username: string };

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
          {isLoading ? (
            <div className="text-center py-8">
              <Loader2 className="h-12 w-12 animate-spin mx-auto" />
              <p className="mt-2">Loading messages...</p>
            </div>
          ) : messages.length > 0 ? (
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
  );
}

export default UserDashboard;