"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { sendPushToFamily } from "@/lib/push/send";

export async function createRecord(animalId: string, formData: FormData) {
  const supabase = await createClient();

  const type = formData.get("type") as string;
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const date = formData.get("date") as string;

  const { data: userData } = await supabase.auth.getUser();
  const { data: animal } = await supabase
    .from("animals")
    .select("family_id, name")
    .eq("id", animalId)
    .single();

  if (!animal) throw new Error("Animal introuvable");

  const { data: record, error } = await supabase
    .from("animal_records")
    .insert({
      animal_id: animalId,
      family_id: animal.family_id,
      type,
      title,
      content: content || null,
      date: date || null,
      created_by: userData.user?.id ?? null,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  if (type !== "note" && date) {
    await supabase.from("calendar_events").insert({
      family_id: animal.family_id,
      title: `${animal.name} — ${title}`,
      start_at: new Date(`${date}T09:00:00`).toISOString(),
      created_by: userData.user?.id ?? null,
    });
  }

  await sendPushToFamily(animal.family_id, {
    title: `${animal.name} — ${title}`,
    body: `Nouveau ${type} ajouté`,
    url: `/animals/${animalId}`,
  });

  revalidatePath(`/animals/${animalId}`);
  revalidatePath("/calendar");
  revalidatePath("/dashboard");

  return record;
}

export async function deleteRecord(recordId: string, animalId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("animal_records")
    .delete()
    .eq("id", recordId);

  if (error) throw new Error(error.message);

  revalidatePath(`/animals/${animalId}`);
}