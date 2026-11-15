/*
 * Central portfolio content configuration for Eric Hurchey (hurchey.github.io).
 * Consumed by both the interactive terminal view and the simple HTML view.
 *
 * Image Swap Guide:
 * - Drop screenshots or photos into `images/` (e.g. `images/headshot.jpg` or `images/projects/sidepot.jpg`).
 * - Set the corresponding `src` field below. Slots with `src: ""` are hidden on the simple view.
 */
window.PORTFOLIO_CONTENT = {
  meta: {
    pageTitle: "Eric Hurchey | Founding Software Engineer",
    description:
      "Portfolio of Eric Hurchey — Founding Software Engineer at Theron and Co-Founder & CMO at Kairo, building robotics autonomy software, grounded AI products, and full-stack systems.",
    terminalTitle: "TERMINAL://ERIC_HURCHEY.SYSTEM"
  },

  profile: {
    name: "Eric Hurchey",
    role: "Founding Software Engineer",
    subtitle: "Founding Software Engineer at Theron · Co-Founder & CMO at Kairo",
    tagline:
      "I build robotic autonomy software, grounded AI products, and end-to-end web systems from zero to one.",
    location: "San Francisco, CA & New York, NY",
    phone: "(718) 825-5226",
    email: "eric.hurchey@gmail.com",
    linkedin: "https://linkedin.com/in/eric-hurchey",
    github: "https://github.com/hurchey",
    website: "https://hurchey.github.io",
    resumeUrl: "Eric_Hurchey_Resume.pdf"
  },

  education: [
    {
      school: "Brandeis University",
      degree: "Bachelor of Science in Computer Science, Minor in Mathematics",
      honors: "Dean's List",
      location: "Waltham, MA",
      dates: "Sep 2021 – May 2025",
      bullets: [
        "Graduated on the Dean's List with a B.S. in Computer Science and a Minor in Mathematics.",
        "Served as an undergraduate Teaching Assistant guiding 100+ students through Python and discrete mathematics.",
        "Worked as a Level II ITS Help Desk Technician and campus app engineer, shipping student-facing software and debugging Linux, macOS, and Windows environments."
      ]
    }
  ],

  now: {
    intro:
      "What I am actively building and shipping right now across defense robotics, applied AI, and live beta software.",
    cards: [
      {
        eyebrow: "FOUNDING TEAM",
        title: "Founding Software Engineer at Theron",
        body:
          "Part of the founding team at Theron in San Francisco—developing autonomy software that turns lidar and camera perception into precise motor commands for a two-axis robotic tracking system on an NVIDIA Jetson.",
        list: [
          "Lidar and camera perception-to-control pipeline on NVIDIA Jetson",
          "Authored design docs and architecture diagrams to align the engineering team",
          "Drove full-codebase redesign from initial proposal through rollout"
        ],
        link: { label: "therondefense.com", url: "https://therondefense.com/" }
      },
      {
        eyebrow: "CO-FOUNDING",
        title: "Co-Founding Kairo (heykairo.app)",
        body:
          "Co-founded an AI career advisor that plans a user's career arc and generates resumes, cover letters, and outreach emails grounded in their actual history—owning growth and distribution while shipping product fixes.",
        list: [
          "Tightened the generation pipeline to reduce LLM hallucinations",
          "Shipped onboarding and UX improvements across the live web app",
          "Recruited 10+ beta testers and fed user feedback directly into the roadmap"
        ],
        link: { label: "heykairo.app", url: "https://heykairo.app/" }
      },
      {
        eyebrow: "LIVE PRIVATE BETA",
        title: "SidePot Live Private Beta (playsidepots.com)",
        body:
          "Operating a live private beta for a social prediction-market platform built end to end with a parimutuel pricing engine and a concurrency-safe append-only settlement ledger.",
        list: [
          "Implied odds from live pools with pro-rata largest-remainder point allocation",
          "Append-only PostgreSQL ledger running at SERIALIZABLE isolation with retry",
          "Validating pricing behavior and settlement accuracy with an initial user group"
        ],
        link: { label: "playsidepots.com", url: "https://playsidepots.com/" }
      }
    ],
    focus: [
      "Shipping real-time perception and motor-control autonomy on NVIDIA Jetson at Theron",
      "Growing Kairo (heykairo.app) while keeping AI-generated career artifacts strictly grounded",
      "Validating parimutuel market pricing and ledger invariants in SidePot's private beta",
      "Designing clear system architectures before scaling implementation"
    ]
  },

  about: {
    intro:
      "I am a software engineer working across robotics autonomy, applied AI, and full-stack product engineering. Whether I am translating lidar and camera streams into motor commands on an NVIDIA Jetson at Theron, tightening LLM generation pipelines at Kairo, or designing SERIALIZABLE settlement ledgers for SidePot, I care equally about rigorous systems engineering and products that feel effortless to use.",
    cards: [
      {
        title: "Edge hardware to full-stack web",
        body:
          "I enjoy working across the stack—from sensor perception, motor control, and systems architecture on embedded Linux to React/Next.js interfaces and PostgreSQL backends."
      },
      {
        title: "Zero-to-one startup execution",
        body:
          "I thrive in early-stage teams where speed and reliability both matter: leading architecture migrations, running live hardware-software investor demos, and iterating directly with beta users."
      },
      {
        title: "Verifiable, grounded systems",
        body:
          "Whether constraining an LLM to a user's real career history or enforcing exact point conservation in a settlement engine with unit tests, I build software whose behavior you can verify."
      }
    ],
    values: [
      {
        title: "Correctness",
        body:
          "Good abstractions make invariants explicit—across physical control loops, database transactions, and AI pipelines."
      },
      {
        title: "Clarity",
        body:
          "Clear design docs, architecture diagrams, and intuitive interfaces keep both teams and users aligned."
      },
      {
        title: "Ownership",
        body:
          "I like taking problems end to end: scoping the design, shipping the code, talking to users, and owning outcomes."
      },
      {
        title: "Momentum",
        body:
          "Shipping working software early creates honest feedback loops that beat speculation every time."
      }
    ],
    interests: [
      "Basketball — New York Knicks & Golden State Warriors fan (Linsanity forever)",
      "Classical violin — 14+ years of training, ensemble performance, and disciplined practice",
      "Robotics & systems — software that senses and acts in the physical world",
      "Building zero-to-one products and testing ideas with real users"
    ]
  },

  skills: [
    {
      title: "Languages",
      items: ["TypeScript", "JavaScript", "Python", "Java", "Go", "C", "SQL", "HTML/CSS"]
    },
    {
      title: "Frameworks",
      items: ["React", "Next.js", "Node.js/Express", "Vue", "FastAPI", "Flask", "NumPy", "Pandas"]
    },
    {
      title: "Data & Infrastructure",
      items: [
        "PostgreSQL",
        "MySQL",
        "MongoDB",
        "AWS S3",
        "Docker",
        "GitHub Actions",
        "CI/CD",
        "Linux/Unix",
        "OAuth/JWT"
      ]
    },
    {
      title: "Tools",
      items: ["Git/GitHub", "Jira", "Notion", "VS Code", "Bash/Zsh"]
    }
  ],

  projects: [
    {
      title: "SidePot",
      featured: true,
      status: "Private Beta",
      badge: "Social Prediction Markets",
      summary:
        "An end-to-end social prediction-market platform where users forecast outcomes backed by a parimutuel pricing engine and a concurrency-safe point ledger. Live in private beta with an initial user group.",
      description:
        "Built from the ground up across product UI, pricing math, database isolation, and deployment. Implied odds update dynamically from pool composition, largest-remainder allocation guarantees exact point conservation at settlement, and every balance change executes against an append-only PostgreSQL ledger at SERIALIZABLE isolation with automatic retry.",
      tech: ["Next.js", "TypeScript", "PostgreSQL"],
      bullets: [
        "Built a social prediction-market platform end to end: product, pricing engine, settlement ledger, and deployment; live in private beta with an initial user group validating pricing behavior and settlement accuracy.",
        "Designed the parimutuel pricing and settlement engine: derives implied odds from live pool composition and pays winners pro-rata via largest-remainder allocation so every settlement conserves points exactly; enforced by unit tests.",
        "Built the point economy as an append-only ledger: balances derived at read time; every balance-changing transaction runs at SERIALIZABLE isolation with automatic retry, keeping the books consistent under concurrent writes."
      ],
      link: "https://playsidepots.com/",
      linkLabel: "Visit playsidepots.com",
      image: {
        // Set `src: "images/projects/sidepot.jpg"` once screenshot is added
        src: "",
        alt: "SidePot social prediction market interface and live implied odds view",
        placeholderTitle: "SidePot — Live Pool & Settlement Engine",
        caption:
          "Parimutuel prediction markets & SERIALIZABLE ledger — swap screenshot at images/projects/sidepot.jpg",
        suggestedPath: "images/projects/sidepot.jpg"
      }
    },
    {
      title: "AI Health ChatBot",
      featured: true,
      status: "Finished",
      badge: "Conversational AI & Intake",
      summary:
        "A conversational patient-intake system that converts unstructured natural-language responses into validated, structured patient records ready for scheduling.",
      description:
        "Combines an OpenAI-driven dialogue state pipeline with Google address validation to resolve ambiguous inputs, enforce required record formatting, and verify locations prior to appointment booking—benchmarked across an automated 50-case synthetic test suite.",
      tech: ["Python", "OpenAI API", "Google API"],
      bullets: [
        "Built a conversational intake system that converts unstructured responses into structured patient records; 95%+ required-field completion across a 50-case synthetic suite run by an automated end-to-end harness.",
        "Engineered the LLM interaction pipeline (OpenAI API) to control question flow, resolve ambiguous inputs, and enforce required-field formatting, cutting manual data-cleaning from 4 steps to 1.",
        "Integrated Google address validation to verify location inputs before scheduling, reducing downstream booking errors."
      ],
      link: "https://github.com/hurchey/Health-AI-Chatbot",
      linkLabel: "View on GitHub",
      image: {
        // Set `src: "images/projects/ai-health-chatbot.jpg"` once screenshot is added
        src: "",
        alt: "AI Health ChatBot conversational patient intake and structured output",
        placeholderTitle: "AI Health ChatBot — Structured Patient Intake",
        caption:
          "95%+ field completion across 50-case E2E suite — swap screenshot at images/projects/ai-health-chatbot.jpg",
        suggestedPath: "images/projects/ai-health-chatbot.jpg"
      }
    },
    {
      title: "AI Website Cloner",
      featured: true,
      status: "Finished",
      badge: "Full-Stack LLM Pipeline",
      summary:
        "A full-stack replication pipeline that extracts DOM hierarchy, CSS, and assets from live URLs and reconstructs them into clean, reusable frontend code.",
      description:
        "Pairs browser extraction via Hyperbrowser with a multi-step Gemini API synthesis pipeline to preserve semantic HTML structure even on noisy source pages, backed by a Node.js/Express and GitHub Actions CI validation layer to catch structural and cross-browser regressions.",
      tech: ["Next.js", "TypeScript", "Python", "FastAPI", "Gemini API", "Hyperbrowser", "GitHub Actions"],
      bullets: [
        "Built a full-stack pipeline that converts live websites into reusable frontend code by extracting DOM hierarchy, CSS, and assets; validated across 15+ real pages with side-by-side visual review.",
        "Engineered a multi-step replication workflow (Hyperbrowser and Gemini APIs) that preserves semantic structure and handles noisy or inconsistent source HTML.",
        "Wired GitHub Actions CI with a Node.js/Express validation layer to run structural regression checks and catch cross-browser rendering divergences on every build."
      ],
      link: "https://github.com/hurchey/Website-Cloner",
      linkLabel: "View on GitHub",
      image: {
        // Set `src: "images/projects/ai-website-cloner.jpg"` once screenshot is added
        src: "",
        alt: "AI Website Cloner side-by-side comparison of live webpage and generated frontend code",
        placeholderTitle: "AI Website Cloner — DOM-to-Code Pipeline",
        caption:
          "Validated across 15+ live pages with CI regression checks — swap screenshot at images/projects/ai-website-cloner.jpg",
        suggestedPath: "images/projects/ai-website-cloner.jpg"
      }
    },
    {
      title: "Court Vision",
      featured: false,
      status: "Finished",
      badge: "Chrome Extension",
      summary:
        "A Chrome Extension for basketball newcomers that explains live game action in real time and answers questions while the broadcast is playing.",
      description:
        "Built to lower the learning curve for new basketball fans by translating live plays, terminology, and strategy into plain-English context right alongside a live game.",
      tech: ["JavaScript", "Chrome Extension", "Real-Time UX", "HTML/CSS"],
      bullets: [
        "Built for viewers who want real-time basketball context without leaving a live broadcast.",
        "Focused on explaining plays, rules, and why moments matter as they happen.",
        "Turned a sports onboarding gap into a clean browser-extension experience."
      ],
      link: "https://github.com/hurchey/Court-Vision",
      linkLabel: "View on GitHub",
      image: {
        // Set `src: "images/projects/court-vision.jpg"` once screenshot is added
        src: "",
        alt: "Court Vision Chrome Extension explaining a live basketball broadcast",
        placeholderTitle: "Court Vision — Live Basketball Companion",
        caption:
          "Real-time basketball Q&A Chrome Extension — swap screenshot at images/projects/court-vision.jpg",
        suggestedPath: "images/projects/court-vision.jpg"
      }
    }
  ],

  experience: [
    {
      title: "Founding Software Engineer",
      company: "Theron",
      companyUrl: "https://therondefense.com/",
      location: "San Francisco, CA",
      dates: "Oct 2026 – Present",
      summary:
        "Member of the founding team at an early-stage defense robotics startup developing edge perception-to-control autonomy software and leading full-codebase architecture redesigns.",
      bullets: [
        "Developed autonomy software for a two-axis robotic tracking system, turning lidar and camera perception into precise motor commands on an NVIDIA Jetson.",
        "Drove the redesign from proposal to rollout on the founding engineering team, authoring design docs and architecture diagrams to align the team before migrating the full codebase."
      ],
      tech: ["Robotics Autonomy", "NVIDIA Jetson", "Lidar & Camera Perception", "Motor Control", "Systems Architecture"]
    },
    {
      title: "Co-Founder & CMO",
      company: "Kairo",
      companyUrl: "https://heykairo.app/",
      location: "New York, NY",
      dates: "Sep 2026 – Present",
      summary:
        "Co-founded an AI career advisor (heykairo.app) that plans career arcs and generates grounded application artifacts, owning growth and distribution while shipping product engineering fixes.",
      bullets: [
        "Co-founded an AI career advisor that plans a user's career arc and generates resumes, cover letters, and outreach emails to match; own growth and distribution while shipping product fixes.",
        "Reduced hallucinations in the site's AI by tightening the generation pipeline so career plans and written artifacts stay grounded in the user's actual history.",
        "Fixed user-experience and quality-of-life bugs across the web app to smooth onboarding and day-to-day use for beta users.",
        "Recruited 10+ beta testers through direct outreach and early distribution channels; feeding their feedback back into the product roadmap."
      ],
      tech: ["LLM Pipelines", "Prompt Grounding", "Full-Stack Web", "Growth & Distribution", "Product Engineering"]
    },
    {
      title: "Software Engineer Intern",
      company: "GAIN",
      companyUrl: "https://thisisgain.com",
      location: "Hybrid, NY",
      dates: "Mar 2026 – Apr 2026",
      summary:
        "Built React/TypeScript marketing analytics dashboards, ad-platform connection flows, and rapid investor-demo prototypes unifying Google, Meta, and TikTok campaign data.",
      bullets: [
        "Built the frontend and landing pages (React/TypeScript) for a performance-marketing analytics product that unifies Google, Meta, and TikTok ad data into a single view of campaign performance.",
        "Shipped 3 investor-demo prototypes in two months; 2 advanced to the product roadmap and cut the feature review cycle by one sprint.",
        "Built the analytics dashboard: performance charts, side-by-side campaign comparisons, and account-connection flows for all 3 ad platforms."
      ],
      tech: ["React", "TypeScript", "Analytics Dashboards", "Ad Platform APIs", "Rapid Prototyping"]
    },
    {
      title: "Forward Deployed Software Engineer Intern",
      company: "GenPulse",
      companyUrl: "",
      location: "New York, NY",
      dates: "Aug 2025 – Oct 2025",
      summary:
        "Built and ran live software-and-hardware product demos (Vue frontend, backend API integrations, and scalp-scanning device) for investor pitches and stakeholder meetings at a Series C startup.",
      bullets: [
        "Built the product demo (Vue UI and backend API integrations) used in 10+ investor pitches at a Series C startup; shipped fixes between meetings to keep it demo-ready at all times.",
        "Ran 20+ live demos of a scalp-scanning hardware device and companion app for investors and stakeholders.",
        "Selected for a VC cohort winter sprint during which the firm secured multiple five-figure contracts and follow-on funding."
      ],
      tech: ["Vue", "Backend APIs", "Hardware Demos", "Forward-Deployed Engineering"]
    }
  ],

  contact: {
    intro:
      "Reach out anytime to talk about robotics and autonomy, applied AI, full-stack engineering, or early-stage product building.",
    methods: [
      {
        label: "Email",
        value: "eric.hurchey@gmail.com",
        href: "mailto:eric.hurchey@gmail.com"
      },
      {
        label: "Phone",
        value: "(718) 825-5226",
        href: "tel:+17188255226"
      },
      {
        label: "LinkedIn",
        value: "linkedin.com/in/eric-hurchey",
        href: "https://linkedin.com/in/eric-hurchey"
      },
      {
        label: "GitHub",
        value: "github.com/hurchey",
        href: "https://github.com/hurchey"
      },
      {
        label: "Theron",
        value: "therondefense.com",
        href: "https://therondefense.com/"
      },
      {
        label: "Kairo",
        value: "heykairo.app",
        href: "https://heykairo.app/"
      }
    ]
  },

  /*
   * Classic / 2014-style HTML view photo & banner slots.
   * Slots with `src: ""` are hidden until a real image file is placed under `images/`.
   */
  simpleSite: {
    banner: {
      src: "images/header-banner.jpg",
      alt: "Manhattan skyline with the Empire State Building",
      placeholderTitle: "New York City",
      caption: "The Manhattan skyline, New York City.",
      suggestedPath: "images/header-banner.jpg"
    },
    avatar: {
      src: "images/headshot.jpg",
      alt: "Eric Hurchey headshot",
      placeholderTitle: "Headshot",
      suggestedPath: "images/headshot.jpg"
    },
    introPhoto: {
      // Drop a workspace or hardware bench photo at `images/workspace.jpg` and set `src: "images/workspace.jpg"`
      src: "",
      alt: "Eric Hurchey working snapshot",
      placeholderTitle: "Featured Snapshot Photo",
      caption: "Hardware bench / workspace snapshot.",
      suggestedPath: "images/workspace.jpg"
    },
    photos: [
      {
        src: "images/robotics-bench.jpg",
        alt: "Hardware bench with an NVIDIA Jetson board, a monitor showing the NVIDIA logo, and a laptop",
        placeholderTitle: "Robotics & Hardware Testing",
        caption: "Bringing up an NVIDIA Jetson on the hardware bench.",
        suggestedPath: "images/robotics-bench.jpg"
      },
      {
        src: "images/san-francisco.jpg",
        alt: "Downtown San Francisco at dusk with Market Street lit up and the Bay Bridge behind",
        placeholderTitle: "San Francisco",
        caption: "Downtown San Francisco and the Bay Bridge at dusk.",
        suggestedPath: "images/san-francisco.jpg"
      },
      {
        src: "images/basketball.jpg",
        alt: "Eric in mid-air taking a jump shot in a gym, with the basketball in flight",
        placeholderTitle: "Basketball",
        caption: "Getting shots up in the gym.",
        suggestedPath: "images/basketball.jpg",
        // Optional frame shape for the simple view: "photo" (4:3, default) or "square"
        shape: "square"
      }
    ]
  },

  quickCommands: [
    {
      label: "About + Now",
      items: [
        { label: "Biography", command: "cat ~/about/bio.txt" },
        { label: "Current snapshot", command: "cat ~/now/current.md" },
        { label: "Current focus", command: "cat ~/now/focus.txt" },
        { label: "Interests", command: "cat ~/about/interests.txt" }
      ]
    },
    {
      label: "Projects",
      items: [
        { label: "SidePot", command: "cat ~/projects/sidepot.md" },
        { label: "AI Health ChatBot", command: "cat ~/projects/ai-health-chatbot.md" },
        { label: "AI Website Cloner", command: "cat ~/projects/ai-website-cloner.md" },
        { label: "Court Vision", command: "cat ~/projects/court-vision.md" },
        { label: "All current projects", command: "cat ~/projects/README.md" }
      ]
    },
    {
      label: "Skills + Experience",
      items: [
        { label: "Experience", command: "cat ~/experience/current.txt" },
        { label: "Education", command: "cat ~/education/summary.txt" },
        { label: "Tech stack", command: "cat ~/skills/summary.txt" },
        { label: "Contact", command: "cat ~/contact.txt" },
        { label: "Download resume", command: "download resume" }
      ]
    },
    {
      label: "Extras",
      items: [
        { label: "Simple HTML site", command: "gui" },
        { label: "Hack mode", command: "hack" },
        { label: "Autonomy lab", command: "robotics" },
        { label: "Matrix", command: "matrix" },
        { label: "Linsanity", command: "linsanity" },
        { label: "Clear", command: "clear" }
      ]
    }
  ],

  terminal: {
    username: "visitor",
    promptHint: "Press Tab for quick commands or type ? for help",
    homeDirectory: "/home/eric",
    welcomeSignal: "Current signal: Founding Software Engineer at Theron · Co-Founder at Kairo."
  }
};
