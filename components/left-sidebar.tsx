"use client"

import { SidebarWidgets } from "@/components/sidebar-widgets"
import {
  mockLeaderboard,
  mockBadges,
  mockTeamSessions,
} from "@/lib/mock-data"

export default function LeftSidebar() {
  return (
    <aside className="hidden lg:block w-72 pl-4">
      <div className="sticky top-20">
        <SidebarWidgets leaderboard={mockLeaderboard} badges={mockBadges} teamSessions={mockTeamSessions} />
      </div>
    </aside>
  )
}
