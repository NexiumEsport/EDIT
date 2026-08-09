"use client";

import { useState, useRef } from "react";
import { createRecord } from "@/app/(app)/animals/actions";

const types = [
  { value: "note", label: "Note" },
  { value: "vaccin", label: "Vaccin" },
  { value: "veto", label: "Véto" },
  { value: "autre", label: "Autre" },
];

export default function AnimalRecordForm({ animalId }: { animalId: string }) {
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    await createRecord(animalId, formData);
    setLoading(false);
    formRef.current?.reset();
  }

  return (
    <form ref={formRef} action={handleSubmit} className="card p-4 space-y-3">
      <div className="flex gap-2">
        <select name="type" className="input-field" required defaultValue="note">
          {types.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <input
          type="date"
          name="date"
          className="input-field"
        />
      </div>
      <input
        type="text"
        name="title"
        placeholder="Titre (ex: Vaccin rage, Visite véto...)"
        className="input-field w-full"
        required
      />
      <textarea
        name="content"
        placeholder="Détails (optionnel)"
        className="input-field w-full"
        rows={2}
      />
      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? "Ajout..." : "Ajouter"}
      </button>
    </form>
  );
}