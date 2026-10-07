import PageHero from '../components/PageHero'

export default function NotFound() {
  return (
    <PageHero
      eyebrow="404"
      title={['This page', "doesn't exist."]}
      text="The link may be old or mistyped."
      secondary={{ label: 'Back to home', to: '/' }}
    />
  )
}
