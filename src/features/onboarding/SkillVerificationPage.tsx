import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  IoArrowBackOutline,
  IoArrowForward,
  IoCheckmarkCircle,
  IoCheckmarkCircleOutline,
  IoCheckmarkOutline,
  IoShieldCheckmarkOutline,
  IoTimeOutline,
} from 'react-icons/io5'
import { FiBarChart2, FiHelpCircle } from 'react-icons/fi'
import { RiBrainLine } from 'react-icons/ri'
import { useAuth } from '../auth/AuthContext'
import { saveOnboardingStep } from './onboardingApi'
import { formatLastSavedLabel } from './onboardingTime'
import { AppSidebarLayout } from '../../shared/ui/AppSidebarLayout'
import { OnboardingTopbar } from '../../shared/ui/OnboardingTopbar'

type QuestionOption = {
  id: string
  title: string
  subtitle: string
}

type AssessmentQuestion = {
  id: string
  category: string
  prompt: string
  helper: string
  options: QuestionOption[]
}

const assessmentQuestions: AssessmentQuestion[] = [
  {
    id: 'q1',
    category: 'Analytical Thinking',
    prompt: 'When presented with a large dataset, what is your typical first approach to identify meaningful patterns or insights?',
    helper: 'Select the option that best describes your natural approach',
    options: [
      {
        id: 'A',
        title: 'Visualize the data using charts or graphs first',
        subtitle: "I prefer to see visual representations before diving into numbers",
      },
      {
        id: 'B',
        title: 'Calculate summary statistics (mean, median, variance)',
        subtitle: 'I start with statistical measures to understand the distribution',
      },
      {
        id: 'C',
        title: 'Look for outliers and anomalies immediately',
        subtitle: 'Unusual data points often reveal the most interesting insights',
      },
      {
        id: 'D',
        title: 'Define the business question before analyzing anything',
        subtitle: 'Context and goals should guide the entire analysis process',
      },
    ],
  },
  {
    id: 'q2',
    category: 'Communication',
    prompt: 'How do you usually explain a complex technical concept to non-technical stakeholders?',
    helper: 'Choose the statement closest to your communication style',
    options: [
      {
        id: 'A',
        title: 'Use real-world analogies and simple language',
        subtitle: 'I avoid jargon and connect ideas to familiar examples',
      },
      {
        id: 'B',
        title: 'Present key bullet points and short visuals',
        subtitle: 'I focus on structure and clarity with concise slides',
      },
      {
        id: 'C',
        title: 'Walk through the technical details step-by-step',
        subtitle: 'I believe understanding details builds trust',
      },
      {
        id: 'D',
        title: 'Start with outcomes, then explain only what is needed',
        subtitle: 'I tailor depth based on audience interest and questions',
      },
    ],
  },
  {
    id: 'q3',
    category: 'Industry Knowledge',
    prompt: 'How frequently do you stay updated on trends in your target industry?',
    helper: 'Select the option that best reflects your routine',
    options: [
      {
        id: 'A',
        title: 'Daily — I follow industry news and publications regularly',
        subtitle: 'I actively consume industry content as part of my routine',
      },
      {
        id: 'B',
        title: "Weekly — I check in on major developments periodically",
        subtitle: "I stay informed but don't follow every news item closely",
      },
      {
        id: 'C',
        title: 'Monthly — I catch up on highlights occasionally',
        subtitle: 'I review industry summaries or reports on a monthly basis',
      },
      {
        id: 'D',
        title: 'Rarely — I focus on my immediate work responsibilities',
        subtitle: 'I prioritize hands-on work over following broader trends',
      },
    ],
  },
  {
    id: 'q4',
    category: 'Tech Proficiency',
    prompt: 'When learning a new tool or platform, what best describes your usual approach?',
    helper: 'Pick the option that reflects how you typically ramp up',
    options: [
      {
        id: 'A',
        title: 'Read official documentation end-to-end first',
        subtitle: 'I like understanding concepts and architecture before trying things',
      },
      {
        id: 'B',
        title: 'Build a small hands-on project immediately',
        subtitle: 'I learn fastest by experimenting with practical examples',
      },
      {
        id: 'C',
        title: 'Watch tutorials and follow guided walkthroughs',
        subtitle: 'I prefer structured, visual guidance while learning',
      },
      {
        id: 'D',
        title: 'Ask teammates and learn directly from collaboration',
        subtitle: 'I improve quickly through shared context and feedback',
      },
    ],
  },
  {
    id: 'q5',
    category: 'Communication',
    prompt: 'During a team disagreement, what do you usually do first?',
    helper: 'Choose the response that best matches your behavior',
    options: [
      {
        id: 'A',
        title: 'Clarify goals and success criteria for everyone',
        subtitle: 'I align the team on outcomes before debating solutions',
      },
      {
        id: 'B',
        title: 'Listen to each side and summarize key concerns',
        subtitle: 'I focus on creating shared understanding first',
      },
      {
        id: 'C',
        title: 'Present data or evidence to support a direction',
        subtitle: 'I rely on objective signals to reduce ambiguity',
      },
      {
        id: 'D',
        title: 'Escalate quickly to a manager for a decision',
        subtitle: 'I prefer fast resolution when timelines are tight',
      },
    ],
  },
  {
    id: 'q6',
    category: 'Analytical Thinking',
    prompt: 'If results are inconsistent across two reports, what is your first troubleshooting step?',
    helper: 'Select the option closest to your normal process',
    options: [
      {
        id: 'A',
        title: 'Verify definitions and filters used in each report',
        subtitle: 'I check metric logic and scope before deeper analysis',
      },
      {
        id: 'B',
        title: 'Re-run both reports from raw data',
        subtitle: 'I prefer reproducing outputs to locate breakpoints',
      },
      {
        id: 'C',
        title: 'Inspect recent changes in pipelines or transformations',
        subtitle: 'I start with what changed to find potential causes',
      },
      {
        id: 'D',
        title: 'Compare only top-level totals first',
        subtitle: 'I begin broad, then drill down if mismatch remains',
      },
    ],
  },
  {
    id: 'q7',
    category: 'Industry Knowledge',
    prompt: 'How do you evaluate whether a new industry trend is worth adopting?',
    helper: 'Pick the option that best reflects your evaluation style',
    options: [
      {
        id: 'A',
        title: 'Map it to customer value and business impact',
        subtitle: 'I prioritize trends that solve real user problems',
      },
      {
        id: 'B',
        title: 'Review competitor adoption and benchmarks',
        subtitle: 'I compare market signals before deciding',
      },
      {
        id: 'C',
        title: 'Run a controlled pilot with clear success metrics',
        subtitle: 'I prefer evidence from small experiments',
      },
      {
        id: 'D',
        title: 'Wait for maturity before considering implementation',
        subtitle: 'I avoid early adoption until standards stabilize',
      },
    ],
  },
  {
    id: 'q8',
    category: 'Tech Proficiency',
    prompt: 'When a production issue appears, how do you typically prioritize your response?',
    helper: 'Select the approach you naturally follow under pressure',
    options: [
      {
        id: 'A',
        title: 'Assess severity and user impact, then communicate status',
        subtitle: 'I start with triage and stakeholder transparency',
      },
      {
        id: 'B',
        title: 'Roll back recent changes immediately',
        subtitle: 'I optimize for fast stabilization first',
      },
      {
        id: 'C',
        title: 'Gather logs and isolate a minimal reproducible case',
        subtitle: 'I use diagnostics to pinpoint root cause quickly',
      },
      {
        id: 'D',
        title: 'Assign owners and split investigation in parallel',
        subtitle: 'I coordinate team effort to reduce time-to-resolution',
      },
    ],
  },
]

