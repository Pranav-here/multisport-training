import { ProgressionShell } from '../_components/progression-shell'

interface WorldPageProps {
  params: { world: string }
}

export default function WorldPage({ params }: WorldPageProps) {
  return <ProgressionShell initialWorldId={params.world} />
}
