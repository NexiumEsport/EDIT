import Link from "next/link";

const speciesEmoji: Record<string, string> = {
  cheval: "🐴",
  chat: "🐱",
  chien: "🐶",
};

type Animal = {
  id: string;
  name: string;
  species: string;
  photo_url: string | null;
};

export default function AnimalCard({ animal }: { animal: Animal }) {
  return (
    <Link href={`/animals/${animal.id}`} className="card flex flex-col items-center gap-2 p-4 hover:shadow-md transition">
      <span className="text-4xl">{speciesEmoji[animal.species] ?? "🐾"}</span>
      <span className="font-semibold text-center">{animal.name}</span>
      <span className="text-sm text-gray-500 capitalize">{animal.species}</span>
    </Link>
  );
}