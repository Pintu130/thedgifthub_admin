import { randomUUID } from "crypto"
import { adminBucket } from "@/lib/firebase-admin"

export function firebasePathFromDownloadUrl(url: string): string | null {
  try {
    const match = url.match(/\/v0\/b\/[^/]+\/o\/([^?]+)/)
    if (!match) return null
    return decodeURIComponent(match[1])
  } catch {
    return null
  }
}

export async function uploadFileToAdminBucket(file: File, pathPrefix: string): Promise<string> {
  if (!adminBucket) {
    throw new Error("Firebase Admin Storage is not configured (check FIREBASE_* env and storage bucket).")
  }
  const timestamp = Date.now()
  const safeName = file.name.replace(/[/\\]/g, "_")
  const destination = `${pathPrefix}/${timestamp}_${safeName}`
  const buf = Buffer.from(await file.arrayBuffer())
  const token = randomUUID()
  await adminBucket.file(destination).save(buf, {
    metadata: {
      contentType: file.type || "application/octet-stream",
      metadata: {
        firebaseStorageDownloadTokens: token,
      },
    },
  })
  const encPath = encodeURIComponent(destination)
  return `https://firebasestorage.googleapis.com/v0/b/${adminBucket.name}/o/${encPath}?alt=media&token=${token}`
}

export async function deleteFileFromAdminBucketByUrl(url: string): Promise<void> {
  if (!adminBucket || !url) return
  const path = firebasePathFromDownloadUrl(url)
  if (!path) return
  try {
    await adminBucket.file(path).delete()
  } catch (e: unknown) {
    const code = (e as { code?: number })?.code
    if (code !== 404) console.warn("[admin storage] delete failed:", url, e)
  }
}
