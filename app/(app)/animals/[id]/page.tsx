import { createClient } from "@/lib/supabase/server";
import AnimalRecordRow from "@/components/animals/AnimalRecordRow";
import AnimalRecordForm from "@/components/animals/AnimalRecordForm";
import Link from "next/link";

const speciesEmoji: Record<string, string> = {
  cheval: "🐴",
  chat: "🐱",
  chien: "🐶",
};

export default async function AnimalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: animal, error: animalError } = await supabase
    .from("animals")
    .select("id, name, species, photo_url")
    .eq("id", id)
    .single();

  if (animalError || !animal) {
    return (
      <pre className="p-6 text-sm">
        id reçu: {id}
        {"\n"}
        erreur: {JSON.stringify(animalError, null, 2)}
      </pre>
    );
  }

  const { data: records, error: recordsError } = await supabase
    .from("animal_records")
    .select("id, type, title, content, date, created_at")
    .eq("animal_id", id)
    .order("date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Link href="/animals" className="text-sm text-indigo-600 mb-4 inline-block">
        ← Retour aux animaux
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <span className="text-4xl">{speciesEmoji[animal.species] ?? "🐾"}</span>
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "Fraunces, serif" }}>
            {animal.name}
          </h1>
          <p className="text-sm text-gray-500 capitalize">{animal.species}</p>
        </div>
      </div>

      <AnimalRecordForm animalId={animal.id} />

      <div className="mt-6 space-y-3">
        {recordsError && (
          <p className="text-red-600">Erreur de chargement de l'historique.</p>
        )}
        {records && records.length === 0 && (
          <p className="text-gray-500 text-sm">Aucune note ou vaccin enregistré pour {animal.name}.</p>
        )}
        {records?.map((record) => (
          <AnimalRecordRow key={record.id} record={record} animalId={animal.id} />
        ))}
      </div>
    </div>
  );
}