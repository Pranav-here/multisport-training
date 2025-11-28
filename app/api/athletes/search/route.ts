import { NextRequest, NextResponse } from 'next/server'

interface SportsDBPlayer {
  idPlayer: string
  strPlayer: string
  strSport?: string
  strTeam?: string
  strPosition?: string
  strNationality?: string
  strThumb?: string
  strCutout?: string
}

interface SportsDBResponse {
  player?: SportsDBPlayer[]
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ results: [] })
    }

    // TheSportsDB API - using free tier (key "3" works for free tier)
    const apiKey = process.env.SPORTSDB_API?.replace(/"/g, '') || '3'
    const url = `https://www.thesportsdb.com/api/v1/json/${apiKey}/searchplayers.php?p=${encodeURIComponent(query)}`

    const response = await fetch(url, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    })

    if (!response.ok) {
      throw new Error('Failed to fetch from TheSportsDB')
    }

    const data = await response.json() as SportsDBResponse

    // Transform TheSportsDB data to our format
    const results = (data.player || []).slice(0, 10).map((player: SportsDBPlayer) => ({
      id: player.idPlayer,
      name: player.strPlayer,
      sport: player.strSport || 'Unknown',
      team: player.strTeam || 'Free Agent',
      position: player.strPosition || '',
      nationality: player.strNationality || '',
      thumb: player.strThumb || player.strCutout || '/placeholder-user.jpg',
    }))

    return NextResponse.json({ results })
  } catch (error) {
    console.error('Error searching athletes:', error)
    return NextResponse.json(
      { results: [], error: 'Failed to search athletes' },
      { status: 500 }
    )
  }
}
