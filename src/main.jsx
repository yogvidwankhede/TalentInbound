import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  ArrowRight,
  Bell,
  BriefcaseBusiness,
  Building2,
  Check,
  ChevronLeft,
  Eye,
  EyeOff,
  GraduationCap,
  HeartHandshake,
  Lock,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  UserRound,
  X,
} from 'lucide-react'
import './styles.css'

const candidateProfile = {
  name: 'Radheya Joshi',
  role: 'Applied ML Engineer',
  university: 'University of Michigan',
  degree: 'M.S. Computer Science',
  major: 'Machine Learning Systems',
  gpa: 3.84,
  gradYear: 2026,
  experienceYears: 3,
  previous: ['Stripe ML Platform Intern', 'UM NLP Lab Research Assistant'],
  skills: ['Python', 'PyTorch', 'LLMs', 'RAG', 'AWS', 'TypeScript'],
  proof: ['GitHub: retrieval-agent', 'ACL workshop paper', 'Open-source eval toolkit'],
  desiredRoles: ['Machine Learning Engineer', 'AI Product Engineer'],
  industries: ['AI infrastructure', 'Developer tools', 'Healthcare AI'],
  minSalary: 120,
  preferredSalary: [135, 155],
  location: 'Ann Arbor, MI',
  workModes: ['Remote', 'Hybrid'],
  availabilityDays: 21,
  companySizes: ['Startup', 'Growth-stage'],
  research: true,
  active: true,
}

const recruiter = {
  company: 'Nova AI',
  industry: 'Applied AI',
  size: 'Growth-stage',
  location: 'San Francisco, CA',
  website: 'nova-ai.example',
  team: 'Applied AI',
  verified: true,
}

const candidates = [
  candidateProfile,
  {
    name: 'Maya Patel',
    role: 'ML Platform Engineer',
    university: 'Georgia Tech',
    degree: 'B.S. Computer Science',
    major: 'Distributed Systems',
    gpa: 3.72,
    gradYear: 2024,
    experienceYears: 2,
    previous: ['Roblox Infrastructure', 'Autonomous systems capstone'],
    skills: ['Python', 'Kubernetes', 'TensorFlow', 'AWS', 'Go'],
    proof: ['GPU scheduler project', 'KubeCon lightning talk'],
    desiredRoles: ['ML Platform Engineer', 'Infrastructure Engineer'],
    industries: ['Developer tools', 'Gaming', 'AI infrastructure'],
    minSalary: 125,
    preferredSalary: [135, 165],
    location: 'Atlanta, GA',
    workModes: ['Remote', 'Hybrid'],
    availabilityDays: 45,
    companySizes: ['Growth-stage', 'Enterprise'],
    research: false,
    active: true,
  },
  {
    name: 'Jonas Weber',
    role: 'Research Engineer',
    university: 'Carnegie Mellon',
    degree: 'M.S. Robotics',
    major: 'Perception',
    gpa: 3.9,
    gradYear: 2025,
    experienceYears: 4,
    previous: ['Waymo perception internship', 'CMU AIR Lab'],
    skills: ['Python', 'PyTorch', 'Computer Vision', 'C++', 'RAG'],
    proof: ['CVPR poster', 'Open-source simulator'],
    desiredRoles: ['Research Engineer', 'Machine Learning Engineer'],
    industries: ['Autonomy', 'AI infrastructure'],
    minSalary: 145,
    preferredSalary: [155, 185],
    location: 'Pittsburgh, PA',
    workModes: ['Hybrid', 'Onsite'],
    availabilityDays: 60,
    companySizes: ['Startup', 'Growth-stage'],
    research: true,
    active: true,
  },
  {
    name: 'Elena Garcia',
    role: 'Data Scientist',
    university: 'UT Austin',
    degree: 'B.S. Statistics',
    major: 'Computational Statistics',
    gpa: 3.62,
    gradYear: 2023,
    experienceYears: 2,
    previous: ['Retail analytics lead', 'Civic data fellowship'],
    skills: ['Python', 'SQL', 'dbt', 'Experimentation', 'Tableau'],
    proof: ['Causal inference portfolio', 'Hackathon winner'],
    desiredRoles: ['Data Scientist', 'Product Analyst'],
    industries: ['Fintech', 'Healthcare AI'],
    minSalary: 105,
    preferredSalary: [115, 135],
    location: 'Austin, TX',
    workModes: ['Remote', 'Hybrid'],
    availabilityDays: 14,
    companySizes: ['Startup', 'Growth-stage', 'Enterprise'],
    research: false,
    active: true,
  },
]

const defaultSearch = {
  role: 'Machine Learning Engineer',
  skills: ['Python', 'PyTorch', 'LLMs', 'RAG'],
  minExperience: 2,
  maxExperience: 4,
  education: 'Master preferred',
  minGpa: 3.5,
  workModes: ['Remote', 'Hybrid'],
  salaryRange: [120, 160],
  availabilityDays: 30,
  researchPreferred: true,
  visa: 'Available',
  companySize: 'Growth-stage',
}

function scoreCandidate(candidate, search) {
  const skillHits = search.skills.filter((skill) => candidate.skills.includes(skill)).length
  const skillScore = skillHits / search.skills.length
  const expMid = (search.minExperience + search.maxExperience) / 2
  const experienceScore = Math.max(0, 1 - Math.abs(candidate.experienceYears - expMid) / 4)
  const educationScore =
    candidate.degree.includes('M.S.') || candidate.degree.includes('Ph.D.')
      ? 1
      : search.education.includes('Master')
        ? 0.72
        : 0.84
  const gpaScore = candidate.gpa >= search.minGpa ? 1 : Math.max(0.35, candidate.gpa / search.minGpa)
  const compensationScore =
    search.salaryRange[1] < candidate.minSalary
      ? 0.15
      : search.salaryRange[0] > candidate.preferredSalary[1]
        ? 0.65
        : 1
  const locationScore = candidate.workModes.some((mode) => search.workModes.includes(mode)) ? 0.95 : 0.35
  const roleScore = candidate.desiredRoles.includes(search.role) ? 1 : 0.62
  const availabilityScore =
    candidate.availabilityDays <= search.availabilityDays
      ? 1
      : Math.max(0.25, 1 - (candidate.availabilityDays - search.availabilityDays) / 90)
  const researchScore = search.researchPreferred ? (candidate.research ? 1 : 0.58) : 0.8
  const companySizeScore = candidate.companySizes.includes(search.companySize) ? 1 : 0.45

  const weights = {
    skills: 0.22,
    experience: 0.13,
    education: 0.09,
    compensation: 0.13,
    location: 0.1,
    role: 0.12,
    availability: 0.08,
    research: 0.07,
    companySize: 0.06,
  }

  const parts = {
    'Technical skills': Math.round(skillScore * 100),
    Experience: Math.round(experienceScore * 100),
    Education: Math.round(((educationScore + gpaScore) / 2) * 100),
    'Compensation alignment': Math.round(compensationScore * 100),
    'Location compatibility': Math.round(locationScore * 100),
    'Role preference': Math.round(roleScore * 100),
    Availability: Math.round(availabilityScore * 100),
    'Research background': Math.round(researchScore * 100),
    'Company-size preference': Math.round(companySizeScore * 100),
  }

  const weighted =
    skillScore * weights.skills +
    experienceScore * weights.experience +
    ((educationScore + gpaScore) / 2) * weights.education +
    compensationScore * weights.compensation +
    locationScore * weights.location +
    roleScore * weights.role +
    availabilityScore * weights.availability +
    researchScore * weights.research +
    companySizeScore * weights.companySize

  return { score: Math.round(weighted * 94.5), parts }
}

const rankedCandidates = candidates
  .map((candidate) => ({ ...candidate, match: scoreCandidate(candidate, defaultSearch) }))
  .sort((a, b) => b.match.score - a.match.score)

