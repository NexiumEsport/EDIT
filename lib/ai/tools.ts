export const tools = [
  {
    name: 'add_shopping_item',
    description: "Ajoute un article a la liste de courses familiale. Utilise cet outil quand l'utilisateur demande d'ajouter un ou plusieurs articles a acheter.",
    input_schema: {
      type: 'object' as const,
      properties: {
        name: { type: 'string', description: "Nom de l'article, ex: 'lait', 'pain'" },
        quantity: { type: 'string', description: "Quantite optionnelle, ex: '2 paquets', '1L'" },
      },
      required: ['name'],
    },
  },
  {
    name: 'create_reminder',
    description: "Cree un rappel pour l'utilisateur a une date et heure precises.",
    input_schema: {
      type: 'object' as const,
      properties: {
        title: { type: 'string', description: 'Titre court du rappel' },
        description: { type: 'string', description: 'Details additionnels optionnels' },
        remind_at: { type: 'string', description: 'Date ISO 8601 avec fuseau horaire.' },
      },
      required: ['title', 'remind_at'],
    },
  },
  {
    name: 'create_calendar_event',
    description: 'Cree un evenement dans le calendrier familial.',
    input_schema: {
      type: 'object' as const,
      properties: {
        title: { type: 'string', description: "Titre de l'evenement" },
        description: { type: 'string', description: 'Details additionnels optionnels' },
        start_at: { type: 'string', description: 'Date de debut ISO 8601 avec fuseau horaire.' },
        end_at: { type: 'string', description: 'Date de fin, optionnelle.' },
        category: { type: 'string', description: 'Categorie optionnelle' },
      },
      required: ['title', 'start_at'],
    },
  },
  {
    name: 'delete_reminder',
    description: "Supprime un rappel existant. ACTION SENSIBLE : ne jamais appeler cet outil directement. Demande d'abord une confirmation explicite en texte a l'utilisateur, et n'appelle cet outil qu'apres une reponse affirmative claire dans un message suivant.",
    input_schema: {
      type: 'object' as const,
      properties: {
        id: { type: 'string', description: 'UUID du rappel a supprimer, obtenu via list_reminders.' },
      },
      required: ['id'],
    },
  },
  {
    name: 'delete_calendar_event',
    description: "Supprime un evenement du calendrier. ACTION SENSIBLE : ne jamais appeler cet outil directement. Demande d'abord une confirmation explicite en texte, et n'appelle cet outil qu'apres une reponse affirmative claire dans un message suivant.",
    input_schema: {
      type: 'object' as const,
      properties: {
        id: { type: 'string', description: "UUID de l'evenement a supprimer." },
      },
      required: ['id'],
    },
  },
  {
    name: 'list_reminders',
    description: "Liste les rappels en attente de l'utilisateur, pour lui permettre de designer lequel supprimer.",
    input_schema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'list_calendar_events',
    description: 'Liste les evenements a venir du calendrier familial.',
    input_schema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'create_task',
    description: "Cree une tache pour un membre de la famille. Utilise cet outil quand l'utilisateur demande d'ajouter quelque chose a faire.",
    input_schema: {
      type: 'object' as const,
      properties: {
        title: { type: 'string', description: 'Titre court de la tache' },
        description: { type: 'string', description: 'Details optionnels' },
        priority: { type: 'string', description: "Priorite: 'low', 'medium', 'high' ou 'urgent'. Par defaut 'medium' si non precise." },
        due_date: { type: 'string', description: 'Date limite au format YYYY-MM-DD, optionnelle.' },
        category: { type: 'string', description: 'Categorie optionnelle' },
      },
      required: ['title'],
    },
  },
  {
    name: 'complete_task',
    description: 'Marque une tache comme terminee.',
    input_schema: {
      type: 'object' as const,
      properties: {
        id: { type: 'string', description: 'UUID de la tache, obtenu via list_tasks.' },
      },
      required: ['id'],
    },
  },
  {
    name: 'delete_task',
    description: "Supprime une tache. ACTION SENSIBLE : ne jamais appeler directement. Demande d'abord confirmation en texte, n'appelle cet outil que dans le message suivant si l'utilisateur confirme clairement.",
    input_schema: {
      type: 'object' as const,
      properties: {
        id: { type: 'string', description: 'UUID de la tache a supprimer.' },
      },
      required: ['id'],
    },
  },
  {
    name: 'list_tasks',
    description: 'Liste les taches en cours de la famille.',
    input_schema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'remember_fact',
    description: "Memorise une information sur la famille. N'utilise cet outil QUE si l'utilisateur demande explicitement de retenir/memoriser quelque chose (ex: 'retiens que...', 'n'oublie pas que...'). Ne memorise JAMAIS automatiquement une information mentionnee en passant.",
    input_schema: {
      type: 'object' as const,
      properties: {
        key: { type: 'string', description: "Cle courte identifiant l'info, ex: 'allergie_fils', 'jour_poubelles'" },
        value: { type: 'string', description: "Contenu de l'information a retenir" },
        category: { type: 'string', description: "Categorie optionnelle, ex: 'sante', 'habitudes'" },
      },
      required: ['key', 'value'],
    },
  },
]

// Filet de securite serveur : si Claude appelle un de ces tools sans etre
// passe par l'etape de confirmation textuelle, on bloque et on redemande.
export const TOOLS_REQUIRING_CONFIRMATION: string[] = ['delete_reminder', 'delete_calendar_event', 'delete_task']