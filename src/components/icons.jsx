import { Drone, Route, Building, Footprints, Mic, MessagesSquare, Stethoscope, Hospital, HeartPulse, Workflow, Podcast, ClipboardPlus, ScanHeart, Clapperboard, FlaskConical, Briefcase } from 'lucide-react'

export const pillarIcons = {
  drone: Drone,
  route: Route,
  building: Building,
  footprints: Footprints,
  mic: Mic,
  messages: MessagesSquare,
  stethoscope: Stethoscope,
  hospital: Hospital,
  heart: HeartPulse,
  workflow: Workflow,
  podcast: Podcast,
  clipboard: ClipboardPlus,
  scan: ScanHeart,
  clapper: Clapperboard,
  flask: FlaskConical,
  briefcase: Briefcase,
}

export const PillarIcon = ({ name, size = 16 }) => {
  const Icon = pillarIcons[name] ?? Drone
  return <Icon size={size} strokeWidth={1.8} aria-hidden="true" />
}

export const InstagramIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
)

export const FacebookIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true">
    <path d="M17 2.5h-2.5A4.5 4.5 0 0 0 10 7v3H7v4h3v7.5h4V14h3l.75-4H14V7a1 1 0 0 1 1-1h2Z" />
  </svg>
)

export const LinkedInIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <path d="M8 10.5V16.5M12 16.5v-6M12 13.25a2.75 2.75 0 0 1 5.5 0v3.25" />
    <circle cx="8" cy="7.5" r="1" fill="currentColor" stroke="none" />
  </svg>
)

export const YouTubeIcon =({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <rect x="2.5" y="5" width="19" height="14" rx="4" />
    <path d="m10 9 5 3-5 3Z" fill="currentColor" stroke="none" />
  </svg>
)

export const WhatsAppIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12.04 2a9.9 9.9 0 0 0-8.5 14.98L2 22l5.16-1.5A9.93 9.93 0 1 0 12.04 2Zm0 18.1a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.06.89.9-2.98-.2-.31a8.2 8.2 0 1 1 6.84 3.73Zm4.5-6.14c-.25-.12-1.46-.72-1.69-.8-.23-.08-.39-.12-.55.12-.16.25-.63.8-.78.96-.14.17-.29.19-.53.06a6.7 6.7 0 0 1-3.34-2.92c-.25-.43.25-.4.72-1.34.08-.16.04-.3-.02-.43-.06-.12-.55-1.33-.76-1.82-.2-.48-.4-.41-.55-.42h-.47a.9.9 0 0 0-.65.3 2.74 2.74 0 0 0-.86 2.04 4.77 4.77 0 0 0 1 2.53c.12.16 1.72 2.63 4.17 3.69 1.55.67 2.16.73 2.93.61.47-.07 1.46-.6 1.66-1.17.2-.58.2-1.07.14-1.17-.06-.1-.22-.17-.47-.29Z" />
  </svg>
)
