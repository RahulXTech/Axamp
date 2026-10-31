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

// Brand logos in their own colours — show them on a light tile
export const MetaIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
    <defs>
      <linearGradient id="meta-logo" x1="0" y1="0.5" x2="1" y2="0.5">
        <stop offset="0%" stopColor="#0064e0" />
        <stop offset="55%" stopColor="#0082fb" />
        <stop offset="100%" stopColor="#00a0ff" />
      </linearGradient>
    </defs>
    <path
      fill="url(#meta-logo)"
      d="M6.915 4.03c-1.968 0-3.683 1.28-4.871 3.113C.704 9.208 0 11.883 0 14.449c0 .706.07 1.369.21 1.973a6.624 6.624 0 0 0 .265.86 5.297 5.297 0 0 0 .371.761c.696 1.159 1.818 1.927 3.593 1.927 1.497 0 2.633-.671 3.965-2.444.76-1.012 1.144-1.626 2.663-4.32l.756-1.339.186-.325c.061.1.121.196.183.3l2.152 3.595c.724 1.21 1.665 2.556 2.47 3.314 1.046.987 1.992 1.22 3.06 1.22 1.075 0 1.876-.355 2.455-.843a3.743 3.743 0 0 0 .81-.973c.542-.939.861-2.127.861-3.745 0-2.72-.681-5.357-2.084-7.45-1.282-1.912-2.957-2.93-4.716-2.93-1.047 0-2.088.467-3.053 1.308-.652.57-1.257 1.29-1.82 2.05-.69-.875-1.335-1.547-1.958-2.056-1.182-.966-2.315-1.303-3.454-1.303zm10.16 2.053c1.147 0 2.188.758 2.992 1.999 1.132 1.748 1.647 4.195 1.647 6.4 0 1.548-.368 2.9-1.839 2.9-.58 0-1.027-.23-1.664-1.004-.496-.601-1.343-1.878-2.832-4.358l-.617-1.028a44.908 44.908 0 0 0-1.255-1.98c.07-.109.141-.224.211-.327 1.12-1.667 2.118-2.602 3.358-2.602zm-10.201.553c1.265 0 2.058.791 2.675 1.446.307.327.737.871 1.234 1.579l-1.02 1.566c-.757 1.163-1.882 3.017-2.837 4.338-1.191 1.649-1.81 1.817-2.486 1.817-.524 0-1.038-.237-1.383-.794-.263-.426-.464-1.13-.464-2.046 0-2.221.63-4.535 1.66-6.088.454-.687.964-1.226 1.533-1.533a2.264 2.264 0 0 1 1.088-.285z"
    />
  </svg>
)

// Google Ads: blue and yellow bars meeting at the top, green dot bottom-left
export const GoogleAdsIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" strokeLinecap="round" aria-hidden="true">
    <path d="M12 4.2 19.6 18.4" stroke="#4285f4" strokeWidth="6" />
    <path d="M12 4.2 7.6 12.4" stroke="#fbbc04" strokeWidth="6" />
    <circle cx="5" cy="18.6" r="3.6" fill="#34a853" />
  </svg>
)

export const WhatsAppIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12.04 2a9.9 9.9 0 0 0-8.5 14.98L2 22l5.16-1.5A9.93 9.93 0 1 0 12.04 2Zm0 18.1a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.06.89.9-2.98-.2-.31a8.2 8.2 0 1 1 6.84 3.73Zm4.5-6.14c-.25-.12-1.46-.72-1.69-.8-.23-.08-.39-.12-.55.12-.16.25-.63.8-.78.96-.14.17-.29.19-.53.06a6.7 6.7 0 0 1-3.34-2.92c-.25-.43.25-.4.72-1.34.08-.16.04-.3-.02-.43-.06-.12-.55-1.33-.76-1.82-.2-.48-.4-.41-.55-.42h-.47a.9.9 0 0 0-.65.3 2.74 2.74 0 0 0-.86 2.04 4.77 4.77 0 0 0 1 2.53c.12.16 1.72 2.63 4.17 3.69 1.55.67 2.16.73 2.93.61.47-.07 1.46-.6 1.66-1.17.2-.58.2-1.07.14-1.17-.06-.1-.22-.17-.47-.29Z" />
  </svg>
)
