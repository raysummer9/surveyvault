import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { assertSupabaseConfigured } from '../../lib/supabase'
import { workforceJoinFee } from '../../domain/paymentConfig'
import { PageSection } from '../../shared/ui/PageSection'
import { useAuth } from '../auth/AuthContext'

export function JoinWorkforcePage() {
  const navigate = useNavigate()
  const { user, refreshUserState } = useAuth()
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState('')

  const handleJoin = async () => {
    if (!user?.id) return
    setError('')
    setJoining(true)
    try {
      const client = assertSupabaseConfigured()
      const { error: updateError } = await client
        .from('user_profiles')
        .update({ workforce_joined: true })
        .eq('id', user.id)

      if (updateError) throw updateError
      await refreshUserState()
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to join workforce.')
    } finally {
      setJoining(false)
    }
  }

  return (
    <PageSection
      title="Join the Workforce"
      description="A one-time payment unlocks access to paid surveys and earnings."
    >
      <dl className="key-values">
        <div>
          <dt>Category</dt>
          <dd>{workforceJoinFee.category}</dd>
        </div>
        <div>
          <dt>One-time fee</dt>
          <dd>${workforceJoinFee.priceUsd.toFixed(2)}</dd>
        </div>
        <div>
          <dt>Details</dt>
          <dd>{workforceJoinFee.description}</dd>
        </div>
      </dl>
      <p className="note">
        Pricing and category are controlled in admin settings and should come from backend API.
      </p>
      {error && <p className="field-error">{error}</p>}
      <div className="actions">
        <button
          className="button"
          type="button"
          onClick={handleJoin}
          disabled={joining}
        >
          {joining ? 'Joining...' : 'Pay and join workforce'}
        </button>
        <Link className="button secondary" to="/admin/payment-settings">
          View admin settings
        </Link>
      </div>
    </PageSection>
  )
}
