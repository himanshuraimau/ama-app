'use client'

import React from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Button } from './ui/button'
import { User } from 'next-auth'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Home, MessageSquare, Settings, LogOut } from 'lucide-react'

function Navbar() {
  const { data: session } = useSession()
  const user: User | undefined = session?.user

  return (
    <nav className="sticky top-0 z-50 bg-gray-900 text-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <MessageSquare className="h-6 w-6" />
            <span className="text-xl font-bold">True Feedback</span>
          </Link>
          
          <div className="hidden md:flex space-x-4">
            <NavLink href="/" icon={<Home className="h-4 w-4" />}>
              Home
            </NavLink>
            {session && (
              <NavLink href="/dashboard" icon={<MessageSquare className="h-4 w-4" />}>
                Dashboard
              </NavLink>
            )}
          </div>

          {session ? (
            <UserMenu user={user} />
          ) : (
            <Link href="/sign-in">
              <Button variant="outline" className="bg-white text-gray-900 hover:bg-gray-100">
                Login
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}

function NavLink({ href, children, icon }:any) {
  return (
    <Link href={href} className="flex items-center space-x-1 hover:text-gray-300 transition-colors">
      {icon}
      <span>{children}</span>
    </Link>
  )
}

function UserMenu({ user }: { user: User | undefined }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.image || ''} alt={user?.name || ''} />
            <AvatarFallback>{user?.name?.[0] || user?.email?.[0]}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.name}</p>
            <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard" className="flex items-center">
            <MessageSquare className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings" className="flex items-center">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="flex items-center text-red-500 focus:text-red-500"
          onSelect={(event) => {
            event.preventDefault()
            signOut()
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default Navbar