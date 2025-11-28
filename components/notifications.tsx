"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import {
  Heart,
  MessageCircle,
  UserPlus,
  Trophy,
  Target,
  TrendingUp,
  CheckCheck,
  Clock
} from "lucide-react"

type NotificationType = 'like' | 'comment' | 'join' | 'achievement' | 'challenge' | 'milestone'

interface Notification {
  id: number
  type: NotificationType
  user?: {
    name: string
    avatar?: string
  }
  text: string
  timestamp: string
  read: boolean
}

export function NotificationsList() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      type: 'like',
      user: { name: 'Alex Chen', avatar: '/placeholder.svg' },
      text: "liked your training post",
      timestamp: "2m ago",
      read: false
    },
    {
      id: 2,
      type: 'join',
      user: { name: 'Maria Rodriguez', avatar: '/placeholder.svg' },
      text: "joined your team session",
      timestamp: "15m ago",
      read: false
    },
    {
      id: 3,
      type: 'comment',
      user: { name: 'Emma Watson', avatar: '/placeholder.svg' },
      text: "commented on your drill video",
      timestamp: "1h ago",
      read: false
    },
    {
      id: 4,
      type: 'achievement',
      text: "Unlocked new achievement: 7-day streak!",
      timestamp: "3h ago",
      read: true
    },
    {
      id: 5,
      type: 'challenge',
      user: { name: 'Jordan Smith', avatar: '/placeholder.svg' },
      text: "challenged you to a competition",
      timestamp: "5h ago",
      read: true
    },
    {
      id: 6,
      type: 'milestone',
      text: "You've completed 50 training sessions!",
      timestamp: "1d ago",
      read: true
    },
  ])

  const getNotificationIcon = (type: NotificationType) => {
    const iconClass = "h-4 w-4"
    switch (type) {
      case 'like':
        return <Heart className={`${iconClass} text-red-500`} />
      case 'comment':
        return <MessageCircle className={`${iconClass} text-sport-blue`} />
      case 'join':
        return <UserPlus className={`${iconClass} text-sport-green`} />
      case 'achievement':
        return <Trophy className={`${iconClass} text-yellow-500`} />
      case 'challenge':
        return <Target className={`${iconClass} text-sport-orange`} />
      case 'milestone':
        return <TrendingUp className={`${iconClass} text-purple-500`} />
      default:
        return <Clock className={iconClass} />
    }
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })))
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="w-full max-w-md">
      <div className="flex items-center justify-between px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold">Notifications</h3>
          <p className="text-xs text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={markAllAsRead}
            className="h-auto px-2 py-1 text-xs"
          >
            <CheckCheck className="h-3 w-3 mr-1" />
            Mark all read
          </Button>
        )}
      </div>

      <Separator />

      <ScrollArea className="h-[380px]">
        <div className="p-2">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted/30 p-4 mb-3">
                <CheckCheck className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">No notifications</p>
              <p className="text-xs text-muted-foreground mt-1">
                We&apos;ll notify you when something happens
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`
                    group relative flex gap-3 rounded-lg p-3 transition-all
                    hover:bg-accent/50 cursor-pointer
                    ${!notification.read ? 'bg-sport-blue/5 dark:bg-sport-blue/10' : 'bg-transparent'}
                  `}
                >
                  {/* Unread indicator dot */}
                  {!notification.read && (
                    <div className="absolute left-1 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-sport-blue" />
                  )}

                  <div className="flex-shrink-0 pt-0.5">
                    {notification.user ? (
                      <div className="relative">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={notification.user.avatar} alt={notification.user.name} />
                          <AvatarFallback className="text-xs">
                            {notification.user.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-0.5 -right-0.5 rounded-full bg-background p-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                      </div>
                    ) : (
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                        {getNotificationIcon(notification.type)}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-1 overflow-hidden">
                    <p className="text-sm leading-snug">
                      {notification.user && (
                        <span className="font-semibold">{notification.user.name} </span>
                      )}
                      <span className={notification.read ? 'text-muted-foreground' : ''}>
                        {notification.text}
                      </span>
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{notification.timestamp}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      <Separator />

      <div className="p-2">
        <Button asChild variant="ghost" size="sm" className="w-full justify-center">
          <Link href="/settings?tab=notifications">
            View all notifications
          </Link>
        </Button>
      </div>
    </div>
  )
}
