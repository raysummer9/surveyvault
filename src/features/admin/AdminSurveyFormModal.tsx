import { useEffect, useState, type FormEvent } from 'react'
import type { AdminSurveyUpsertInput } from '../../domain/surveyApi'
import { fetchAllPaymentCategoriesAdmin, type MembershipTier } from '../../domain/paymentCategory'
import {
  DEFAULT_SURVEY_CATEGORY,
  MIN_SURVEY_QUESTIONS,
  SURVEY_CATEGORIES,
  type SurveyCategory,
  type SurveyQuestion,
  type SurveyRow,
} from '../../domain/surveyTypes'

function buildDefaultQuestionsJson(): string {
  const qs: SurveyQuestion[] = Array.from({ length: MIN_SURVEY_QUESTIONS }, (_, i) => ({
    id: `q${i + 1}`,
    type: 'choice',
    label: `Question ${i + 1} (edit label and options)`,
    options: ['Option A', 'Option B', 'Option C'],
  }))
  return JSON.stringify(qs, null, 2)
}

function parseQuestionsJson(raw: string): { ok: true; questions: SurveyQuestion[] } | { ok: false; error: string } {
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return { ok: false, error: 'Questions must be a JSON array.' }
    for (const item of parsed) {
      if (!item || typeof item !== 'object') return { ok: false, error: 'Each question must be an object.' }
      const o = item as Record<string, unknown>
      if (typeof o.id !== 'string' || typeof o.type !== 'string' || typeof o.label !== 'string') {
        return { ok: false, error: 'Each question needs id, type, and label.' }
      }
      if (o.type === 'choice') {
        if (!Array.isArray(o.options) || o.options.length === 0) {
          return { ok: false, error: `Choice question "${o.id}" needs options array.` }
        }
      } else if (o.type !== 'text') {
        return { ok: false, error: `Unknown type for "${o.id}": use "choice" or "text".` }
      }
    }
    if (parsed.length < MIN_SURVEY_QUESTIONS) {
      return {
        ok: false,
        error: `Provide at least ${MIN_SURVEY_QUESTIONS} questions (currently ${parsed.length}).`,
      }
    }
    return { ok: true, questions: parsed as SurveyQuestion[] }
  } catch {
    return { ok: false, error: 'Invalid JSON.' }
  }
}

export type AdminSurveyFormValues = {
  slug: string
  title: string
  description: string
  rewardDollars: string
  estimatedMinutes: string
  questionsJson: string
  is_active: boolean
  /** payment_categories.id — minimum tier required to take this survey */
  paymentCategoryId: string
  surveyCategory: SurveyCategory
}

function surveyToFormValues(s: SurveyRow): AdminSurveyFormValues {
  return {
    slug: s.slug,
    title: s.title,
    description: s.description ?? '',
    rewardDollars: (s.reward_cents / 100).toFixed(2),
    estimatedMinutes: String(s.estimated_minutes),
    questionsJson: JSON.stringify(s.questions, null, 2),
    is_active: s.is_active,
    paymentCategoryId: s.payment_category_id ?? '',
    surveyCategory: s.survey_category ?? DEFAULT_SURVEY_CATEGORY,
  }
}

type Props = {
  mode: 'create' | 'edit'
  initial: SurveyRow | null
  saving: boolean
  error: string | null
  onSave: (values: AdminSurveyUpsertInput) => void
  onClose: () => void
}

