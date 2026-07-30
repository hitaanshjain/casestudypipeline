import RunProgress from "./RunProgress";

export default async function RunPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <RunProgress id={id} />;
}
