import { ProgressionShell } from '../../_components/progression-shell'

interface LevelPageProps {
  params: { world: string; level: string }
}

export default function LevelPage({ params }: LevelPageProps) {
  return <ProgressionShell initialWorldId={params.world} initialLevelId={params.level} />
}
