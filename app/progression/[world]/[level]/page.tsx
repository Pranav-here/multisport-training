import { ProgressionShell } from '../../_components/progression-shell'

type LevelPageProps = {
  params?: Promise<{ world: string; level: string }>
}

export default async function LevelPage({ params }: LevelPageProps) {
  const resolvedParams = await params
  const { world = '', level = '' } = resolvedParams ?? {}

  return <ProgressionShell initialWorldId={world} initialLevelId={level} />
}
