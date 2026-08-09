const typeLabel: Record<string, string> = {
  note: "Note",
  vaccin: "Vaccin",
  veto: "Véto",
  autre: "Autre",
};

const typeColor: Record<string, string> = {
  note: "bg-gray-100 text-gray-700",
  vaccin: "bg-green-100 text-green-700",
  veto: "bg-indigo-100 text-indigo-700",
  autre: "bg-orange-100 text-orange-700",
};

type Record_ = {
  id: string;
  type: string;
  title: string;
  content: string | null;
  date: string | null;
  created_at: string;
};

export default function AnimalRecordRow({ record }: { record: Record_ }) {
  const displayDate = record.date
    ? new Date(record.date).toLocaleDateString("fr-FR")
    : new Date(record.created_at).toLocaleDateString("fr-FR");

  return (
    <div className="card p-3">
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColor[record.type] ?? "bg-gray-100 text-gray-700"}`}>
          {typeLabel[record.type] ?? record.type}
        </span>
        <span className="text-xs text-gray-400">{displayDate}</span>
      </div>
      <p className="font-medium">{record.title}</p>
      {record.content && <p className="text-sm text-gray-600 mt-1">{record.content}</p>}
    </div>
  );
}