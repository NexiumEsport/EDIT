import { createClient } from "@/lib/supabase/server";
import AnimalCard from "@/components/animals/AnimalCard";

export default async function AnimalsPage() {
  const supabase = await createClient();

  const { data: animals, error } = await supabase
    .from("animals")
    .select("id, name, species, photo_url")
    .order("name");

  if (error) {
    return <p className="text-red-600">Erreur de chargement des animaux.</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6" style={{ fontFamily: "Fraunces, serif" }}>
        Animaux
      </h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {animals?.map((animal) => (
          <AnimalCard key={animal.id} animal={animal} />
        ))}
      </div>
    </div>
  );
}