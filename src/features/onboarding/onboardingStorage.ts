import { assertSupabaseConfigured } from '../../lib/supabase'

export const ONBOARDING_UPLOAD_BUCKET =
  import.meta.env.VITE_SUPABASE_ONBOARDING_BUCKET || 'onboarding-documents'

type OnboardingUploadStep = 'profile' | 'id' | 'address'

export type UploadedOnboardingFile = {
  bucket: string
  path: string
  originalName: string
  mimeType: string
  sizeBytes: number
}

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_')
}

function getFileExtension(fileName: string) {
  const safeFileName = sanitizeFileName(fileName)
  const lastDotIndex = safeFileName.lastIndexOf('.')
  if (lastDotIndex <= 0 || lastDotIndex === safeFileName.length - 1) return 'bin'
  return safeFileName.slice(lastDotIndex + 1).toLowerCase()
}

function createStoragePath(userId: string, step: OnboardingUploadStep, fileKey: string, file: File) {
  const ext = getFileExtension(file.name)
  const randomSuffix = Math.random().toString(36).slice(2, 10)
  const timestamp = Date.now()
  return `${userId}/${step}/${fileKey}-${timestamp}-${randomSuffix}.${ext}`
}

export async function uploadOnboardingFile(params: {
  userId: string
  step: OnboardingUploadStep
  fileKey: string
  file: File
}) {
  const client = assertSupabaseConfigured()
  const { userId, step, fileKey, file } = params
  const path = createStoragePath(userId, step, fileKey, file)

  const { error } = await client.storage.from(ONBOARDING_UPLOAD_BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type || undefined,
    cacheControl: '3600',
  })

  if (error) throw error

  const metadata: UploadedOnboardingFile = {
    bucket: ONBOARDING_UPLOAD_BUCKET,
    path,
    originalName: file.name,
    mimeType: file.type || 'application/octet-stream',
    sizeBytes: file.size,
  }

  return metadata
}

export async function getOnboardingFileSignedUrl(
  file: Pick<UploadedOnboardingFile, 'path'> & Partial<Pick<UploadedOnboardingFile, 'bucket'>>,
  expiresInSeconds = 3600,
) {
  const client = assertSupabaseConfigured()
  const bucket = file.bucket || ONBOARDING_UPLOAD_BUCKET

  const { data, error } = await client.storage.from(bucket).createSignedUrl(file.path, expiresInSeconds)
  if (error) throw error
  return data.signedUrl
}
