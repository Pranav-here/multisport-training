import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // TheSportsDB API - using free tier
    const apiKey = process.env.SPORTSDB_API?.replace(/"/g, '') || '3'
    const url = `https://www.thesportsdb.com/api/v1/json/${apiKey}/lookupplayer.php?id=${id}`

    const response = await fetch(url, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    })

    if (!response.ok) {
      throw new Error('Failed to fetch athlete details')
    }

    const data = await response.json()
    const player = data.players?.[0]

    if (!player) {
      return NextResponse.json(
        { error: 'Athlete not found' },
        { status: 404 }
      )
    }

    // Transform to our AthleteProfile format
    const profile = {
      id: player.idPlayer,
      name: player.strPlayer,
      sport: player.strSport || 'Unknown',
      position: player.strPosition || 'Athlete',
      team: player.strTeam || 'Free Agent',
      number: player.strNumber ? parseInt(player.strNumber) : undefined,
      biography: player.strDescriptionEN || `Professional ${player.strSport} athlete.`,
      avatar: player.strThumb || player.strCutout || '/placeholder-user.jpg',
      coverImage: player.strFanart1 || player.strBanner || '/sports-training-video.png',
      achievements: [
        player.strHonours && `Honors: ${player.strHonours}`,
        player.strBirthLocation && `Born: ${player.strBirthLocation}`,
        player.strNationality && `Nationality: ${player.strNationality}`,
      ].filter(Boolean),
      careerStats: [
        player.strHeight && { label: 'Height', value: player.strHeight },
        player.strWeight && { label: 'Weight', value: player.strWeight },
        player.dateBorn && { label: 'Born', value: new Date(player.dateBorn).getFullYear().toString() },
        player.strStatus && { label: 'Status', value: player.strStatus },
      ].filter(Boolean),
      recentHighlights: [],
      focusAreas: [player.strSport, player.strPosition].filter(Boolean),
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Error fetching athlete:', error)
    return NextResponse.json(
      { error: 'Failed to fetch athlete' },
      { status: 500 }
    )
  }
}