const storySteps = [
  {
    id: 'welcome',
    eyebrow: 'A different beginning',
    title: 'What if you never had to apply for a job again?',
    body: 'Fill in your details once. Stay discoverable. Let recruiters do the searching.',
    phoneMode: 'candidate',
    phoneScreen: 'welcome',
  },
  {
    id: 'problem',
    eyebrow: 'The current process',
    title: 'Something is backwards.',
    body: 'Job seekers repeatedly chase recruiters even though recruiters are ultimately searching for specific profiles anyway. The candidate should be able to fill in their details once, become discoverable, and wait to be reached out.',
    phoneMode: 'candidate',
    phoneScreen: 'profile',
  },
  {
    id: 'reverse',
    eyebrow: 'The reversal',
    title: 'So we reversed it.',
    body: 'Instead of candidates searching for companies, recruiters search candidates. The platform connects what people want with what teams need.',
    phoneMode: 'candidate',
    phoneScreen: 'reverse',
  },
  {
    id: 'identity',
    eyebrow: 'Create your professional profile',
    title: 'Tell us who you are.',
    body: 'Education, experience, skills, and proof of work become one reusable profile, so the same story does not need to be typed into a hundred portals.',
    phoneMode: 'candidate',
    phoneScreen: 'onboarding',
  },
  {
    id: 'preferences',
    eyebrow: 'Tell us what you actually want',
    title: 'Your preferences matter as much as your resume.',
    body: 'Desired roles, industries, recruiter company size, work mode, compensation, availability, and research interests all shape which recruiters can discover you.',
    phoneMode: 'candidate',
    phoneScreen: 'preferences',
  },
  {
    id: 'privacy',
    eyebrow: 'Candidate control',
    title: 'Become discoverable on your terms.',
    body: 'Choose whether your profile is visible, which details recruiters can see, whether you are actively looking, and who is blocked from finding you.',
    phoneMode: 'candidate',
    phoneScreen: 'privacy',
  },
  {
    id: 'recruiter',
    eyebrow: "Now imagine you're hiring",
    title: 'Verified recruiters enter the other side of the marketplace.',
    body: 'Our platform needs company verification before recruiters can search candidate profiles, so candidates are only discovered by legitimate hiring teams.',
    phoneMode: 'recruiter',
    phoneScreen: 'verification',
  },
  {
    id: 'search',
    eyebrow: 'Describe the person you need',
    title: 'Search becomes a structured request, not a keyword hunt.',
    body: 'Role, experience, skills, education, GPA, location, work arrangement, salary, availability, research background, visa support, and company-size fit all feed the ranking.',
    phoneMode: 'recruiter',
    phoneScreen: 'search',
  },
  {
    id: 'results',
    eyebrow: 'Weighted two-sided matching',
    title: 'The platform finds compatible candidates.',
    body: 'Matching is not simply keyword search. It weighs skills, experience, education, compensation, location, work mode, role preference, availability, research, and mutual constraints.',
    phoneMode: 'recruiter',
    phoneScreen: 'results',
  },
  {
    id: 'invite',
    eyebrow: 'The recruiter reaches out',
    title: 'Invite Candidate replaces Apply.',
    body: 'When a recruiter sees a strong fit, they invite the candidate. The candidate is not obligated, exposed, or interrupted until they choose to respond.',
    phoneMode: 'recruiter',
    phoneScreen: 'invite',
  },
  {
    id: 'candidateInvite',
    eyebrow: 'The job comes to you',
    title: 'This time, the recruiter reached out.',
    body: 'Nova AI wants to meet you for a Machine Learning Engineer role. Salary, location, team, and match rationale are visible before you decide.',
    phoneMode: 'candidate',
    phoneScreen: 'invitation',
  },
  {
    id: 'match',
    eyebrow: 'Mutual interest',
    title: 'Jobs should find people too.',
    body: 'If the candidate is interested, the match opens contact and messaging. No applications. No résumé black holes. The recruiter found you.',
    phoneMode: 'candidate',
    phoneScreen: 'match',
  },
]

function useActiveStep() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const sections = [...document.querySelectorAll('[data-story-step]')]
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible) setActive(Number(visible.target.getAttribute('data-story-step')))
      },
      { threshold: [0.38, 0.56, 0.72], rootMargin: '-12% 0px -20% 0px' },
    )
    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  return active
}

function App() {
  const activeStep = useActiveStep()
  const [manualScreen, setManualScreen] = useState(null)
  const step = storySteps[activeStep] || storySteps[0]
  const displayedStep = manualScreen ? { ...step, phoneScreen: manualScreen.screen, phoneMode: manualScreen.mode } : step

  useEffect(() => {
    setManualScreen(null)
  }, [activeStep])

  return (
    <main>
      <nav className="topbar" aria-label="Primary navigation">
        <a className="brand" href="#top" aria-label="Reverse hiring home">
          <span className="brandMark" aria-hidden="true">
            <HeartHandshake size={18} />
          </span>
          TalentInbound
        </a>
        <div className="navActions">
          <a href="#story">How it works</a>
          <a className="navPrototypeButton" href="#prototype">Try prototype</a>
          <a href="#final">Get started</a>
        </div>
      </nav>

      <header className="hero" id="top">
        <div className="heroCopy">
          <p className="eyebrow">Reverse hiring platform</p>
          <h1>
            Stop applying for jobs.
            <span>Let the right recruiters find you.</span>
          </h1>
          <p>
            Candidates create one detailed professional profile, then wait to be reached out. Verified recruiters
            search for exactly the talent they need. When companies are interested in you, you match.
          </p>
          <div className="ctaRow">
            <a className="button primary" href="#story">
              Create your profile <ArrowRight size={16} />
            </a>
            <a className="button secondary" href="#story">
              See how it works
            </a>
          </div>
          <DemoPath />
        </div>
        <div className="heroPhone" aria-label="Interactive product preview">
          <PhonePrototype step={{ phoneMode: 'candidate', phoneScreen: 'profile' }} onManualScreen={setManualScreen} />
        </div>
      </header>

      <section className="storyShell" id="story">
        <div className="storyText" aria-label="Reverse hiring story">
          {storySteps.map((item, index) => (
            <article
              className={`storyStep ${activeStep === index ? 'isActive' : ''}`}
              data-story-step={index}
              key={item.id}
            >
              <p className="eyebrow">{item.eyebrow}</p>
              <h2>{item.title}</h2>
              <p>{item.body}</p>
              {item.id === 'reverse' && <ProcessFlip active={activeStep >= index} />}
              {item.id === 'results' && <ScoreLegend />}
            </article>
          ))}
        </div>
        <aside className="stickyPhone" aria-label="Persistent interactive phone prototype">
          <PhonePrototype step={displayedStep} onManualScreen={setManualScreen} />
          <div className="phoneHint">Scroll to change the story. Tap inside the phone to change the product state.</div>
        </aside>
      </section>

      <section className="mvpProof" aria-label="Hackathon MVP proof">
        <div>
          <p className="eyebrow">Working MVP</p>
          <h2>One path through the product, working end to end.</h2>
        </div>
        <div className="proofGrid">
          <div>
            <strong>The problem</strong>
            <p>Candidates spend time chasing openings while recruiters are already searching for specific profiles.</p>
          </div>
          <div>
            <strong>The solution</strong>
            <p>Candidates fill their details once. Verified recruiters search, invite, and start the match.</p>
          </div>
          <div>
            <strong>Where AI helps</strong>
            <p>AI supports ranking by weighing skills, experience, compensation, location, availability, and preferences.</p>
          </div>
          <div>
            <strong>Next technical need</strong>
            <p>Validate recruiter verification and matching quality with real companies and real candidate profiles.</p>
          </div>
        </div>
      </section>

      <section className="benefits" aria-label="Why this works">
        <div>
          <p className="eyebrow">Why this works</p>
          <h2>One marketplace. Two clear signals.</h2>
        </div>
        <div className="benefitGrid">
          <div>
            <h3>One profile. No endless applications.</h3>
            <p>Candidate effort compounds instead of disappearing into separate portals.</p>
          </div>
          <div>
            <h3>Search the talent you actually need.</h3>
            <p>Recruiters describe the candidate and the system ranks people who also want that kind of role.</p>
          </div>
          <div>
            <h3>Only talk when there is mutual interest.</h3>
            <p>Recruiter interest opens an invitation. Candidate interest opens the conversation.</p>
          </div>
        </div>
      </section>

      <section className="intelligence" aria-label="Matching intelligence">
        <p className="eyebrow">Matching intelligence</p>
        <h2>AI supports the ranking. It is not the whole solution.</h2>
        <p>
          The prototype simulates a transparent weighted score across skills, experience, education, compensation,
          location, work arrangement, industry preference, company-size preference, role preference, availability,
          research background, career trajectory, candidate interest, and recruiter requirements. The human decision
          still belongs to the recruiter and the candidate.
        </p>
      </section>

      <section className="appPrototypeSection" id="prototype" aria-label="Full app launch prototype">
        <div className="appPrototypeCopy">
          <p className="eyebrow">Full prototype</p>
          <h2>Open the app like a judge would.</h2>
          <p>
            Start on an iOS-style home screen, tap the app, choose candidate or recruiter, sign in with anything or
            skip, then view both sides of the product at once.
          </p>
          <div className="novaExplainer">
            <strong>Nova AI's role in the demo</strong>
            <span>
              Nova AI is the verified recruiter. It answers a few structured hiring questions, searches the candidate
              marketplace, reviews why Radheya is a fit, and sends the invitation.
            </span>
          </div>
        </div>
        <div className="appPrototypeCanvas">
          <LaunchPrototype />
        </div>
      </section>

      <section className="finalCta" id="final">
        <h2>Your next opportunity might already be looking for you.</h2>
        <div className="ctaRow">
          <a className="button primary" href="#story">
            Become discoverable <ArrowRight size={16} />
          </a>
          <a className="button secondary" href="#story">
            Find your next hire
          </a>
        </div>
        <p>No applications. No résumé black holes. The recruiter found you.</p>
      </section>
    </main>
  )
}

