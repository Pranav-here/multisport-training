import { ProgressionShell } from '../_components/progression-shell'

type WorldPageProps = {
  params?: Promise<{ world: string }>
}

export default async function WorldPage({ params }: WorldPageProps) {
  const resolvedParams = await params
  const { world = '' } = resolvedParams ?? {}

  return <ProgressionShell initialWorldId={world} />
}
