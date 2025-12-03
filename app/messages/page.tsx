'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Send, MoreVertical, Phone, Video, Info, Search } from 'lucide-react'
import { AuthGuard } from '@/components/auth-guard'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

type Message = {
  id: string
  senderId: string
  content: string
  timestamp: string
  isRead: boolean
}

type Conversation = {
  id: string
  name: string
  avatar: string | null
  role: 'friend' | 'scout'
  lastMessage: string
  timestamp: string
  unread: number
  messages: Message[]
}

const mockConversations: Conversation[] = [
  {
    id: '1',
    name: 'Marcus Rodriguez',
    avatar: null,
    role: 'friend',
    lastMessage: 'Dude that crossover in your latest clip was NASTY 😤',
    timestamp: '2h ago',
    unread: 2,
    messages: [
      {
        id: 'm1',
        senderId: '1',
        content: 'Yo! Just saw your clip from yesterday',
        timestamp: '3h ago',
        isRead: true,
      },
      {
        id: 'm2',
        senderId: 'me',
        content: 'The one from the park? Or practice?',
        timestamp: '2h ago',
        isRead: true,
      },
      {
        id: 'm3',
        senderId: '1',
        content: 'Dude that crossover in your latest clip was NASTY 😤',
        timestamp: '2h ago',
        isRead: false,
      },
      {
        id: 'm4',
        senderId: '1',
        content: 'You coming to run 5s tonight? We need one more',
        timestamp: '1h ago',
        isRead: false,
      },
    ],
  },
  {
    id: '2',
    name: 'Sarah Chen',
    avatar: null,
    role: 'friend',
    lastMessage: 'Bro I literally cannot hit this passing drill, any tips?',
    timestamp: '5h ago',
    unread: 0,
    messages: [
      {
        id: 'm4',
        senderId: '2',
        content: 'Did you finish today\'s challenge yet?',
        timestamp: '6h ago',
        isRead: true,
      },
      {
        id: 'm5',
        senderId: 'me',
        content: 'Yeah just crushed it! The footwork one was brutal though',
        timestamp: '5h ago',
        isRead: true,
      },
      {
        id: 'm6',
        senderId: '2',
        content: 'Bro I literally cannot hit this passing drill, any tips?',
        timestamp: '5h ago',
        isRead: true,
      },
      {
        id: 'm7',
        senderId: 'me',
        content: 'Focus on your follow through, you\'re rushing it. I had the same problem last week',
        timestamp: '4h ago',
        isRead: true,
      },
    ],
  },
  {
    id: '3',
    name: 'Coach Taylor - UCLA',
    avatar: null,
    role: 'scout',
    lastMessage: 'Perfect! I\'ll send you the details this week. Keep up the great work!',
    timestamp: '3h ago',
    unread: 1,
    messages: [
      {
        id: 'm6',
        senderId: '3',
        content: 'Hey! I\'m Coach Taylor from UCLA. I\'ve been following your progress on AthletIQs for a few weeks now.',
        timestamp: '2d ago',
        isRead: true,
      },
      {
        id: 'm7',
        senderId: 'me',
        content: 'Oh wow, Coach Taylor! This is honestly a dream, I grew up watching UCLA basketball',
        timestamp: '2d ago',
        isRead: true,
      },
      {
        id: 'm8',
        senderId: '3',
        content: 'Your ball handling and court vision have really impressed me. The consistency in your training is exactly what we look for.',
        timestamp: '2d ago',
        isRead: true,
      },
      {
        id: 'm9',
        senderId: 'me',
        content: 'Thank you so much! I try to get at least one session in every day. The daily challenges on here really help keep me accountable',
        timestamp: '1d ago',
        isRead: true,
      },
      {
        id: 'm10',
        senderId: '3',
        content: 'I\'m from UCLA athletics. Loved your clips - would you be interested in coming down for a training session?',
        timestamp: '1d ago',
        isRead: true,
      },
      {
        id: 'm11',
        senderId: '3',
        content: 'We\'re hosting a scouting session next month. Would love to see you there if you\'re available!',
        timestamp: '1d ago',
        isRead: true,
      },
      {
        id: 'm12',
        senderId: 'me',
        content: 'YES! Absolutely, I would love to! When is it? I\'ll make sure I\'m free',
        timestamp: '23h ago',
        isRead: true,
      },
      {
        id: 'm13',
        senderId: 'me',
        content: 'Should I bring anything specific? Game footage, stats, anything like that?',
        timestamp: '23h ago',
        isRead: true,
      },
      {
        id: 'm14',
        senderId: '3',
        content: 'Just bring yourself and your work ethic! We have everything we need from your AthletIQs profile already.',
        timestamp: '4h ago',
        isRead: true,
      },
      {
        id: 'm15',
        senderId: '3',
        content: 'Perfect! I\'ll send you the details this week. Keep up the great work!',
        timestamp: '3h ago',
        isRead: false,
      },
    ],
  },
  {
    id: '4',
    name: 'Alex Thompson',
    avatar: null,
    role: 'friend',
    lastMessage: 'Just hit a 47 day streak! Let\'s gooo 💪',
    timestamp: '2d ago',
    unread: 0,
    messages: [
      {
        id: 'm9',
        senderId: '4',
        content: 'Yo you see I passed you on the leaderboard? 👀',
        timestamp: '3d ago',
        isRead: true,
      },
      {
        id: 'm10',
        senderId: 'me',
        content: 'Haha not for long bro, watch this space',
        timestamp: '2d ago',
        isRead: true,
      },
      {
        id: 'm11',
        senderId: '4',
        content: 'Just hit a 47 day streak! Let\'s gooo 💪',
        timestamp: '2d ago',
        isRead: true,
      },
    ],
  },
  {
    id: '5',
    name: 'Jordan Martinez',
    avatar: null,
    role: 'friend',
    lastMessage: 'Training at 7am tomorrow? Need a workout partner',
    timestamp: '3d ago',
    unread: 0,
    messages: [
      {
        id: 'm12',
        senderId: '5',
        content: 'Yooo that game winner you posted was insane!',
        timestamp: '4d ago',
        isRead: true,
      },
      {
        id: 'm13',
        senderId: 'me',
        content: 'Thanks! Got lucky with the defender slipping haha',
        timestamp: '3d ago',
        isRead: true,
      },
      {
        id: 'm14',
        senderId: '5',
        content: 'Training at 7am tomorrow? Need a workout partner',
        timestamp: '3d ago',
        isRead: true,
      },
    ],
  },
]