function LaunchPrototype() {
  const [stage, setStage] = useState('home')
  const [role, setRole] = useState('candidate')
  const [login, setLogin] = useState({ email: '', password: '' })

  useEffect(() => {
    if (stage !== 'loading') return undefined
    const timeout = window.setTimeout(() => setStage('role'), 1150)
    return () => window.clearTimeout(timeout)
  }, [stage])

  function chooseRole(nextRole) {
    setRole(nextRole)
    setStage('login')
  }

  function enterApp(event) {
    event?.preventDefault()
    setStage('showcase')
  }

  if (stage === 'showcase') {
    return <SplitAppShowcase role={role} onRestart={() => setStage('home')} />
  }

  return (
    <div className="launchPrototype">
      <PrototypeDevice statusLabel="5G" className="launchDevice">
        {stage === 'home' && <IosHome onOpen={() => setStage('loading')} />}
        {stage === 'loading' && <AppLoading />}
        {stage === 'role' && <RoleChoice onChoose={chooseRole} />}
        {stage === 'login' && (
          <LoginScreen
            role={role}
            login={login}
            setLogin={setLogin}
            onSubmit={enterApp}
            onSkip={() => enterApp()}
          />
        )}
      </PrototypeDevice>
    </div>
  )
}

function PrototypeDevice({ statusLabel, className = '', children }) {
  return (
    <div className={`prototypeDevice ${className}`} data-testid="prototype-device">
      <div className="prototypeSpeaker" aria-hidden="true" />
      <div className="prototypeStatus" aria-hidden="true">
        <span>9:41</span>
        <span>{statusLabel}</span>
      </div>
      <div className="prototypeViewport" aria-live="polite">
        {children}
      </div>
    </div>
  )
}

function IosHome({ onOpen }) {
  return (
    <div className="iosHome">
      <div className="iosDate">
        <span>Sunday</span>
        <strong>30</strong>
      </div>
      <div className="appIconGrid">
        <button className="iosAppIcon talentInboundIcon" onClick={onOpen} aria-label="Open TalentInbound app">
          <span>
            <HeartHandshake size={30} />
          </span>
          <b>TalentInbound</b>
        </button>
        {['Mail', 'Calendar', 'Photos', 'Notes', 'Maps', 'Wallet', 'Clock'].map((app) => (
          <div className="iosAppIcon ghostIcon" key={app} aria-hidden="true">
            <span />
            <b>{app}</b>
          </div>
        ))}
      </div>
      <div className="iosDock" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>
    </div>
  )
}

function AppLoading() {
  return (
    <div className="appLoading">
      <div className="loadingMark">
        <HeartHandshake size={38} />
      </div>
      <h3>TalentInbound</h3>
      <p>Preparing your reverse hiring workspace</p>
      <div className="loadingTrack">
        <span />
      </div>
    </div>
  )
}

function RoleChoice({ onChoose }) {
  return (
    <div className="roleChoice">
      <div>
        <p className="appMiniEyebrow">Sign up</p>
        <h3>Which side are you on?</h3>
        <p>Choose a role to enter. The demo opens both sides so you can show the complete flow.</p>
      </div>
      <div className="roleChoices">
        <button className="roleButton" onClick={() => onChoose('recruiter')}>
          <span className="roleIcon"><Building2 size={20} /></span>
          <span>
            <strong>I am a recruiter</strong>
            <small>Verify Nova AI, search, rank, and invite.</small>
          </span>
          <ArrowRight size={17} />
        </button>
        <button className="roleButton" onClick={() => onChoose('candidate')}>
          <span className="roleIcon"><UserRound size={20} /></span>
          <span>
            <strong>I am a candidate</strong>
            <small>Complete one profile, then wait to be found.</small>
          </span>
          <ArrowRight size={17} />
        </button>
      </div>
    </div>
  )
}

function LoginScreen({ role, login, setLogin, onSubmit, onSkip }) {
  return (
    <form className="prototypeLogin" onSubmit={onSubmit}>
      <div>
        <p className="appMiniEyebrow">{role === 'recruiter' ? 'Recruiter login' : 'Candidate login'}</p>
        <h3>Enter anything to continue.</h3>
        <p>This prototype accepts any details so judges can reach the working demo quickly.</p>
      </div>
      <label>
        <span>Email</span>
        <input
          autoComplete="email"
          inputMode="email"
          onChange={(event) => setLogin({ ...login, email: event.target.value })}
          placeholder={role === 'recruiter' ? 'recruiter@company.com' : 'candidate@email.com'}
          value={login.email}
        />
      </label>
      <label>
        <span>Password</span>
        <input
          autoComplete="current-password"
          onChange={(event) => setLogin({ ...login, password: event.target.value })}
          placeholder="Anything works"
          type="password"
          value={login.password}
        />
      </label>
      <button className="phoneButton primary" type="submit">
        Continue
      </button>
      <button className="phoneButton muted" type="button" onClick={onSkip}>
        Skip for demo
      </button>
    </form>
  )
}

function SplitAppShowcase({ role, onRestart }) {
  const [inviteState, setInviteState] = useState('draft')

  return (
    <div className="splitAppStage">
      <div className="showcaseHeader">
        <div>
          <p className="appMiniEyebrow">Demo workspace</p>
          <h3>{role === 'recruiter' ? 'Recruiter workspace opened.' : 'Candidate workspace opened.'}</h3>
          <p>Nova AI is on the left. Radheya Joshi is on the right. Actions now pass between both phones.</p>
        </div>
        <button className="iconButton" onClick={onRestart} aria-label="Restart app prototype">
          <ChevronLeft size={16} />
        </button>
      </div>
      <div className="twoAppGrid">
        <PrototypeDevice statusLabel="Recruiter" className="showcasePhone">
          <RecruiterFullApp inviteState={inviteState} onInviteStateChange={setInviteState} />
        </PrototypeDevice>
        <PrototypeDevice statusLabel="Candidate" className="showcasePhone">
          <CandidateFullApp inviteState={inviteState} onInviteStateChange={setInviteState} />
        </PrototypeDevice>
      </div>
    </div>
  )
}

