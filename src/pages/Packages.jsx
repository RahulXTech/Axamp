import PageHero from '../components/PageHero'

// Packages — add the plans below the hero
export default function Packages() {
  return (
    <>
      <PageHero
        eyebrow="Packages"
        title={['Pick the plan', 'that fits your project.']}
        text="Monthly content plans for developers, consultants and brokers. Tell us about your project and we'll tailor one for you."
        secondary={{ label: 'Contact us', to: '/contact' }}
      />
    </>
  )
}
