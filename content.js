window.PORTFOLIO_CONTENT = {
  meta: {
    pageTitle: "Eric Hurchey | Software Engineer",
    description:
      "Terminal-first portfolio for Eric Hurchey, featuring current work at GAIN, active projects, and a dual terminal and GUI experience.",
    terminalTitle: "TERMINAL://ERIC_HURCHEY.SYSTEM"
  },
  profile: {
    name: "Eric Hurchey",
    role: "Software Engineer",
    subtitle: "Product-minded builder with a terminal-first portfolio",
    tagline:
      "I like turning curious ideas into useful software, then refining the experience until it feels intentional.",
    location: "New York City, NY",
    email: "eric.hurchey@gmail.com",
    linkedin: "https://linkedin.com/in/eric-hurchey/",
    github: "https://github.com/hurchey",
    resumeUrl: "https://drive.google.com/file/d/1ip9DtI4M8OZy_Fi2CZ4v8rOhmdsjaO3W/view?usp=sharing"
  },
  navigation: [
    { id: "home", label: "Home" },
    { id: "now", label: "Now" },
    { id: "about", label: "About" },
    { id: "skills", label: "Skills" },
    { id: "projects", label: "Projects" },
    { id: "experience", label: "Experience" },
    { id: "contact", label: "Contact" }
  ],
  hero: {
    eyebrow: "TERMINAL-NATIVE PORTFOLIO",
    headline: "Building software that feels sharp, useful, and a little unexpected.",
    summary:
      "This site keeps the terminal idea at the center, but the story is about what I am working on now: real-world engineering experience at GAIN and self-directed projects that push me into new domains.",
    stats: [
      { value: "Now", label: "GAIN intern" },
      { value: "6", label: "Projects tracked" },
      { value: "100+", label: "Students supported" }
    ],
    buttons: [
      { label: "View Projects", type: "section", target: "projects", primary: true },
      { label: "What Is Current", type: "section", target: "now" },
      { label: "Switch to Terminal", type: "mode", target: "terminal" },
      { label: "GitHub", type: "external", target: "https://github.com/hurchey" }
    ],
    highlights: [
      {
        title: "Current role",
        text: "I am currently a Software Engineer Intern at GAIN, learning from real product work, team collaboration, and production-minded engineering."
      },
      {
        title: "Current build",
        text: "QuantPilot is my active quant project, where I am teaching myself backtesting and strategy design by actually building the tooling."
      },
      {
        title: "Finished work",
        text: "Court Vision and Health AI Chatbot stay in the portfolio because they solve real user confusion in real time."
      }
    ],
    signal: {
      label: "Live signal",
      heading: "What is happening right now",
      body:
        "Right now I am balancing internship experience, practical side projects, and deeper technical learning rather than chasing filler projects.",
      points: [
        "Software Engineer Intern at GAIN",
        "Iterating on QuantPilot backtesting",
        "Keeping the portfolio grounded in real, recent work"
      ],
      links: [
        { label: "Visit GAIN", url: "https://thisisgain.com" },
        { label: "See GitHub", url: "https://github.com/hurchey" }
      ]
    }
  },
  now: {
    intro:
      "This section is the quick answer to what is actually going on in my life right now, instead of the usual generic portfolio summary.",
    cards: [
      {
        eyebrow: "CURRENT ROLE",
        title: "Software Engineer Intern at GAIN",
        body:
          "I am currently interning at GAIN and using the role to get stronger at real engineering work: shipping, collaborating, debugging, and seeing how product decisions turn into software.",
        list: [
          "Learning from a live engineering environment",
          "Building stronger delivery habits",
          "Sharpening communication and iteration speed"
        ],
        link: { label: "thisisgain.com", url: "https://thisisgain.com" }
      },
      {
        eyebrow: "CURRENT BUILD",
        title: "QuantPilot",
        body:
          "QuantPilot is my active learning project in the quant realm. I am focused on backtesting right now and trying to come up with my own strategy so I can test ideas before applying them to the real market.",
        list: [
          "Backtesting engine work",
          "Strategy design and evaluation",
          "Turning theory into implementation"
        ],
        link: { label: "Open repo", url: "https://github.com/hurchey/QuantPilot" }
      },
      {
        eyebrow: "RECENT FINISHES",
        title: "Projects with real user clarity in mind",
        body:
          "The portfolio is anchored by projects that explain complex situations clearly: helping basketball newcomers follow a live game and helping patients organize scheduling and location information.",
        list: [
          "Court Vision for live basketball context",
          "Health AI Chatbot for structured scheduling",
          "A portfolio that reflects current momentum instead of old filler"
        ],
        link: { label: "See projects", url: "https://github.com/hurchey?tab=repositories" }
      }
    ],
    focus: [
      "Learning from a real engineering team at GAIN",
      "Deepening quant intuition through QuantPilot",
      "Building software that explains complexity instead of adding to it"
    ]
  },
  about: {
    intro:
      "I tend to care about two things at the same time: whether the software works technically, and whether the experience makes sense to the person using it.",
    cards: [
      {
        title: "How I build",
        body:
          "I like practical software with a strong point of view. I would rather ship something focused and defensible than pile on surface-level features."
      },
      {
        title: "What I optimize for",
        body:
          "Clarity, usability, and momentum. I want someone to understand what a product is doing, why it matters, and how to use it without friction."
      },
      {
        title: "Why this portfolio is terminal-first",
        body:
          "The terminal concept still fits me. It feels more personal than a generic layout, and it lets the portfolio act like a system you can explore rather than a page you just scroll past."
      }
    ],
    values: [
      { title: "Curiosity", body: "I like learning by building things that force me to understand the domain." },
      { title: "Clarity", body: "Good software explains itself through the product experience and the code behind it." },
      { title: "Polish", body: "Small interaction details matter because they shape how serious the whole product feels." },
      { title: "Momentum", body: "I value shipping, feedback, and iteration more than sitting on ideas too long." }
    ],
    interests: [
      "Basketball and the culture around the game",
      "Violin and the discipline that comes from long-term practice",
      "Side projects that teach me a new technical lens",
      "Interfaces that make advanced ideas feel approachable"
    ]
  },
  skills: [
    {
      title: "Languages",
      items: ["JavaScript", "TypeScript", "Python", "Java", "Go", "HTML/CSS", "C"]
    },
    {
      title: "Frontend",
      items: ["React", "Next.js", "React Native", "Three.js", "Accessible UI", "Interaction design"]
    },
    {
      title: "Backend and data",
      items: ["Node.js", "Express", "FastAPI", "Flask", "PostgreSQL", "MySQL", "MongoDB"]
    },
    {
      title: "Systems and tooling",
      items: ["Git", "GitHub", "Docker", "Linux", "CI/CD", "Bash/Zsh", "Jira", "Notion"]
    }
  ],
  projects: [
    {
      title: "Court Vision",
      featured: true,
      status: "Finished",
      badge: "Chrome Extension",
      summary:
        "A Chrome Extension for people who are new to basketball. It explains what is happening in the game and lets users ask questions while the game is still going on.",
      description:
        "The goal was to reduce the confusion barrier for new fans and make live games easier to follow instead of expecting users to already know the language of basketball.",
      tech: ["JavaScript", "Chrome Extension", "Real-time UX", "Sports education"],
      bullets: [
        "Built for users who want basketball context while the game is still live.",
        "Focused on answering what is happening and why it matters in the moment.",
        "Turned a sports knowledge gap into a product and UX problem."
      ],
      link: "https://github.com/hurchey/Court-Vision"
    },
    {
      title: "QuantPilot",
      featured: true,
      status: "In Progress",
      badge: "Quant Learning Build",
      summary:
        "A current project where I am teaching myself quant ideas by building a project around them instead of only reading about them.",
      description:
        "Right now the focus is backtesting and trying to come up with my own strategy so I can measure ideas honestly before thinking about real market application.",
      tech: ["Python", "Backtesting", "Strategy research", "Market modeling"],
      bullets: [
        "Using the project as a structured way to learn quant concepts by implementation.",
        "Working through backtesting infrastructure before trusting any strategy idea.",
        "Treating the repo as both an engineering project and a learning environment."
      ],
      link: "https://github.com/hurchey/QuantPilot"
    },
    {
      title: "Health AI Chatbot",
      featured: true,
      status: "Finished",
      badge: "Terminal AI Workflow",
      summary:
        "A terminal-based project where a user talks to an AI agent that helps schedule a doctor appointment, stores the necessary information, and confirms address details with the Google Maps API.",
      description:
        "It combines conversational flow, structured data capture, and practical validation so the interaction feels helpful instead of just chat-based for its own sake.",
      tech: ["Python", "Terminal UX", "AI agent", "Google Maps API"],
      bullets: [
        "Guides users through doctor scheduling based on available times.",
        "Stores information collected during the interaction.",
        "Uses Google Maps API to confirm location details before submission."
      ],
      link: "https://github.com/hurchey/Health-AI-Chatbot"
    },
    {
      title: "Food Suggestion App (Wht's Ckin?)",
      featured: false,
      status: "In Progress",
      badge: "AI + Mobile",
      summary:
        "A cross-platform food suggestion app that identifies food from user photos and suggests recipes around calorie goals or budget constraints.",
      description:
        "This project leans into computer vision, recommendation logic, and mobile product thinking. The goal is to make meal planning feel more dynamic and useful from a single photo.",
      tech: ["Python", "JavaScript", "TypeScript", "React Native", "React.js", "Hugging Face", "MySQL"],
      bullets: [
        "Built a React Native experience for recognizing food and suggesting recipes.",
        "Integrated Hugging Face datasets for ingredient recognition from images.",
        "Created recommendation logic around user goals like calories and budget."
      ],
      link: "https://github.com/hurchey/Food-Snap-App"
    },
    {
      title: "Website Cloning",
      featured: false,
      status: "Prototype",
      badge: "LLM + Web",
      summary:
        "An AI-driven website cloner that turns a public URL into a cleaner, component-oriented HTML and CSS codebase.",
      description:
        "This project pushed me deeper into scraping, DOM analysis, and using an LLM to translate messy source structure into something more reusable.",
      tech: ["Python", "TypeScript", "Next.js", "FastAPI", "Gemini LLM", "Hyperbrowser"],
      bullets: [
        "Built an AI website cloner aimed at reducing rebuild time from hours to minutes.",
        "Captured DOM, CSS, and assets before translating them into cleaner output.",
        "Used the project to learn more about generative AI and prompt design in practice."
      ],
      link: "https://github.com/hurchey/Website-Cloner"
    },
    {
      title: "Warehouse Robot",
      featured: false,
      status: "Finished",
      badge: "Robotics and Automation",
      summary:
        "A simulation and control stack for warehouse robot navigation, perception, picking, and real-time inventory updates.",
      description:
        "The project was built to mirror practical warehouse automation flows, combining robotics logic with operational visibility in a dashboard.",
      tech: ["Python", "ROS", "OpenCV", "MQTT", "React"],
      bullets: [
        "Built path planning, obstacle avoidance, and task queue logic.",
        "Used OpenCV-based perception for shelf and slot awareness.",
        "Connected robot events to an inventory dashboard for live updates."
      ],
      link: "https://github.com/hurchey/Warehouse-Robot"
    }
  ],
  experience: [
    {
      title: "Software Engineer Intern",
      company: "GAIN",
      companyUrl: "https://thisisgain.com",
      location: "Remote",
      dates: "Current",
      summary:
        "Currently contributing as a software engineer intern while learning how product teams review, ship, and iterate on real software.",
      bullets: [
        "Using the internship to sharpen engineering judgment in a live team environment.",
        "Building stronger habits around implementation quality, communication, and iteration.",
        "Treating the role as a practical step from projects into production-minded engineering."
      ],
      tech: ["Product engineering", "Collaboration", "Iteration", "Software delivery"]
    },
    {
      title: "Software Engineer Intern",
      company: "myGenius",
      location: "Remote",
      dates: "Jan 2025 - May 2025",
      summary:
        "Worked on an AI-powered testing platform that turned academic PDFs into adaptive sample tests with NLP and machine learning.",
      bullets: [
        "Engineered product features around PDF-to-test workflows and adaptive learning flows.",
        "Partnered with backend work that improved data integrity and real-time updates.",
        "Built parsing and preview improvements that made test creation more usable for students and instructors."
      ],
      tech: ["React", "TypeScript", "NLP", "Machine Learning"]
    },
    {
      title: "Level II ITS Technician",
      company: "Brandeis ITS Help Desk",
      location: "Waltham, MA",
      dates: "Aug 2023 - May 2025",
      summary:
        "Handled technical issues across Linux, macOS, and Windows while improving intake, triage, and handoff quality for a high-volume support environment.",
      bullets: [
        "Improved first response on 250+ tickets by tightening intake and routing.",
        "Documented clearer triage workflows and mentored other technicians.",
        "Built stronger debugging instincts by working across a wide range of environments."
      ],
      tech: ["Linux", "macOS", "Windows", "Troubleshooting"]
    },
    {
      title: "Teaching Assistant",
      company: "Brandeis University",
      location: "Waltham, MA",
      dates: "Mar 2023 - Jan 2024",
      summary:
        "Supported students in Python and discrete math while learning how to explain technical ideas with patience and precision.",
      bullets: [
        "Guided 100+ students through core CS concepts.",
        "Led recitations and reinforced problem-solving habits.",
        "Turned teaching into a communication skill that carries directly into engineering work."
      ],
      tech: ["Python", "Mentorship", "Technical communication"]
    },
    {
      title: "Software Engineer Intern",
      company: "Peachy",
      location: "Remote, NY",
      dates: "May 2023 - Sep 2023",
      summary:
        "Worked on product-facing features and automation that improved merchant workflows and shopper experience.",
      bullets: [
        "Built dynamic filtering and interactive user feedback features.",
        "Automated migration workflows for Shopify merchants and reduced timelines.",
        "Learned how product details and developer efficiency connect in e-commerce systems."
      ],
      tech: ["React", "Shopify", "Node.js", "APIs"]
    },
    {
      title: "Software Engineer",
      company: "Branda",
      location: "Waltham, MA",
      dates: "Sep 2022 - May 2023",
      summary:
        "Maintained and improved a student-run mobile product, working on both the React Native front end and supporting backend services.",
      bullets: [
        "Refactored mobile UI and navigation for better usability.",
        "Built backend APIs and data models with validation and indexed queries.",
        "Worked in a setting where engineering decisions had visible campus-facing impact."
      ],
      tech: ["React Native", "Node.js", "MongoDB", "Express"]
    }
  ],
  contact: {
    intro:
      "If you want to talk about internships, projects, product ideas, or anything adjacent to software and learning, reach out.",
    methods: [
      {
        label: "Email",
        value: "eric.hurchey@gmail.com",
        href: "mailto:eric.hurchey@gmail.com"
      },
      {
        label: "LinkedIn",
        value: "linkedin.com/in/eric-hurchey/",
        href: "https://linkedin.com/in/eric-hurchey/"
      },
      {
        label: "GitHub",
        value: "github.com/hurchey",
        href: "https://github.com/hurchey"
      },
      {
        label: "Current company",
        value: "thisisgain.com",
        href: "https://thisisgain.com"
      }
    ]
  },
  quantSite: {
    title: "Quant Lab | Eric Hurchey",
    description:
      "Quant-themed portfolio subsite for Eric Hurchey, centered on systematic thinking, backtesting, and research-driven engineering.",
    navigation: [
      { id: "overview", label: "Overview" },
      { id: "research", label: "Research" },
      { id: "projects", label: "Trade Book" },
      { id: "experience", label: "Track Record" },
      { id: "contact", label: "Contact" }
    ],
    hero: {
      eyebrow: "SYSTEMATIC RESEARCH PROFILE",
      headline: "ERIC HURCHEY / QUANT LAB",
      summary:
        "QuantPilot is the center of gravity here: backtesting, strategy design, disciplined iteration, and the engineering habits behind systematic work.",
      tape: ["RESEARCH", "RISK", "EXECUTION", "BACKTESTING", "SIGNALS", "EDGE", "SYSTEMATIC", "ITERATION"],
      metrics: [
        { label: "Current stream", value: "QuantPilot" },
        { label: "Desk status", value: "Research mode" },
        { label: "Current role", value: "GAIN" },
        { label: "Bias", value: "Systematic" }
      ],
      notes: [
        "No fake PnL. I care more about process quality than invented performance numbers.",
        "QuantPilot is my current vehicle for learning backtesting and strategy design by implementation.",
        "The rest of the portfolio matters here too because pattern recognition and clear systems thinking carry over."
      ]
    },
    research: [
      {
        title: "Research posture",
        body:
          "I like learning through systems that force accountability. If an idea cannot survive implementation and testing, I do not treat it as understanding."
      },
      {
        title: "Risk lens",
        body:
          "I am more interested in reducing false confidence than pretending to have an edge early. That means slower iteration, cleaner instrumentation, and honest review."
      },
      {
        title: "Current objective",
        body:
          "Build stronger intuition for quant thinking through QuantPilot while keeping product and engineering execution sharp through real-world work at GAIN."
      }
    ],
    process: [
      "Hypothesis before implementation",
      "Backtesting before confidence",
      "Measurement before storytelling",
      "Iteration before ego"
    ],
    focusBoard: [
      { label: "Primary build", value: "QuantPilot backtesting engine" },
      { label: "Secondary edge", value: "Product-minded engineering" },
      { label: "Learning mode", value: "Theory into implementation" },
      { label: "Constraint", value: "Honest process over fake returns" }
    ],
    contactLine:
      "If you want to talk about quant learning, systematic research habits, product-minded engineering, or internships, reach out."
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
        { label: "Court Vision", command: "cat ~/projects/court-vision.md" },
        { label: "QuantPilot", command: "cat ~/projects/quantpilot.md" },
        { label: "Health AI Chatbot", command: "cat ~/projects/health-ai-chatbot.md" },
        { label: "Food Suggestion App", command: "cat ~/projects/food-suggestion-app-wht-s-ckin.md" },
        { label: "Website Cloning", command: "cat ~/projects/website-cloning.md" },
        { label: "Warehouse Robot", command: "cat ~/projects/warehouse-robot.md" },
        { label: "All current projects", command: "cat ~/projects/README.md" }
      ]
    },
    {
      label: "Skills + Experience",
      items: [
        { label: "Tech stack", command: "cat ~/skills/summary.txt" },
        { label: "Experience", command: "cat ~/experience/current.txt" },
        { label: "Contact", command: "cat ~/contact.txt" },
        { label: "Download resume", command: "download resume" }
      ]
    },
    {
      label: "Modes + Extras",
      items: [
        { label: "Visual mode", command: "gui" },
        { label: "Quant Lab", command: "quant" },
        { label: "Hack mode", command: "hack" },
        { label: "Matrix", command: "matrix" },
        { label: "Linsanity", command: "linsanity" },
        { label: "Clear", command: "clear" }
      ]
    }
  ],
  terminal: {
    username: "visitor",
    promptHint: "Press Tab for quick commands or type ? for help",
    homeDirectory: "/home/eric"
  }
};
