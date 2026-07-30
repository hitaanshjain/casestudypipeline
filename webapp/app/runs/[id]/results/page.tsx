import Results from "./Results";

export default async function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <Results id={id} />;
}
