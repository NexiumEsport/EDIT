"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createRecord(animalId: string, formData: FormData) {
  const supabase = await createClient();

  const type = formData.get("type") as string;
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const date = formData.get("date") as string;

  const { data: userData } = await supabase.auth.getUser();
  const { data: animal } = await supabase
    .from("animals")
    .select("family_id")
    .eq("id", animalId)
    .single();

  if (!animal) throw new Error("Animal introuvable");

  const { error } = await supabase.from("animal_records").insert({
    animal_id: animalId,
    family_id: animal.family_id,
    type,
    title,
    content: content || null,
    date: date || null,
    created_by: userData.user?.id ?? null,
  });

  if (error) throw new Error(error.message);

  revalidatePath(`/animals/${animalId}`);
}