function CandidateFullApp({ inviteState, onInviteStateChange }) {
  const [tab, setTab] = useState('profile')
  const [isVisible, setIsVisible] = useState(true)
  const [showSalary, setShowSalary] = useState(true)
  const [salary, setSalary] = useState(145)

  const tabs = [
    ['profile', 'Profile', UserRound],
    ['preferences', 'Preferences', SlidersHorizontal],
    ['privacy', 'Privacy', Lock],
    ['invite', 'Matches', Bell],
  ]

  return (
    <article className="prototypeApp candidatePrototype">
      <PrototypeAppHeader mode="candidate" />
      <div className="prototypeAppBody">
        {tab === 'profile' && (
          <section className="prototypeScreenContent enter" aria-label="Candidate profile">
            <div className="prototypeSectionHeading">
              <div>
                <span>Professional profile</span>
                <h3>Ready to be discovered.</h3>
              </div>
              <b className="completionBadge">100%</b>
            </div>
            <div className="profileSummary">
              <div className="avatar">RJ</div>
              <div>
                <h3>Radheya Joshi</h3>
                <p>Applied ML Engineer</p>
                <span>Ann Arbor, MI</span>
              </div>
            </div>
            <ProgressBar value={100} />
            <div className="profileSections">
              <ProfileSection icon={GraduationCap} label="Education" value="M.S. Computer Science, Michigan · GPA 3.84" />
              <ProfileSection icon={BriefcaseBusiness} label="Experience" value="Stripe ML Platform · UM NLP Lab · 3 years" />
              <ProfileSection icon={SlidersHorizontal} label="Core skills" value="Python · PyTorch · LLMs · RAG · AWS" />
              <ProfileSection icon={Sparkles} label="Proof of work" value="Retrieval agent · ACL paper · Eval toolkit" />
            </div>
            <button className="phoneButton primary" onClick={() => setTab('preferences')}>
              Review preferences <ArrowRight size={16} />
            </button>
          </section>
        )}
        {tab === 'preferences' && (
          <section className="prototypeScreenContent enter" aria-label="Candidate preferences">
            <div className="prototypeSectionHeading">
              <div>
                <span>Job preferences</span>
                <h3>What should find you?</h3>
              </div>
            </div>
            <PreferenceGroup label="Roles" values={['ML Engineer', 'AI Product Engineer']} />
            <PreferenceGroup label="Work mode" values={['Remote', 'Hybrid']} />
            <PreferenceGroup label="Company stage" values={['Startup', 'Growth-stage']} />
            <div className="salaryControl">
              <div>
                <span>Preferred compensation</span>
                <strong>${salary}K target</strong>
              </div>
              <input
                aria-label="Preferred compensation"
                min="120"
                max="175"
                onChange={(event) => setSalary(Number(event.target.value))}
                type="range"
                value={salary}
              />
              <small>$120K minimum · Available in 21 days</small>
            </div>
            <button className="phoneButton primary" onClick={() => setTab('privacy')}>
              Set privacy <ArrowRight size={16} />
            </button>
          </section>
        )}
        {tab === 'privacy' && (
          <section className="prototypeScreenContent enter" aria-label="Candidate privacy controls">
            <div className="privacyIntro">
              <span className="blueIcon"><Lock size={20} /></span>
              <div>
                <span>Discoverability</span>
                <h3>You decide what recruiters see.</h3>
              </div>
            </div>
            <div className="privacyControls">
              <Toggle label="Profile visible" checked={isVisible} onChange={setIsVisible} icon={isVisible ? Eye : EyeOff} />
              <Toggle label="Show compensation" checked={showSalary} onChange={setShowSalary} icon={SlidersHorizontal} />
            </div>
            <div className={`visibilityStatus ${isVisible ? 'isOn' : ''}`}>
              <span className="statusDot" />
              <div>
                <strong>{isVisible ? 'Visible to verified recruiters' : 'Profile is paused'}</strong>
                <small>{isVisible ? 'Nova AI can find this profile in search.' : 'No company can discover you right now.'}</small>
              </div>
            </div>
            <div className="privacyNote">
              <ShieldCheck size={18} />
              <p>Only verified company recruiters can view your professional profile. Contact details stay locked until you respond.</p>
            </div>
            <button className="phoneButton primary" onClick={() => setTab('invite')}>
              View matches <ArrowRight size={16} />
            </button>
          </section>
        )}
        {tab === 'invite' && (
          <CandidateMatchScreen
            inviteState={inviteState}
            onDecision={(decision) => onInviteStateChange(decision)}
          />
        )}
      </div>
      <PrototypeNav tabs={tabs} active={tab} onChange={setTab} badge={inviteState === 'sent' ? 'invite' : null} />
    </article>
  )
}