export function AdminSurveyFormModal({ mode, initial, saving, error, onSave, onClose }: Props) {
  const [tiers, setTiers] = useState<MembershipTier[]>([])
  const [tiersError, setTiersError] = useState<string | null>(null)

  const [values, setValues] = useState<AdminSurveyFormValues>(() =>
    initial
      ? surveyToFormValues(initial)
      : {
          slug: '',
          title: '',
          description: '',
          rewardDollars: '3.50',
          estimatedMinutes: '5',
          questionsJson: buildDefaultQuestionsJson(),
          is_active: true,
          paymentCategoryId: '',
          surveyCategory: DEFAULT_SURVEY_CATEGORY,
        },
  )

  const [jsonError, setJsonError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const list = await fetchAllPaymentCategoriesAdmin()
        if (!cancelled) {
          setTiers(list)
          setTiersError(null)
        }
      } catch (e) {
        if (!cancelled) setTiersError(e instanceof Error ? e.message : 'Could not load tiers.')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (initial) {
      setValues(surveyToFormValues(initial))
      return
    }
    if (mode === 'create' && tiers.length > 0) {
      setValues((v) =>
        v.paymentCategoryId ? v : { ...v, paymentCategoryId: tiers[0]?.id ?? '' },
      )
    }
  }, [initial, mode, tiers])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setJsonError(null)
    const parsed = parseQuestionsJson(values.questionsJson)
    if (!parsed.ok) {
      setJsonError(parsed.error)
      return
    }
    const reward = Number.parseFloat(values.rewardDollars.replace(/[^0-9.]/g, ''))
    if (!Number.isFinite(reward) || reward < 0) {
      setJsonError('Enter a valid reward amount.')
      return
    }
    const reward_cents = Math.round(reward * 100)
    const mins = Number.parseInt(values.estimatedMinutes, 10)
    if (!Number.isFinite(mins) || mins < 0) {
      setJsonError('Enter valid estimated minutes.')
      return
    }
    const slug = values.slug.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    if (!slug) {
      setJsonError('Enter a URL slug (letters, numbers, hyphens).')
      return
    }
    if (!values.title.trim()) {
      setJsonError('Title is required.')
      return
    }
    if (!values.paymentCategoryId.trim()) {
      setJsonError('Select a payment plan / tier this survey is for.')
      return
    }
    onSave({
      slug,
      title: values.title.trim(),
      description: values.description.trim() || null,
      reward_cents,
      estimated_minutes: mins,
      questions: parsed.questions,
      is_active: values.is_active,
      payment_category_id: values.paymentCategoryId.trim(),
      survey_category: values.surveyCategory,
    })
  }

  return (
    <div className="admin-reject-modal" role="dialog" aria-modal="true" aria-labelledby="admin-survey-form-title">
      <div className="admin-survey-modal-inner">
        <h3 id="admin-survey-form-title">{mode === 'create' ? 'Create survey' : 'Edit survey'}</h3>
        <form onSubmit={handleSubmit} className="admin-survey-form">
          <label className="withdrawal-field">
            <span>Slug (URL key)</span>
            <input
              value={values.slug}
              onChange={(e) => setValues((v) => ({ ...v, slug: e.target.value }))}
              placeholder="e.g. brand-pulse-q1"
              disabled={mode === 'edit'}
              title={mode === 'edit' ? 'Slug cannot be changed after creation' : undefined}
            />
          </label>
          <label className="withdrawal-field">
            <span>Title</span>
            <input
              value={values.title}
              onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))}
              required
            />
          </label>
          <label className="withdrawal-field">
            <span>Category</span>
            <select
              value={values.surveyCategory}
              onChange={(e) =>
                setValues((v) => ({ ...v, surveyCategory: e.target.value as SurveyCategory }))
              }
              required
            >
              {SURVEY_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <small className="admin-survey-json-hint">Topic area for this survey (shown to members).</small>
          </label>
          <label className="withdrawal-field">
            <span>Payment plan (minimum tier)</span>
            <select
              value={values.paymentCategoryId}
              onChange={(e) => setValues((v) => ({ ...v, paymentCategoryId: e.target.value }))}
              required
            >
              <option value="">Select tier…</option>
              {tiers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                  {t.slug ? ` (${t.slug})` : ''}
                </option>
              ))}
            </select>
            <small className="admin-survey-json-hint">
              Visibility: Silver accounts only see surveys tagged <strong>Silver</strong>. Gold accounts see Silver and
              Gold surveys. Platinum accounts see Silver, Gold, and Platinum surveys. Tag this survey with the{' '}
              <em>minimum</em> tier that should have access.
            </small>
          </label>
          {tiersError ? <p className="field-error">{tiersError}</p> : null}
          <label className="withdrawal-field">
            <span>Description</span>
            <textarea
              rows={2}
              value={values.description}
              onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
            />
          </label>
          <div className="admin-survey-form-row">
            <label className="withdrawal-field">
              <span>Reward (USD)</span>
              <input
                type="text"
                inputMode="decimal"
                value={values.rewardDollars}
                onChange={(e) => setValues((v) => ({ ...v, rewardDollars: e.target.value }))}
              />
            </label>
            <label className="withdrawal-field">
              <span>Est. minutes</span>
              <input
                type="number"
                min={0}
                value={values.estimatedMinutes}
                onChange={(e) => setValues((v) => ({ ...v, estimatedMinutes: e.target.value }))}
              />
            </label>
          </div>
          <label className="withdrawal-field">
            <span>Questions (JSON)</span>
            <textarea
              className="admin-survey-json"
              rows={14}
              value={values.questionsJson}
              onChange={(e) => setValues((v) => ({ ...v, questionsJson: e.target.value }))}
              spellCheck={false}
            />
            <small className="admin-survey-json-hint">
              Minimum <strong>{MIN_SURVEY_QUESTIONS} questions</strong> required. Choice:{' '}
              <code>type: &quot;choice&quot;</code> + <code>options</code>. Text: <code>type: &quot;text&quot;</code>.
              Optional: <code>&quot;optional&quot;: true</code>.
            </small>
          </label>
          <label className="withdrawal-radio">
            <input
              type="checkbox"
              checked={values.is_active}
              onChange={(e) => setValues((v) => ({ ...v, is_active: e.target.checked }))}
            />
            Active (visible to members)
          </label>

          {(error || jsonError) ? <p className="field-error">{jsonError ?? error}</p> : null}

          <div className="withdrawal-actions">
            <button type="button" className="button secondary" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="button" disabled={saving}>
              {saving ? 'Saving…' : mode === 'create' ? 'Create' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
