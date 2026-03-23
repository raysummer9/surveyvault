import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { PageSection } from '../../shared/ui/PageSection'
import { useAuth } from '../auth/AuthContext'
import { fetchActivePaymentCategories } from '../../domain/paymentCategory'
import {
  fetchMemberMaxTierSort,
  fetchMemberSurveyCompletionsCountLast24h,
  fetchSurveyById,
  formatCents,
  isSurveyEligibleForMember,
  submitSurveyCompletion,
} from '../../domain/surveyApi'
import {
  DAILY_SURVEY_COMPLETION_LIMIT,
  DAILY_SURVEY_LIMIT_ERROR_MESSAGE,
  isDailySurveyLimitError,
} from '../../domain/surveyLimits'
import type { SurveyQuestion, SurveyRow } from '../../domain/surveyTypes'

function validateAnswers(survey: SurveyRow, answers: Record<string, string>): string | null {
  for (const q of survey.questions) {
    const v = (answers[q.id] ?? '').trim()
    const optional = 'optional' in q && q.optional
    if (optional) continue
    if (!v) return `Please answer: ${q.label}`
  }
  return null
}

export function SurveyTakePage() {
  const { surveyId } = useParams<{ surveyId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [survey, setSurvey] = useState<SurveyRow | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [eligible, setEligible] = useState<boolean | null>(null)
  const [dailyLimitBlocked, setDailyLimitBlocked] = useState(false)

  const load = useCallback(async () => {
    if (!surveyId) return
    setError('')
    setLoading(true)
    setEligible(null)
    setDailyLimitBlocked(false)
    try {
      const row = await fetchSurveyById(surveyId)
      if (!row?.is_active) {
        setSurvey(null)
        setError('This survey is not available.')
        return
      }
      setSurvey(row)
      const init: Record<string, string> = {}
      for (const q of row.questions) {
        init[q.id] = ''
      }
      setAnswers(init)

      if (!user?.id) {
        setEligible(false)
        return
      }
      const [memberSort, tiers] = await Promise.all([
        fetchMemberMaxTierSort(user.id),
        fetchActivePaymentCategories(),
      ])
      const requiredTierSortByCategoryId = new Map(tiers.map((t) => [t.id, t.sortOrder]))
      setEligible(isSurveyEligibleForMember(memberSort, row, requiredTierSortByCategoryId))

      const n = await fetchMemberSurveyCompletionsCountLast24h(user.id)
      setDailyLimitBlocked(n >= DAILY_SURVEY_COMPLETION_LIMIT)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load survey.')
      setSurvey(null)
    } finally {
      setLoading(false)
    }
  }, [surveyId, user?.id])

  useEffect(() => {
    void load()
  }, [load])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!user?.id || !survey) return
    const msg = validateAnswers(survey, answers)
    if (msg) {
      setError(msg)
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await submitSurveyCompletion({
        userId: user.id,
        surveyId: survey.id,
        rewardCents: survey.reward_cents,
        answers,
      })
      navigate('/dashboard/earnings', { replace: true, state: { surveyCompleted: true } })
    } catch (err) {
      const m = err instanceof Error ? err.message : 'Submit failed.'
      if (isDailySurveyLimitError(m)) {
        setError(DAILY_SURVEY_LIMIT_ERROR_MESSAGE)
      } else if (m.includes('duplicate') || m.includes('unique') || m.includes('23505')) {
        setError('You already completed this survey.')
      } else {
        setError(m)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const renderQuestion = (q: SurveyQuestion) => {
    const optional = 'optional' in q && q.optional
    if (q.type === 'choice') {
      return (
        <fieldset key={q.id} className="survey-fieldset" aria-required={!optional}>
          <legend className="survey-legend">{q.label}</legend>
          <div className="survey-options">
            {q.options.map((opt, optIdx) => (
              <label key={`${q.id}-${optIdx}`} className="survey-radio-label">
                <input
                  type="radio"
                  name={q.id}
                  value={opt}
                  checked={answers[q.id] === opt}
                  required={!optional && optIdx === 0}
                  onChange={() => setAnswers((a) => ({ ...a, [q.id]: opt }))}
                />
                {opt}
              </label>
            ))}
          </div>
        </fieldset>
      )
    }
    return (
      <label key={q.id} className="survey-text-label">
        <span className="survey-legend">{q.label}</span>
        <textarea
          className="survey-textarea"
          rows={3}
          value={answers[q.id] ?? ''}
          required={!optional}
          onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
        />
      </label>
    )
  }

  if (loading) {
    return (
      <PageSection title="Survey" description="Loading…">
        <p className="panel-muted">Loading survey…</p>
      </PageSection>
    )
  }

  if (!survey) {
    return (
      <PageSection title="Survey" description="Unavailable">
        <p className="field-error">{error || 'Survey not found.'}</p>
        <Link to="/dashboard/surveys" className="button secondary">
          Back to surveys
        </Link>
      </PageSection>
    )
  }

  if (eligible === false) {
    return (
      <PageSection
        title={survey.title}
        description="Your membership tier doesn’t include this survey yet."
      >
        <p className="panel-muted">
          You can browse all surveys on the list, but completing this one requires a higher workforce plan.
          Upgrade to unlock surveys for your tier level.
        </p>
        <div className="survey-actions">
          <Link to="/dashboard/workforce/upgrade" className="button">
            View plans
          </Link>
          <Link to="/dashboard/surveys" className="button secondary">
            Back to surveys
          </Link>
        </div>
      </PageSection>
    )
  }

  if (dailyLimitBlocked) {
    return (
      <PageSection title={survey.title} description="Daily survey limit reached">
        <p className="panel-muted">{DAILY_SURVEY_LIMIT_ERROR_MESSAGE}</p>
        <p className="panel-muted" style={{ marginTop: 8 }}>
          You can still review your completed surveys or check back after the 24-hour window resets.
        </p>
        <div className="survey-actions">
          <Link to="/dashboard/surveys" className="button">
            Back to surveys
          </Link>
        </div>
      </PageSection>
    )
  }

  return (
    <PageSection
      title={survey.title}
      description={survey.description ?? 'Answer the questions below to earn your reward.'}
    >
      <div className="survey-meta-bar">
        <span className="survey-meta-pill survey-meta-pill-category">{survey.survey_category}</span>
        <span className="survey-meta-pill">Reward {formatCents(survey.reward_cents)}</span>
        <span className="survey-meta-pill">~{survey.estimated_minutes} min</span>
      </div>

      <form onSubmit={handleSubmit} className="survey-form">
        {survey.questions.map((q) => renderQuestion(q))}

        {error ? <p className="field-error">{error}</p> : null}

        <div className="survey-actions">
          <button type="button" className="button secondary" onClick={() => navigate(-1)} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" className="button" disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit & earn'}
          </button>
        </div>
      </form>

      <p className="survey-hint">
        <Link to="/dashboard/surveys">← Back to all surveys</Link>
      </p>
    </PageSection>
  )
}