function RecruiterFullApp({ inviteState, onInviteStateChange }) {
  const [tab, setTab] = useState('verify')
  const [verified, setVerified] = useState(false)
  const [isRanking, setIsRanking] = useState(false)
  const [showWhy, setShowWhy] = useState(false)
  const [candidateIndex, setCandidateIndex] = useState(0)
  const [roleSetup, setRoleSetup] = useState({
    role: 'Machine Learning Engineer',
    experience: '2-4 years',
    workMode: 'Remote',
    salary: '$135K-$155K',
    research: 'Preferred',
  })

  const tabs = [
    ['verify', 'Verify', ShieldCheck],
    ['search', 'Search', Search],
    ['results', 'Candidates', UserRound],
    ['invite', 'Invite', Bell],
  ]

  function verifyCompany() {
    setVerified(true)
    setTab('search')
  }

  function rankCandidates() {
    if (!verified) return
    setIsRanking(true)
    window.setTimeout(() => {
      setIsRanking(false)
      setTab('results')
    }, 720)
  }

  const currentCandidate = rankedCandidates[candidateIndex % rankedCandidates.length]

  return (
    <article className="prototypeApp recruiterPrototype">
      <PrototypeAppHeader mode="recruiter" verified={verified} />
      <div className="prototypeAppBody">
        {tab === 'verify' && (
          <section className="prototypeScreenContent enter" aria-label="Company verification">
            <div className="verificationHero">
              <span className="blueIcon"><ShieldCheck size={22} /></span>
              <div>
                <span>Required before search</span>
                <h3>Verify Nova AI.</h3>
                <p>Company access protects candidates from unverified outreach.</p>
              </div>
            </div>
            <div className="verificationList">
              <VerificationRow label="Company" value="Nova AI, Inc." />
              <VerificationRow label="Website" value="nova-ai.example" />
              <VerificationRow label="Business email" value="recruiting@nova-ai.example" />
              <VerificationRow label="Hiring identity" value="Applied AI recruiting team" />
              <VerificationRow label="Open role" value="Machine Learning Engineer" />
            </div>
            <div className="verificationNote">
              <Lock size={15} /> Candidate search remains locked until all five checks pass.
            </div>
            <button className="phoneButton primary" onClick={verifyCompany}>
              Verify company <ArrowRight size={16} />
            </button>
          </section>
        )}
        {tab === 'search' && (
          <section className="prototypeScreenContent enter" aria-label="Recruiter candidate search">
            <div className="prototypeSectionHeading">
              <div>
                <span>Structured search</span>
                <h3>Who does Nova AI need?</h3>
              </div>
              {verified && <span className="verifiedTag"><Check size={13} /> Verified</span>}
            </div>
            {!verified ? (
              <LockedSearch onVerify={() => setTab('verify')} />
            ) : isRanking ? (
              <RankingState />
            ) : (
              <>
                <SelectableQuestion
                  label="Role"
                  value={roleSetup.role}
                  options={['Machine Learning Engineer', 'AI Product Engineer', 'Data Scientist']}
                  onChange={(value) => setRoleSetup({ ...roleSetup, role: value })}
                />
                <SelectableQuestion
                  label="Experience"
                  value={roleSetup.experience}
                  options={['0-1 years', '2-4 years', '5+ years']}
                  onChange={(value) => setRoleSetup({ ...roleSetup, experience: value })}
                />
                <SelectableQuestion
                  label="Work mode"
                  value={roleSetup.workMode}
                  options={['Remote', 'Hybrid', 'Onsite']}
                  onChange={(value) => setRoleSetup({ ...roleSetup, workMode: value })}
                />
                <SelectableQuestion
                  label="Compensation"
                  value={roleSetup.salary}
                  options={['$100K-$120K', '$135K-$155K', '$160K-$190K']}
                  onChange={(value) => setRoleSetup({ ...roleSetup, salary: value })}
                />
                <SelectableQuestion
                  label="Research background"
                  value={roleSetup.research}
                  options={['Required', 'Preferred', 'Not needed']}
                  onChange={(value) => setRoleSetup({ ...roleSetup, research: value })}
                />
                <button className="phoneButton primary" onClick={rankCandidates}>
                  Rank candidates <Search size={16} />
                </button>
              </>
            )}
          </section>
        )}
        {tab === 'results' && (
          <section className="prototypeScreenContent enter" aria-label="Ranked candidates">
            <div className="prototypeSectionHeading">
              <div>
                <span>47 compatible profiles</span>
                <h3>Best two-sided fit.</h3>
              </div>
              <span className="rankBadge">#{candidateIndex + 1}</span>
            </div>
            <RecruiterCandidateCard
              candidate={currentCandidate}
              showWhy={showWhy}
              onToggleWhy={() => setShowWhy(!showWhy)}
            />
            <div className="candidateControls">
              <button className="iconButton" onClick={() => { setShowWhy(false); setCandidateIndex((candidateIndex + 1) % rankedCandidates.length) }} aria-label="Pass and view next candidate">
                <X size={17} />
              </button>
              <span>Pass</span>
              <span>Invite</span>
              <button className="iconButton inviteIcon" onClick={() => setTab('invite')} aria-label="Invite this candidate">
                <Check size={17} />
              </button>
            </div>
            <button className="phoneButton primary" onClick={() => setTab('invite')}>
              Invite Radheya <ArrowRight size={16} />
            </button>
          </section>
        )}
        {tab === 'invite' && (
          <RecruiterInviteScreen inviteState={inviteState} onInvite={() => onInviteStateChange('sent')} />
        )}
      </div>
      <PrototypeNav tabs={tabs} active={tab} onChange={setTab} badge={inviteState === 'interested' ? 'invite' : null} />
    </article>
  )
}

function PrototypeAppHeader({ mode, verified = false }) {
  const isRecruiter = mode === 'recruiter'
  return (
    <header className="prototypeAppHeader">
      <div>
        <span>{isRecruiter ? 'Recruiter workspace' : 'Candidate profile'}</span>
        <strong>{isRecruiter ? 'Nova AI' : 'Radheya Joshi'}</strong>
      </div>
      <span className="headerIcon">
        {isRecruiter ? <Building2 size={17} /> : <UserRound size={17} />}
        {isRecruiter && verified && <i aria-label="Verified company"><Check size={9} /></i>}
      </span>
    </header>
  )
}

function PrototypeNav({ tabs, active, onChange, badge }) {
  return (
    <nav className="prototypeNav" aria-label="App screens">
      {tabs.map(([id, label, Icon]) => (
        <button
          aria-current={active === id ? 'page' : undefined}
          className={active === id ? 'isActive' : ''}
          key={id}
          onClick={() => onChange(id)}
          type="button"
        >
          <span>
            <Icon size={17} />
            {badge === id && <i aria-hidden="true" />}
          </span>
          {label}
        </button>
      ))}
    </nav>
  )
}

function ProfileSection({ icon: Icon, label, value }) {
  return (
    <div className="profileSection">
      <span className="rowIcon"><Icon size={16} /></span>
      <div>
        <strong>{label}</strong>
        <p>{value}</p>
      </div>
      <Check size={15} />
    </div>
  )
}

function PreferenceGroup({ label, values }) {
  return (
    <div className="preferenceGroup">
      <strong>{label}</strong>
      <div>
        {values.map((value) => <span key={value}><Check size={12} /> {value}</span>)}
      </div>
    </div>
  )
}

function CandidateMatchScreen({ inviteState, onDecision }) {
  if (inviteState === 'draft') {
    return (
      <section className="prototypeScreenContent emptyMatch enter" aria-label="Candidate matches">
        <span className="blueIcon"><Bell size={22} /></span>
        <h3>No company invitations yet.</h3>
        <p>Your profile is complete and discoverable. There is nothing else you need to do.</p>
        <div className="waitingPulse"><span /><span /><span /></div>
      </section>
    )
  }

  if (inviteState === 'interested') {
    return (
      <section className="prototypeScreenContent matchComplete enter" aria-label="Candidate match">
        <div className="matchMark"><HeartHandshake size={42} /></div>
        <span>Company interest confirmed</span>
        <h3>Nova AI matched with you.</h3>
        <p>Your response opened messaging and contact details with the Applied AI team.</p>
        <div className="messageBubble">
          <strong>Nova AI</strong>
          <span>We loved your retrieval evaluation work. Are you open to a conversation next week?</span>
        </div>
        <button className="phoneButton primary">Open conversation</button>
      </section>
    )
  }

  return (
    <section className="prototypeScreenContent enter" aria-label="Candidate invitation">
      <div className="invitationHero">
        <span className="companyMonogram">NA</span>
        <div>
          <span>Nova AI is interested in you</span>
          <h3>Machine Learning Engineer</h3>
          <p>Applied AI · Verified company</p>
        </div>
      </div>
      <div className="offerFacts">
        <span><strong>94%</strong> match</span>
        <span><strong>$135K-$155K</strong> salary</span>
        <span><strong>Remote</strong> work mode</span>
        <span><strong>21 days</strong> availability fit</span>
      </div>
      <div className="matchReason">
        <strong>Why Nova AI found you</strong>
        <p>Python, PyTorch, LLMs, RAG, research experience, salary, and remote preference all align.</p>
      </div>
      {inviteState === 'declined' ? (
        <div className="declinedState">
          <Check size={16} /> Not interested saved. You remain discoverable to other companies.
        </div>
      ) : (
        <div className="decisionRow">
          <button className="phoneButton primary" onClick={() => onDecision('interested')}>Interested</button>
          <button className="phoneButton muted" onClick={() => onDecision('declined')}>Not interested</button>
        </div>
      )}
    </section>
  )
}

function VerificationRow({ label, value }) {
  return (
    <div className="verificationRow">
      <span className="checkCircle"><Check size={12} /></span>
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
      </div>
    </div>
  )
}

function LockedSearch({ onVerify }) {
  return (
    <div className="lockedSearch">
      <span className="blueIcon"><Lock size={20} /></span>
      <h3>Search is locked.</h3>
      <p>Verify the company, recruiter identity, and open role first.</p>
      <button className="phoneButton primary" onClick={onVerify}>Start verification</button>
    </div>
  )
}

function RankingState() {
  return (
    <div className="rankingState" role="status">
      <div className="rankingRings"><Search size={22} /></div>
      <h3>Ranking compatible candidates...</h3>
      <p>Checking skills, experience, compensation, work mode, role preference, availability, education, and research.</p>
      <div className="rankingLines"><span /><span /><span /></div>
    </div>
  )
}