const questionCount = assessmentQuestions.length

export function SkillVerificationPage() {
  const navigate = useNavigate()
  const { user, onboarding, refreshUserState } = useAuth()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({})
  const [showQuestionValidation, setShowQuestionValidation] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const currentQuestion = assessmentQuestions[currentQuestionIndex]
  const hasSavedSkillData =
    Boolean(onboarding?.skills_data && typeof onboarding?.skills_data === 'object') &&
    Object.keys(onboarding?.skills_data ?? {}).length > 0
  const lastSavedLabel = formatLastSavedLabel(onboarding?.updated_at)

  const answeredCount = useMemo(() => Object.keys(selectedAnswers).length, [selectedAnswers])
  const remainingCount = Math.max(questionCount - answeredCount, 0)
  const questionProgressPercent = (answeredCount / questionCount) * 100

  const isLastQuestion = currentQuestionIndex === assessmentQuestions.length - 1
  const currentChoice = selectedAnswers[currentQuestion.id]

  useEffect(() => {
    const skillsData = onboarding?.skills_data
    const skillsRecord = skillsData && typeof skillsData === 'object' ? skillsData : null
    if (!skillsRecord) return

    const rawAnswers = skillsRecord.answers
    const nextAnswers =
      rawAnswers && typeof rawAnswers === 'object'
        ? Object.fromEntries(
            Object.entries(rawAnswers).filter(
              (entry): entry is [string, string] => typeof entry[0] === 'string' && typeof entry[1] === 'string',
            ),
          )
        : null

    if (nextAnswers) {
      setSelectedAnswers((prev) => (Object.keys(prev).length > 0 ? prev : nextAnswers))
      const answeredIds = new Set(Object.keys(nextAnswers))
      const firstUnansweredIndex = assessmentQuestions.findIndex((question) => !answeredIds.has(question.id))
      if (firstUnansweredIndex !== -1) {
        setCurrentQuestionIndex(firstUnansweredIndex)
      } else {
        setCurrentQuestionIndex(assessmentQuestions.length - 1)
      }
    }
  }, [onboarding?.skills_data])

  const handleSelectOption = (optionId: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [currentQuestion.id]: optionId }))
    if (showQuestionValidation) {
      setShowQuestionValidation(false)
    }
  }

  const handleNextQuestion = async () => {
    setSubmitError('')
    if (!currentChoice) {
      setShowQuestionValidation(true)
      return
    }

    if (isLastQuestion) {
      if (!user) {
        setSubmitError('You must be signed in to continue.')
        return
      }
      setSubmitting(true)
      try {
        await saveOnboardingStep(user.id, 'skill', {
          answers: selectedAnswers,
          answeredCount,
          totalQuestions: questionCount,
        })
        await refreshUserState()
        navigate('/dashboard/onboarding/id-verification')
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to save skill verification.'
        setSubmitError(message)
      } finally {
        setSubmitting(false)
      }
      return
    }

    setShowQuestionValidation(false)
    setCurrentQuestionIndex((prev) => prev + 1)
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex === 0) {
      navigate('/dashboard/onboarding/profile')
      return
    }
    setCurrentQuestionIndex((prev) => prev - 1)
  }

  return (
    <AppSidebarLayout>
      <OnboardingTopbar
        title="Skill Verification"
        subtitle="Step 2 of 4 — Skills Assessment"
        chips={
          <>
            <span className="profile-chip step">
              <IoCheckmarkCircleOutline />
              Step 2 of 4
            </span>
            <span className="profile-chip progress">In Progress</span>
          </>
        }
      />
      <div className="onboarding-content profile-content">
          <article className="profile-progress-card">
            <div className="profile-progress-head">
              <span>Account Verification Progress</span>
              <strong>50% Done</strong>
            </div>
            <p className="profile-progress-desc">Complete all 4 steps to unlock your dashboard</p>
            <div className="profile-progress-bar">
              <div className="half" />
            </div>
            <div className="profile-stepper skill-stepper">
              <div className="profile-stepper-line" />
              <div className="profile-stepper-line active half" />
              <div className="profile-stepper-item complete">
                <span>
                  <IoCheckmarkCircle />
                </span>
                <small>Profile</small>
              </div>
              <div className="profile-stepper-item active">
                <span>2</span>
                <small>Skills</small>
              </div>
              <div className="profile-stepper-item">
                <span>3</span>
                <small>ID Verify</small>
              </div>
              <div className="profile-stepper-item">
                <span>4</span>
                <small>Address</small>
              </div>
            </div>
          </article>

          <article className="profile-form-card skill-card">
            <header className="profile-card-header skill-card-header">
              <div className="bio-data-icon skill-icon">
                <RiBrainLine />
              </div>
              <div>
                <h3>General Skills Assessment</h3>
                <p>Answer honestly - this helps us match you with the right surveys</p>
              </div>
              <div className="skill-head-stats">
                <span>
                  <IoTimeOutline /> ~5 min
                </span>
                <span>
                  <FiHelpCircle /> {questionCount} Questions
                </span>
              </div>
            </header>
            {hasSavedSkillData && (
              <p className="onboarding-saved-hint">
                Saved from previous submission. Your answers were restored.
                {lastSavedLabel ? ` ${lastSavedLabel}.` : ''}
              </p>
            )}

            <div className="skill-body">
              <div className="skill-question-meta">
                <p className="skill-question-count">
                  Question {currentQuestionIndex + 1} <span>of {questionCount}</span>
                </p>
                <span className="skill-category-chip">
                  <FiBarChart2 />
                  {currentQuestion.category}
                </span>
              </div>

              <div className="skill-progress-line">
                <div style={{ width: `${questionProgressPercent}%` }} />
              </div>

              <div className="skill-dot-progress" aria-hidden>
                {assessmentQuestions.map((question, index) => {
                  const hasAnswer = Boolean(selectedAnswers[question.id])
                  const isCurrent = index === currentQuestionIndex
                  return (
                    <span
                      key={question.id}
                      className={hasAnswer ? 'active answered' : isCurrent ? 'current' : ''}
                    >
                      {hasAnswer && <IoCheckmarkOutline />}
                    </span>
                  )
                })}
              </div>

              <p className="skill-question-helper-count">
                {answeredCount} answered · {remainingCount} remaining
              </p>

              <h4 className="skill-question-prompt">{currentQuestion.prompt}</h4>
              <p className="skill-question-helper">
                <FiHelpCircle />
                {currentQuestion.helper}
              </p>

              <div className="skill-options">
                {currentQuestion.options.map((option) => {
                  const isSelected = currentChoice === option.id
                  return (
                    <button
                      key={option.id}
                      type="button"
                      className={isSelected ? 'skill-option active' : 'skill-option'}
                      onClick={() => handleSelectOption(option.id)}
                    >
                      <span className="skill-option-radio">
                        {isSelected && <IoCheckmarkOutline />}
                      </span>
                      <span className="skill-option-letter">{option.id}</span>
                      <span className="skill-option-copy">
                        <strong>{option.title}</strong>
                        <small>{option.subtitle}</small>
                      </span>
                      {isSelected && <IoCheckmarkCircle className="skill-option-check" />}
                    </button>
                  )
                })}
              </div>

              {showQuestionValidation && (
                <p className="skill-validation-error">Please select one option to continue.</p>
              )}
              {submitError && <p className="skill-validation-error">{submitError}</p>}

              <div className="skill-covers">
                <p>This assessment covers:</p>
                <div>
                  <span className="cover-chip communication">Communication</span>
                  <span className="cover-chip analytical">Analytical Thinking</span>
                  <span className="cover-chip tech">Tech Proficiency</span>
                  <span className="cover-chip industry">Industry Knowledge</span>
                </div>
              </div>

              <div className="skill-actions">
                <button type="button" className="profile-secondary-action" onClick={handlePreviousQuestion}>
                  <IoArrowBackOutline /> Previous
                </button>
                <p>
                  Question {currentQuestionIndex + 1} of {questionCount}
                </p>
                <button
                  type="button"
                  className={currentChoice && !submitting ? 'step-action' : 'step-action disabled'}
                  onClick={handleNextQuestion}
                  disabled={!currentChoice || submitting}
                >
                  {submitting ? 'Submitting...' : isLastQuestion ? 'Submit Assessment' : 'Next Question'}{' '}
                  <IoArrowForward />
                </button>
              </div>
            </div>
          </article>

          <div className="privacy-notice skill-note">
            <IoShieldCheckmarkOutline />
            <p>
              <strong>No right or wrong answers</strong>
              <span className="privacy-note-copy">
                This assessment helps us understand your strengths and match you with surveys that fit
                your expertise. Answer honestly for the best experience.
              </span>
            </p>
          </div>
        </div>
    </AppSidebarLayout>
  )
}
