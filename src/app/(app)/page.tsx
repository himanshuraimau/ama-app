'use client'

import { Mail, Shield, Eye, MessageSquare } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Autoplay from 'embla-carousel-autoplay'
import messages from '@/messages.json'

import Link from 'next/link';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {/* Hero Section */}
      <header className="py-20 px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
          Unleash Honest Feedback
        </h1>
        <p className="text-xl md:text-2xl mb-8 text-gray-300">
          Where anonymity meets authenticity
        </p>
        <Link href="/sign-up">
        <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
          Get Started
        </Button>
        </Link>
      </header>

      {/* Main content */}
      <main className="flex-grow flex flex-col items-center justify-center px-4 md:px-24 py-12">
        {/* Carousel for Messages */}
        <Carousel
          plugins={[Autoplay({ delay: 3000 })]}
          className="w-full max-w-3xl mb-16"
        >
          <CarouselContent>
            {messages.map((message, index) => (
              <CarouselItem key={index} className="p-4">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-purple-400">{message.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex items-start space-x-4">
                    <Mail className="flex-shrink-0 text-pink-500" />
                    <div>
                      <p className="text-gray-300">{message.content}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {message.received}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="text-white" />
          <CarouselNext className="text-white" />
        </Carousel>

        {/* Features Section */}
        <section className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Shield className="h-12 w-12 text-purple-400" />}
            title="100% Anonymous"
            description="Your identity is always protected. Share without fear."
          />
          <FeatureCard
            icon={<Eye className="h-12 w-12 text-pink-400" />}
            title="Transparent"
            description="See all feedback openly. No hidden agendas."
          />
          <FeatureCard
            icon={<MessageSquare className="h-12 w-12 text-blue-400" />}
            title="Actionable Insights"
            description="Turn feedback into meaningful improvements."
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h2 className="text-2xl font-bold text-purple-400">True Feedback</h2>
            <p>© 2023 True Feedback. All rights reserved.</p>
          </div>
          <nav className="flex space-x-4">
            <a href="#" className="hover:text-purple-400">About</a>
            <a href="#" className="hover:text-purple-400">Privacy</a>
            <a href="#" className="hover:text-purple-400">Terms</a>
            <a href="#" className="hover:text-purple-400">Contact</a>
          </nav>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }:any) {
  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardContent className="flex flex-col items-center text-center p-6">
        {icon}
        <h3 className="text-xl font-semibold mt-4 mb-2">{title}</h3>
        <p className="text-gray-400">{description}</p>
      </CardContent>
    </Card>
  )
}