function RecruiterCandidateCard({ candidate, showWhy, onToggleWhy }) {
  return (
    <div className="recruiterCandidateCard">
      <div className="candidateCardHeader">
        <div className="avatar small">{candidate.name.split(' ').map((part) => part[0]).join('')}</div>
        <div>
          <h3>{candidate.name}</h3>
          <p>{candidate.role}</p>
        </div>
        <span className="matchScore">{candidate.match.score}%</span>
      </div>
      <div className="candidateHighlights">
        <span>{candidate.degree}</span>
        <span>{candidate.experienceYears} years</span>
        <span>{candidate.workModes.join(' / ')}</span>
      </div>
      <div className="candidateSkills">
        {candidate.skills.slice(0, 4).map((skill) => <span key={skill}>{skill}</span>)}
      </div>
      <button className="whyButton" onClick={onToggleWhy} aria-expanded={showWhy}>
        <Sparkles size={15} /> Why this match? <span>{showWhy ? 'Hide' : 'View'}</span>
      </button>
      {showWhy && (
        <div className="matchBreakdown">
          {Object.entries(candidate.match.parts).slice(0, 5).map(([label, value]) => (
            <div key={label}>
              <span>{label}</span>
              <i><b style={{ width: `${value}%` }} /></i>
              <strong>{value}%</strong>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function RecruiterInviteScreen({ inviteState, onInvite }) {
  return (
    <section className="prototypeScreenContent enter" aria-label="Recruiter invitation">
      <div className="prototypeSectionHeading">
        <div>
          <span>Candidate invitation</span>
          <h3>Reach out with context.</h3>
        </div>
      </div>
      <div className="inviteCandidateLine">
        <div className="avatar small">RJ</div>
        <div>
          <strong>Radheya Joshi</strong>
          <span>94% match · Applied ML Engineer</span>
        </div>
        <Check size={16} />
      </div>
      <div className="inviteSummary">
        <span>Machine Learning Engineer</span>
        <span>$135K-$155K</span>
        <span>Remote</span>
        <span>Applied AI</span>
      </div>
      <label className="messageComposer">
        <span>Message from Nova AI</span>
        <textarea defaultValue="We loved your retrieval evaluation work. Are you open to a first conversation next week?" />
      </label>
      {inviteState === 'draft' && (
        <button className="phoneButton primary" onClick={onInvite}>
          Send invitation <Bell size={16} />
        </button>
      )}
      {inviteState === 'sent' && (
        <div className="inviteStatus sent">
          <Check size={18} />
          <div><strong>Invitation delivered.</strong><span>It is now visible on Radheya's phone.</span></div>
        </div>
      )}
      {inviteState === 'interested' && (
        <div className="inviteStatus matched">
          <HeartHandshake size={20} />
          <div><strong>Radheya is interested.</strong><span>Conversation and contact details are open.</span></div>
        </div>
      )}
      {inviteState === 'declined' && (
        <div className="inviteStatus">
          <Check size={18} />
          <div><strong>Radheya passed.</strong><span>The candidate remains in control.</span></div>
        </div>
      )}
    </section>
  )
}

function SelectableQuestion({ label, value, options, onChange }) {
  return (
    <div className="selectableQuestion">
      <strong>{label}</strong>
      <div>
        {options.map((option) => (
          <button
            className={option === value ? 'isSelected' : ''}
            key={option}
            onClick={() => onChange(option)}
            type="button"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}

function DemoPath() {
  const steps = ['Candidate fills profile', 'Recruiter searches', 'Recruiter invites', 'Candidate responds', 'Match opens']
  return (
    <div className="demoPath" aria-label="MVP demo path">
      <span>Demo path</span>
      <ol>
        {steps.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ol>
    </div>
  )
}

function ProcessFlip({ active }) {
  return (
    <div className={`processFlip ${active ? 'isFlipped' : ''}`} aria-label="Traditional hiring process reversed">
      <div>Recruiter</div>
      <ArrowRight size={16} />
      <div>search</div>
      <ArrowRight size={16} />
      <div>candidate</div>
    </div>
  )
}

function ScoreLegend() {
  const dimensions = ['Skills', 'Experience', 'Education', 'Compensation', 'Location', 'Work mode', 'Availability']
  return (
    <div className="scoreLegend">
      {dimensions.map((dimension) => (
        <span key={dimension}>{dimension}</span>
      ))}
    </div>
  )
}

function PhonePrototype({ step, onManualScreen }) {
  const [candidateStage, setCandidateStage] = useState(0)
  const [visible, setVisible] = useState(true)
  const [showComp, setShowComp] = useState(false)
  const [activelyLooking, setActivelyLooking] = useState(true)
  const [range, setRange] = useState(defaultSearch.salaryRange)
  const [isRanking, setIsRanking] = useState(false)
  const [showWhy, setShowWhy] = useState(false)
  const [inviteSent, setInviteSent] = useState(false)
  const [candidateDecision, setCandidateDecision] = useState(null)
  const [cardOffset, setCardOffset] = useState(0)
  const contentRef = useRef(null)

  const search = useMemo(() => ({ ...defaultSearch, salaryRange: range }), [range])
  const ranked = useMemo(
    () =>
      candidates
        .map((candidate) => ({ ...candidate, match: scoreCandidate(candidate, search) }))
        .sort((a, b) => b.match.score - a.match.score),
    [search],
  )
  const topCandidate = ranked[0]

  useEffect(() => {
    if (step.phoneScreen === 'results') {
      setIsRanking(true)
      const timeout = window.setTimeout(() => setIsRanking(false), 680)
      return () => window.clearTimeout(timeout)
    }
  }, [step.phoneScreen, range])

  useEffect(() => {
    contentRef.current?.focus({ preventScroll: true })
  }, [step.phoneScreen, step.phoneMode])

  function go(screen, mode = step.phoneMode) {
    onManualScreen?.({ screen, mode })
  }

  return (
    <div className={`phoneFrame ${step.phoneMode === 'recruiter' ? 'isRecruiter' : 'isCandidate'}`}>
      <div className="phoneChrome">
        <div className="speaker" aria-hidden="true" />
        <div className="phoneStatus">
          <span>9:41</span>
          <span>{step.phoneMode === 'recruiter' ? 'Recruiter' : 'Candidate'}</span>
        </div>
        <div className="screen" ref={contentRef} tabIndex={-1}>
          <PhoneHeader mode={step.phoneMode} />
          <div className="screenScroller">
            {step.phoneScreen === 'welcome' && <WelcomeScreen onCreate={() => go('onboarding', 'candidate')} />}
            {step.phoneScreen === 'profile' && <ProfileScreen />}
            {step.phoneScreen === 'reverse' && <ReverseScreen />}
            {step.phoneScreen === 'onboarding' && (
              <OnboardingScreen stage={candidateStage} setStage={setCandidateStage} onComplete={() => go('preferences')} />
            )}
            {step.phoneScreen === 'preferences' && <PreferenceScreen onPrivacy={() => go('privacy')} />}
            {step.phoneScreen === 'privacy' && (
              <PrivacyScreen
                visible={visible}
                setVisible={setVisible}
                showComp={showComp}
                setShowComp={setShowComp}
                activelyLooking={activelyLooking}
                setActivelyLooking={setActivelyLooking}
                onRecruiter={() => go('verification', 'recruiter')}
              />
            )}
            {step.phoneScreen === 'verification' && <VerificationScreen />}
            {step.phoneScreen === 'search' && <SearchScreen range={range} setRange={setRange} onRun={() => go('results', 'recruiter')} />}
            {step.phoneScreen === 'results' && (
              <ResultsScreen
                ranked={ranked}
                isRanking={isRanking}
                showWhy={showWhy}
                setShowWhy={setShowWhy}
                cardOffset={cardOffset}
                setCardOffset={setCardOffset}
                onInvite={() => go('invite', 'recruiter')}
              />
            )}
            {step.phoneScreen === 'invite' && (
              <InviteScreen sent={inviteSent} onSend={() => setInviteSent(true)} onCandidate={() => go('invitation', 'candidate')} />
            )}
            {step.phoneScreen === 'invitation' && (
              <InvitationScreen
                candidateDecision={candidateDecision}
                topCandidate={topCandidate}
                onInterested={() => {
                  setCandidateDecision('interested')
                  go('match', 'candidate')
                }}
                onNotInterested={() => setCandidateDecision('not-interested')}
              />
            )}
            {step.phoneScreen === 'match' && <MatchScreen />}
          </div>
        </div>
      </div>
    </div>
  )
}

function PhoneHeader({ mode }) {
  return (
    <header className="appHeader">
      <div>
        <span className="appKicker">{mode === 'recruiter' ? 'Recruiter' : 'Profile'}</span>
        <strong>{mode === 'recruiter' ? 'Nova AI' : 'Radheya Joshi'}</strong>
      </div>
      <span className="modePill">{mode === 'recruiter' ? <Building2 size={14} /> : <UserRound size={14} />}</span>
    </header>
  )
}

function WelcomeScreen({ onCreate }) {
  return (
    <section className="phoneScreen enter">
      <div className="centerMoment">
        <Sparkles size={28} />
        <h3>Your next job should find you.</h3>
        <p>Create one profile. Let verified recruiters come to you.</p>
      </div>
      <button className="phoneButton primary" onClick={onCreate}>
        Create profile
      </button>
      <button className="phoneButton muted">I already have an account</button>
    </section>
  )
}

function ProfileScreen() {
  return (
    <section className="phoneScreen enter">
      <div className="profileHero">
        <div className="avatar">RJ</div>
        <div>
          <h3>Radheya Joshi</h3>
          <p>Applied ML Engineer</p>
        </div>
      </div>
      <ProgressRing value={72} label="Profile strength" />
      <ChipRow chips={candidateProfile.skills} />
      <div className="miniPanel">
        <strong>Looking for</strong>
        <span>ML Engineer roles, remote or hybrid, $135K-$155K</span>
      </div>
    </section>
  )
}

function ReverseScreen() {
  return (
    <section className="phoneScreen enter">
      <div className="timelineMini">
        <div className="dimmed">Candidate fills details</div>
        <div className="dimmed">Candidate becomes discoverable</div>
        <div className="dimmed">Candidate waits</div>
      </div>
      <div className="reverseArrow">
        <ArrowRight size={24} />
      </div>
      <div className="miniPanel strong">
        <Building2 size={18} />
        <strong>Recruiter → search → candidate</strong>
        <span>Recruiters search compatible candidates who already want this kind of role.</span>
      </div>
    </section>
  )
}

const onboardingStages = [
  {
    title: 'Education',
    icon: GraduationCap,
    fields: ['University', 'Degree', 'Major', 'GPA', 'Graduation year', 'Additional education'],
  },
  {
    title: 'Experience',
    icon: BriefcaseBusiness,
    fields: ['Previous companies', 'Job titles', 'Internships', 'Research positions', 'Teaching', 'Leadership'],
  },
  {
    title: 'Skills',
    icon: SlidersHorizontal,
    fields: ['Programming languages', 'Frameworks', 'Tools', 'Cloud platforms', 'Certifications', 'Professional skills'],
  },
  {
    title: 'Proof of work',
    icon: Sparkles,
    fields: ['GitHub', 'Portfolio', 'LinkedIn', 'Research papers', 'Projects', 'Awards', 'Hackathons'],
  },
]

function OnboardingScreen({ stage, setStage, onComplete }) {
  const current = onboardingStages[stage]
  const Icon = current.icon
  return (
    <section className="phoneScreen enter">
      <div className="phoneTopLine">
        <button className="iconButton" onClick={() => setStage(Math.max(0, stage - 1))} aria-label="Previous onboarding step">
          <ChevronLeft size={16} />
        </button>
        <span>{stage + 1} of {onboardingStages.length}</span>
      </div>
      <ProgressBar value={((stage + 1) / onboardingStages.length) * 100} />
      <div className="stepTitle">
        <Icon size={20} />
        <h3>{current.title}</h3>
      </div>
      <div className="fieldList">
        {current.fields.map((field, index) => (
          <label key={field}>
            <span>{field}</span>
            <input value={sampleValue(field, index)} onChange={() => {}} aria-label={field} />
          </label>
        ))}
      </div>
      {stage < onboardingStages.length - 1 ? (
        <button className="phoneButton primary" onClick={() => setStage(stage + 1)}>
          Continue
        </button>
      ) : (
        <button className="phoneButton primary" onClick={onComplete}>
          Set preferences
        </button>
      )}
    </section>
  )
}

function sampleValue(field, index) {
  const values = {
    University: 'University of Michigan',
    Degree: 'M.S. Computer Science',
    Major: 'Machine Learning Systems',
    GPA: '3.84',
    'Graduation year': '2026',
    'Additional education': 'NLP research seminar',
    'Previous companies': 'Stripe, UM NLP Lab',
    'Job titles': 'ML Platform Intern',
    Internships: '2 internships',
    'Research positions': 'NLP Lab Research Assistant',
    Teaching: 'Graduate teaching assistant',
    Leadership: 'AI club mentor',
    'Programming languages': 'Python, TypeScript',
    Frameworks: 'PyTorch, React',
    Tools: 'Docker, GitHub Actions',
    'Cloud platforms': 'AWS, GCP',
    Certifications: 'AWS ML Specialty',
    'Professional skills': 'Research communication',
    GitHub: 'github.com/avery/retrieval-agent',
    Portfolio: 'averychen.example',
    LinkedIn: 'linkedin.com/in/averychen',
    'Research papers': 'ACL workshop paper',
    Projects: 'RAG eval toolkit',
    Awards: 'MHacks finalist',
    Hackathons: '3 wins',
  }
  return values[field] || `Detail ${index + 1}`
}

function PreferenceScreen({ onPrivacy }) {
  return (
    <section className="phoneScreen enter">
      <h3>What are you looking for?</h3>
      <SelectPills title="Desired job titles" values={['Machine Learning Engineer', 'AI Product Engineer']} />
      <SelectPills title="Industries" values={['AI infrastructure', 'Developer tools', 'Healthcare AI']} />
      <SelectPills title="Company size" values={['Startup', 'Growth-stage']} />
      <SelectPills title="Work style" values={['Research + product', 'Individual contributor']} />
      <div className="sliderPanel">
        <span>Expected salary</span>
        <strong>$135K-$155K</strong>
        <input type="range" min="100" max="190" value="145" onChange={() => {}} aria-label="Expected salary" />
      </div>
      <button className="phoneButton primary" onClick={onPrivacy}>
        Privacy controls
      </button>
    </section>
  )
}

function PrivacyScreen({
  visible,
  setVisible,
  showComp,
  setShowComp,
  activelyLooking,
  setActivelyLooking,
  onRecruiter,
}) {
  return (
    <section className="phoneScreen enter">
      <div className="privacyHero">
        <Lock size={22} />
        <h3>You stay in control.</h3>
        <p>Recruiters only see what you choose to make discoverable.</p>
      </div>
      <Toggle label="Profile visible" checked={visible} onChange={setVisible} icon={visible ? Eye : EyeOff} />
      <Toggle label="Actively looking" checked={activelyLooking} onChange={setActivelyLooking} icon={Search} />
      <Toggle label="Show compensation range" checked={showComp} onChange={setShowComp} icon={SlidersHorizontal} />
      <div className="blockedPanel">
        <strong>Blocked from discovery</strong>
        <span>Current employer, specific companies, recruiting agencies, blocked industries</span>
      </div>
      <div className="discoverablePanel">
        <Check size={20} />
        <div>
          <h3>You're discoverable.</h3>
          <p>No applications required.</p>
        </div>
      </div>
      <button className="phoneButton primary" onClick={onRecruiter}>
        Switch to recruiter view
      </button>
    </section>
  )
}

function VerificationScreen() {
  return (
    <section className="phoneScreen enter">
      <div className="verifyCard">
        <ShieldCheck size={28} />
        <h3>Company verification</h3>
        <p>Our platform verifies each company before its recruiters can search candidates.</p>
      </div>
      {['Company: Nova AI', 'Website: nova-ai.example', 'Business email: Verified', 'Hiring team: Applied AI', 'Role: Machine Learning Engineer', 'Recruiter identity: Verified'].map((item) => (
        <div className="checkLine" key={item}>
          <Check size={15} />
          <span>{item}</span>
        </div>
      ))}
    </section>
  )
}

function SearchScreen({ range, setRange, onRun }) {
  return (
    <section className="phoneScreen enter">
      <h3>Describe the person you need.</h3>
      <label className="searchInput">
        <Search size={16} />
        <input value="Machine Learning Engineer" onChange={() => {}} aria-label="Role" />
      </label>
      <SelectPills title="Skills" values={defaultSearch.skills} />
      <div className="filterGrid">
        <Filter label="Experience" value="2-4 years" />
        <Filter label="Education" value="Master's preferred" />
        <Filter label="GPA" value="3.5+" />
        <Filter label="Availability" value="Within 30 days" />
        <Filter label="Research" value="Preferred" />
        <Filter label="Visa sponsorship" value="Available" />
      </div>
      <div className="sliderPanel">
        <span>Salary</span>
        <strong>${range[0]}K-${range[1]}K</strong>
        <input
          type="range"
          min="90"
          max="170"
          value={range[0]}
          onChange={(event) => setRange([Number(event.target.value), Math.max(Number(event.target.value) + 25, range[1])])}
          aria-label="Minimum salary"
        />
      </div>
      <button className="phoneButton primary" onClick={onRun}>
        Rank candidates
      </button>
    </section>
  )
}

function ResultsScreen({ ranked, isRanking, showWhy, setShowWhy, cardOffset, setCardOffset, onInvite }) {
  const current = ranked[Math.abs(cardOffset) % ranked.length]
  return (
    <section className="phoneScreen enter">
      <div className="resultsHeader">
        <div>
          <h3>47 strong matches</h3>
          <span>Ranked by two-sided fit</span>
        </div>
        {isRanking && <span className="loadingDot">Ranking</span>}
      </div>
      <div className={`candidateCard ${isRanking ? 'isRanking' : ''}`} style={{ transform: `translateX(${cardOffset * 2}px)` }}>
        <div className="cardTop">
          <div className="avatar small">{current.name.split(' ').map((part) => part[0]).join('')}</div>
          <div>
            <strong>{current.name}</strong>
            <span>{current.role}</span>
          </div>
          <b>{current.match.score}%</b>
        </div>
        <p>{current.degree}, {current.experienceYears} years experience</p>
        <ChipRow chips={current.skills.slice(0, 4)} />
        <div className="factGrid">
          <span>${current.preferredSalary[0]}K-${current.preferredSalary[1]}K</span>
          <span>{current.workModes.join(' / ')}</span>
          <span>{current.availabilityDays} days</span>
          <span>{current.location}</span>
        </div>
        <div className="cardActions">
          <button className="iconButton" onClick={() => setCardOffset(cardOffset - 1)} aria-label="Reject candidate">
            <X size={16} />
          </button>
          <button className="phoneButton compact" onClick={() => setShowWhy(!showWhy)}>
            Why this match?
          </button>
          <button className="iconButton positive" onClick={() => setCardOffset(cardOffset + 1)} aria-label="Next candidate">
            <Check size={16} />
          </button>
        </div>
      </div>
      {showWhy && <WhyPanel parts={current.match.parts} />}
      <button className="phoneButton primary" onClick={onInvite}>
        Invite Candidate
      </button>
    </section>
  )
}

function WhyPanel({ parts }) {
  return (
    <div className="whyPanel">
      {Object.entries(parts).slice(0, 6).map(([label, value]) => (
        <div key={label}>
          <span>{label}</span>
          <meter min="0" max="100" value={value} />
          <strong>{value}%</strong>
        </div>
      ))}
    </div>
  )
}

function InviteScreen({ sent, onSend, onCandidate }) {
  return (
    <section className="phoneScreen enter">
      <div className={`sentCard ${sent ? 'isSent' : ''}`}>
        {sent ? <Check size={30} /> : <Bell size={30} />}
        <h3>{sent ? 'Invite sent.' : 'Invite Radheya Joshi?'}</h3>
        <p>Nova AI can share role, salary, team, and match rationale. Messaging opens only if Radheya is interested.</p>
      </div>
      <button className="phoneButton primary" onClick={onSend}>
        Invite Candidate
      </button>
      <button className="phoneButton muted" onClick={onCandidate}>
        View candidate invitation
      </button>
    </section>
  )
}

function InvitationScreen({ candidateDecision, topCandidate, onInterested, onNotInterested }) {
  return (
    <section className="phoneScreen enter">
      <div className="notificationCard">
        <Bell size={20} />
        <strong>Nova AI wants to meet you.</strong>
        <span>Machine Learning Engineer</span>
      </div>
      <div className="offerPanel">
        <h3>Applied AI team</h3>
        <div className="factGrid">
          <span>$135K-$155K</span>
          <span>Remote</span>
          <span>94% Match</span>
          <span>Starts in 30 days</span>
        </div>
        <p>Python, PyTorch, LLMs, RAG, research background, and compensation align with your preferences.</p>
      </div>
      {candidateDecision === 'not-interested' && <p className="declined">Not interested saved. Your profile stays discoverable.</p>}
      <div className="decisionRow">
        <button className="phoneButton primary" onClick={onInterested}>
          Interested
        </button>
        <button className="phoneButton muted" onClick={onNotInterested}>
          Not interested
        </button>
      </div>
    </section>
  )
}

function MatchScreen() {
  return (
    <section className="phoneScreen enter">
      <div className="matchBurst" aria-hidden="true">
        <HeartHandshake size={54} />
      </div>
      <div className="centerMoment">
        <h3>It's a match.</h3>
        <p>Nova AI and Radheya Joshi can now communicate. Contact information and messaging are available.</p>
      </div>
      <div className="messagePreview">
        <strong>Nova AI</strong>
        <span>We loved your retrieval eval work. Are you open to a first conversation next week?</span>
      </div>
      <button className="phoneButton primary">Open conversation</button>
    </section>
  )
}

function ProgressRing({ value, label }) {
  return (
    <div className="progressRing" style={{ '--value': `${value}%` }}>
      <div>
        <strong>{value}%</strong>
        <span>{label}</span>
      </div>
    </div>
  )
}

function ProgressBar({ value }) {
  return (
    <div className="progressBar" aria-label="Profile completion progress" role="progressbar" aria-valuenow={value} aria-valuemin="0" aria-valuemax="100">
      <span style={{ width: `${value}%` }} />
    </div>
  )
}

function ChipRow({ chips }) {
  return (
    <div className="chipRow">
      {chips.map((chip) => (
        <span key={chip}>{chip}</span>
      ))}
    </div>
  )
}

function SelectPills({ title, values }) {
  return (
    <div className="selectPills">
      <strong>{title}</strong>
      <div>
        {values.map((value) => (
          <button className="pill" key={value} type="button">
            {value}
          </button>
        ))}
      </div>
    </div>
  )
}

function Toggle({ label, checked, onChange, icon: Icon }) {
  return (
    <label className="toggleLine">
      <span>
        <Icon size={16} />
        {label}
      </span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
    </label>
  )
}

function Filter({ label, value }) {
  return (
    <div className="filter">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

createRoot(document.getElementById('root')).render(<App />)