export default function MessagesPage() {
  const router = useRouter()
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(
    mockConversations[0]
  )
  const [messageInput, setMessageInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const handleSendMessage = () => {
    if (messageInput.trim() === '') return

    // In a real app, this would send the message to the backend
    console.log('Sending message:', messageInput)
    setMessageInput('')
  }

  const filteredConversations = mockConversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <AuthGuard>
      <div className="relative min-h-screen bg-gradient-to-br from-background via-background/70 to-muted dark:bg-black">
        {/* Background effects */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-44 -left-24 h-[28rem] w-[28rem] rounded-full bg-gradient-to-br from-sport-blue/40 via-sport-green/20 to-transparent blur-3xl opacity-70 dark:opacity-30" />
          <div className="absolute -bottom-36 -right-20 h-[26rem] w-[26rem] rounded-full bg-gradient-to-br from-sport-orange/40 via-sport-blue/25 to-transparent blur-[120px] opacity-70 dark:opacity-25" />
        </div>

        {/* Header */}
        <div className="relative z-10 border-b border-white/10 bg-white/5 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-4 py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard')}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <h1 className="text-xl font-bold text-foreground">Messages</h1>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="relative z-10 mx-auto max-w-7xl px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-4 h-[calc(100vh-180px)]">
            {/* Conversations List */}
            <Card className="relative overflow-hidden border-white/10 bg-white/5 backdrop-blur-xl flex flex-col">
              <div className="p-4 border-b border-white/10">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search messages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white/5 border-white/10"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {filteredConversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`w-full p-4 flex items-center gap-3 border-b border-white/5 transition-all duration-200 hover:bg-white/5 ${
                      selectedConversation?.id === conv.id
                        ? 'bg-sport-blue/10 border-l-4 border-l-sport-blue'
                        : ''
                    }`}
                  >
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={conv.avatar || '/placeholder.svg'} alt={conv.name} />
                        <AvatarFallback className="text-sm font-semibold">
                          {conv.name.split(' ').map((n) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      {conv.role === 'scout' && (
                        <div className="absolute -bottom-1 -right-1 bg-sport-orange rounded-full p-1">
                          <Info className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-foreground truncate">{conv.name}</p>
                        <span className="text-xs text-muted-foreground">{conv.timestamp}</span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                    </div>
                    {conv.unread > 0 && (
                      <Badge className="bg-sport-blue text-white">{conv.unread}</Badge>
                    )}
                  </button>
                ))}
              </div>
            </Card>

            {/* Chat Window */}
            {selectedConversation ? (
              <Card className="relative overflow-hidden border-white/10 bg-white/5 backdrop-blur-xl flex flex-col">
                {/* Chat Header */}
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={selectedConversation.avatar || '/placeholder.svg'}
                        alt={selectedConversation.name}
                      />
                      <AvatarFallback className="text-sm">
                        {selectedConversation.name.split(' ').map((n) => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-foreground">{selectedConversation.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {selectedConversation.role === 'scout' ? 'Scout/Coach' : 'Friend'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="rounded-full">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="rounded-full">
                      <Video className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="rounded-full">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {selectedConversation.messages.map((msg) => {
                    const isMe = msg.senderId === 'me'
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                            isMe
                              ? 'bg-sport-blue text-white'
                              : 'bg-white/10 text-foreground border border-white/10'
                          }`}
                        >
                          <p className="text-sm">{msg.content}</p>
                          <span className="text-xs opacity-70 mt-1 block">{msg.timestamp}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleSendMessage()
                        }
                      }}
                      className="flex-1 bg-white/5 border-white/10"
                    />
                    <Button
                      onClick={handleSendMessage}
                      className="bg-sport-blue hover:bg-sport-blue/90 text-white rounded-full"
                      size="sm"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="relative overflow-hidden border-white/10 bg-white/5 backdrop-blur-xl flex items-center justify-center">
                <p className="text-muted-foreground">Select a conversation to start messaging</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
