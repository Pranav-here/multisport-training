"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function NotificationsList() {
  const [items] = useState([
    { id: 1, text: "New like on your post from Alex Chen" },
    { id: 2, text: "Maria joined your team session" },
    { id: 3, text: "Emma commented on your drill" },
  ])

  return (
    <div className="p-2">
      <p className="text-sm font-medium">Notifications</p>
      <p className="text-xs text-muted-foreground">Recent activity from people you follow</p>
      <div className="mt-2 space-y-1">
        {items.map((i) => (
          <div key={i.id} className="text-sm px-2 py-1 hover:bg-accent/10 rounded">
            {i.text}
          </div>
        ))}
      </div>
      <div className="mt-3">
        <Button asChild variant="ghost" size="sm" className="w-full">
          <Link href="/settings#notifications">View all notifications</Link>
        </Button>
      </div>
    </div>
  )
}
