import { AuthGuard } from "@/components/auth-guard"
import { AnalyticsCharts } from "@/components/analytics-charts"

export default function AnalyticsPage() {
  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-6 pb-20 md:pb-6">
        <AnalyticsCharts />
      </div>
    </AuthGuard>
  )
}
