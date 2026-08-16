const NAS_URL = process.env.NAS_URL!
const NAS_USERNAME = process.env.NAS_USERNAME!
const NAS_PASSWORD = process.env.NAS_PASSWORD!

// Le NAS utilise un certificat auto-signe (usage local uniquement).
// On desactive la verification TLS pour ces appels precis, jamais globalement.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

type SynologyAuthResponse = {
  success: boolean
  data?: { sid: string }
  error?: { code: number }
}

export async function getNasSession(): Promise<string> {
  const url = `${NAS_URL}/webapi/auth.cgi?api=SYNO.API.Auth&version=6&method=login&account=${encodeURIComponent(NAS_USERNAME)}&passwd=${encodeURIComponent(NAS_PASSWORD)}&session=FileStation&format=sid`

  const res = await fetch(url)
  const text = await res.text()

  let json: SynologyAuthResponse
  try {
    json = JSON.parse(text)
  } catch {
    throw new Error(`Reponse non-JSON de auth.cgi (status ${res.status}): ${text.slice(0, 200)}`)
  }

  if (!json.success || !json.data) {
    throw new Error(`Echec authentification NAS (code ${json.error?.code})`)
  }

  return json.data.sid
}

export type NasFile = {
  name: string
  path: string
  isdir: boolean
  size?: number
}

export async function listNasFolder(folderPath: string): Promise<NasFile[]> {
  const sid = await getNasSession()

  const url = `${NAS_URL}/webapi/entry.cgi?api=SYNO.FileStation.List&version=2&method=list&folder_path=${encodeURIComponent(folderPath)}&additional=%5B%22size%22%5D&_sid=${sid}`

  const res = await fetch(url)
  const json = await res.json()

  if (!json.success) {
    throw new Error(`Erreur listage dossier ${folderPath} (code ${json.error?.code})`)
  }

  return json.data.files.map((f: { name: string; path: string; isdir: boolean; additional?: { size?: number } }) => ({
    name: f.name,
    path: f.path,
    isdir: f.isdir,
    size: f.additional?.size,
  }))
}

export async function uploadToNasFolder(folderPath: string, file: File): Promise<void> {
  const sid = await getNasSession()

  const form = new FormData()
  form.append('api', 'SYNO.FileStation.Upload')
  form.append('version', '2')
  form.append('method', 'upload')
  form.append('path', folderPath)
  form.append('create_parents', 'false')
  form.append('overwrite', 'false')
  form.append('file', file)

  const url = `${NAS_URL}/webapi/entry.cgi?_sid=${sid}`

  const res = await fetch(url, {
    method: 'POST',
    body: form,
  })
  const json = await res.json()

  if (!json.success) {
    throw new Error(`Echec upload vers ${folderPath} (code ${json.error?.code})`)
  }
}

export async function deleteFromNasFolder(filePath: string): Promise<void> {
  const sid = await getNasSession()

  const startUrl = `${NAS_URL}/webapi/entry.cgi?api=SYNO.FileStation.Delete&version=2&method=start&path=${encodeURIComponent(filePath)}&_sid=${sid}`
  const startRes = await fetch(startUrl)
  const startJson = await startRes.json()

  if (!startJson.success || !startJson.data?.taskid) {
    throw new Error(`Echec lancement suppression ${filePath} (code ${startJson.error?.code})`)
  }

  const taskid = startJson.data.taskid

  // Le NAS traite la suppression en tache asynchrone : on interroge le statut jusqu'a la fin.
  for (let i = 0; i < 20; i++) {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const statusUrl = `${NAS_URL}/webapi/entry.cgi?api=SYNO.FileStation.Delete&version=2&method=status&taskid=${taskid}&_sid=${sid}`
    const statusRes = await fetch(statusUrl)
    const statusJson = await statusRes.json()

    if (!statusJson.success) {
      throw new Error(`Erreur statut suppression ${filePath} (code ${statusJson.error?.code})`)
    }

    if (statusJson.data.finished) {
      if (statusJson.data.error) {
        throw new Error(`Suppression echouee pour ${filePath}`)
      }
      return
    }
  }

  throw new Error(`Timeout suppression ${filePath} (6s depasses)`)
}

export async function createNasFolder(folderPath: string, folderName: string): Promise<void> {
  const sid = await getNasSession()

  const url = `${NAS_URL}/webapi/entry.cgi?api=SYNO.FileStation.CreateFolder&version=2&method=create&folder_path=${encodeURIComponent(folderPath)}&name=${encodeURIComponent(folderName)}&_sid=${sid}`

  const res = await fetch(url)
  const json = await res.json()

  if (!json.success) {
    throw new Error(`Echec creation dossier ${folderName} (code ${json.error?.code})`)
  }
}

export async function renameNasItem(path: string, newName: string): Promise<void> {
  const sid = await getNasSession()

  const url = `${NAS_URL}/webapi/entry.cgi?api=SYNO.FileStation.Rename&version=2&method=rename&path=${encodeURIComponent(path)}&name=${encodeURIComponent(newName)}&_sid=${sid}`

  const res = await fetch(url)
  const json = await res.json()

  if (!json.success) {
    throw new Error(`Echec renommage vers ${newName} (code ${json.error?.code})`)
  }
}