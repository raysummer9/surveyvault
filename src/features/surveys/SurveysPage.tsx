import { PageSection } from '../../shared/ui/PageSection'

const surveyCards = [
  { title: 'Consumer habits pulse', reward: '$4.00', duration: '7 mins' },
  { title: 'Fintech app feedback', reward: '$8.50', duration: '14 mins' },
  { title: 'Travel preferences', reward: '$6.20', duration: '10 mins' },
]

export function SurveysPage() {
  return (
    <PageSection
      title="Available Surveys"
      description="After onboarding and one-time fee payment, users can complete surveys for rewards."
    >
      <ul className="card-grid">
        {surveyCards.map((survey) => (
          <li className="card" key={survey.title}>
            <h3>{survey.title}</h3>
            <p>Reward: {survey.reward}</p>
            <p>Estimated time: {survey.duration}</p>
            <button className="button secondary" type="button">
              Start survey
            </button>
          </li>
        ))}
      </ul>
    </PageSection>
  )
}
