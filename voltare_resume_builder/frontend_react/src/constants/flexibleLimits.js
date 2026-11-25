/**
 * Configuration, limits, and sample data for Mode 2: Voltare Flexible Resume Builder.
 * 
 * Rules:
 * 1. Personal Details: Mandatory
 * 2. Professional Summary: Mandatory (minimum threshold 150 characters)
 * 3. Education: 2 mandatory, 1 optional (total max 3)
 * 4. Projects: 1 mandatory, up to 3 total allowed (1 mandatory + max 2 optional)
 * 5. Skills: Modular / categorized matrix
 * 6. Professional Experience: 100% Optional (0 to 3 entries)
 * 7. Page Budget: Single A4 page auto-scaling
 */

export const FLEXIBLE_LIMITS = {
  summaryMinChars: 150,
  summaryMaxChars: 600,
  maxEducation: 3,
  minEducation: 3,
  maxProjects: 3,
  minProjects: 1,
  maxExperience: 3,
  minExperience: 0, // Freshers can have 0
  pageBudgetPoints: 792, // Single A4 usable vertical points
};

export const SAMPLE_FLEXIBLE_DATA = {
  personal: {
    first_name: "Aakash",
    last_name: "Sharma",
    email: "aakash.sharma@email.com",
    phone: "+91 98765 43210",
    city_state: "Bengaluru, Karnataka",
    linkedin: "linkedin.com/in/aakash-sharma",
    portfolio: "github.com/aakash-sharma"
  },
  summary: "Driven and detail-oriented Software Engineer with a strong foundation in modern full-stack development, distributed backend architecture, and cloud deployment. Demonstrated expertise in building production-ready RESTful APIs, high-performance web applications, and database optimizations. Passionate about writing clean, maintainable code and solving complex technical challenges in agile engineering teams.",
  skills: {
    languages: "Python, JavaScript, TypeScript, SQL, C++",
    frameworks: "React.js, Node.js, FastAPI, Express.js, Vite",
    tools_cloud: "Docker, Git, PostgreSQL, Redis, AWS (S3, EC2)",
    concepts: "REST APIs, Microservices, Data Structures, System Design"
  },
  education: [
    {
      institution: "National Institute of Technology",
      location: "Surathkal, India",
      degree: "B.Tech in Computer Science and Engineering",
      grad_date: "2020 – 2024",
      gpa: "CGPA: 8.9 / 10",
      highlights: "Relevant Coursework: Distributed Systems, Database Management, Algorithms"
    },
    {
      institution: "Delhi Public School",
      location: "Bengaluru, India",
      degree: "Higher Secondary Certificate (CBSE Class XII - Science)",
      grad_date: "2018 – 2020",
      gpa: "Score: 95.4%",
      highlights: "School Topper in Computer Science and Mathematics"
    },
    {
      institution: "National Public School",
      location: "Bengaluru, India",
      degree: "Secondary School Certificate (CBSE Class X)",
      grad_date: "2018",
      gpa: "Score: 96.2%",
      highlights: "Merit Certificate in Science & Mathematics"
    }
  ],
  projects: [
    {
      title: "Distributed Task Scheduler & Execution Engine",
      tech_stack: "Python, FastAPI, Redis, Docker, PostgreSQL",
      role_or_org: "Personal Project",
      date_range: "Jan 2024 – Apr 2024",
      bullet_1: "Architected a scalable distributed background task runner using Redis pub/sub and asynchronous worker pools, handling 5,000+ jobs/min with <50ms latency.",
      bullet_2: "Designed fault-tolerant retry strategies with exponential backoff and persistent job state tracking, reducing failed task rate by 40%.",
      link: "github.com/aakash-sharma/task-runner"
    },
    {
      title: "Real-Time Collaborative Code Editor",
      tech_stack: "React, WebSockets, Node.js, Monaco Editor",
      role_or_org: "Academic Capstone Project",
      date_range: "Aug 2023 – Dec 2023",
      bullet_1: "Engineered real-time document synchronization utilizing Operational Transformation (OT) over WebSockets for multi-user concurrent editing.",
      bullet_2: "Integrated syntax highlighting and remote code execution sandboxes, supporting simultaneous execution for 5 popular programming languages.",
      link: "github.com/aakash-sharma/collab-code"
    }
  ],
  // Professional Experience is totally optional: freshers can leave this empty!
  experience: [
    {
      company: "InnovateTech Labs",
      role: "Software Engineering Intern",
      location: "Bengaluru, India",
      start_date: "May 2023",
      end_date: "Jul 2023",
      bullet_1: "Developed and deployed 8 RESTful microservice endpoints in FastAPI, improving response speeds by 28% for analytics queries.",
      bullet_2: "Implemented automated CI/CD pipelines via GitHub Actions and wrote unit test suites increasing test coverage from 62% to 88%."
    }
  ],
  certifications: "AWS Certified Cloud Practitioner, HackerRank Problem Solving (Gold Badge)",
  custom_section: {
    title: "Leadership & Community Initiatives",
    subhead_1: {
      title: "Lead Organizer, National Tech Symposium",
      subtitle_or_date: "2023 – 2024",
      bullet_1: "Spearheaded planning and execution for an inter-college symposium hosting 1,200+ attendees and 18 technical challenges.",
      bullet_2: "Coordinated corporate outreach, securing industry partnerships and workshop sponsorships."
    },
    subhead_2: {
      title: "Core Member, Open Source Student Society",
      subtitle_or_date: "2022 – 2023",
      bullet_1: "Conducted hands-on workshops introducing 150+ students to Git, GitHub, and contributing to open-source software.",
      bullet_2: "Organized bi-weekly coding competitions and collaborative hackathon preparation tracks."
    }
  }
};

export const SAMPLE_NON_TECH_DATA = {
  personal: {
    first_name: "Rohan",
    last_name: "Mehta",
    email: "rohan.mehta@email.com",
    phone: "+91 98112 34567",
    city_state: "Mumbai, Maharashtra",
    linkedin: "linkedin.com/in/rohanmehta",
    portfolio: "drive.google.com/rohan-portfolio"
  },
  summary: "Results-driven Business & Operations Associate with proven experience in quantitative market analysis, process re-engineering, and financial modeling. Demonstrated track record in managing cross-functional stakeholder initiatives, optimizing organizational workflows, and delivering actionable strategic insights that accelerate revenue growth and client satisfaction.",
  skills: {
    languages: "English (Fluent), Hindi (Native), Business Report Writing",
    frameworks: "Agile Project Management, Financial Valuation, Market Sizing, DCF Modeling",
    tools_cloud: "Microsoft Excel (VBA/Macros), Tableau, Power BI, Salesforce CRM, Jira, SAP",
    concepts: "Strategic Planning, Stakeholder Communication, Cost-Benefit Analysis, Risk Mitigation"
  },
  education: [
    {
      institution: "St. Xavier's College",
      location: "Mumbai, India",
      degree: "Bachelor of Management Studies (Finance & Strategy)",
      grad_date: "2020 – 2024",
      gpa: "CGPA: 8.9 / 10",
      highlights: "Coursework: Corporate Finance, Strategic Management, Managerial Economics"
    },
    {
      institution: "Cathedral & John Connon School",
      location: "Mumbai, India",
      degree: "Higher Secondary Certificate (Commerce)",
      grad_date: "2018 – 2020",
      gpa: "Score: 95.6%",
      highlights: "School Commerce Club President; State Rank in Accountancy & Economics"
    },
    {
      institution: "Bombay Scottish School",
      location: "Mumbai, India",
      degree: "ICSE Class X (Secondary Certificate)",
      grad_date: "2018",
      gpa: "Score: 96.4%",
      highlights: "Academic Excellence Award in Economics and Mathematics"
    }
  ],
  projects: [
    {
      title: "Omnichannel Consumer Acquisition & Retention Strategy",
      tech_stack: "Market Research, Excel, Tableau, Cohort Analysis",
      role_or_org: "Consulting Capstone Project",
      date_range: "Sep 2023 – Mar 2024",
      bullet_1: "Analyzed transaction records across 12,000+ consumer touchpoints to identify customer churn triggers and repurchase cycles.",
      bullet_2: "Formulated a targeted loyalty campaign model presented to executive board, reducing forecasted customer acquisition cost by 22%."
    },
    {
      title: "Healthcare Supply Chain Optimization & Vendor Audit",
      tech_stack: "Process Mapping, Power BI, Financial Modeling",
      role_or_org: "Operational Case Study",
      date_range: "Jan 2024 – Apr 2024",
      bullet_1: "Mapped procurement workflows across 14 vendor categories, identifying supply bottlenecks and inventory carrying costs.",
      bullet_2: "Designed an automated KPI monitoring dashboard in Power BI, improving vendor delivery fulfillment rate from 81% to 96%."
    }
  ],
  experience: [
    {
      company: "Apex Strategy Partners",
      role: "Business Consulting Intern",
      location: "Mumbai, India",
      start_date: "Jun 2023",
      end_date: "Aug 2023",
      bullet_1: "Conducted benchmark financial analysis for 4 mid-market manufacturing clients, synthesizing findings into 25-page C-suite presentations.",
      bullet_2: "Assisted lead partners in building discounted cash flow (DCF) models, identifying INR 4.2M in annual operational expenditure savings."
    }
  ],
  certifications: "CFA Institute Investment Foundations, Microsoft Certified Excel Expert, Scrum Fundamentals (SFC)",
  custom_section: {
    title: "Leadership & Extra-Curricular Initiatives",
    subhead_1: {
      title: "Vice President, Xavier's Consulting & Commerce Forum",
      subtitle_or_date: "2023 – 2024",
      bullet_1: "Organized annual National Case Study Competition drawing 450+ participants across 32 top undergraduate institutions.",
      bullet_2: "Mentored 40+ junior candidates in structured casing, financial spreadsheet modeling, and interview presentation skills."
    },
    subhead_2: {
      title: "Convener, Annual Inter-Collegiate Business Fest",
      subtitle_or_date: "2022 – 2023",
      bullet_1: "Negotiated and secured INR 350,000+ in corporate sponsorships through outbound business development pitches.",
      bullet_2: "Managed a 15-member operations team handling logistics, hospitality, and event scheduling over 3 days."
    }
  }
};

export const EMPTY_FLEXIBLE_DATA = {
  personal: {
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    city_state: "",
    linkedin: "",
    portfolio: ""
  },
  summary: "",
  skills: {
    languages: "",
    frameworks: "",
    tools_cloud: "",
    concepts: ""
  },
  education: [
    {
      institution: "",
      location: "",
      degree: "",
      grad_date: "",
      gpa: "",
      highlights: ""
    },
    {
      institution: "",
      location: "",
      degree: "",
      grad_date: "",
      gpa: "",
      highlights: ""
    },
    {
      institution: "",
      location: "",
      degree: "",
      grad_date: "",
      gpa: "",
      highlights: ""
    }
  ],
  projects: [
    {
      title: "",
      tech_stack: "",
      role_or_org: "",
      date_range: "",
      bullet_1: "",
      bullet_2: "",
      link: ""
    }
  ],
  experience: [],
  certifications: "",
  custom_section: {
    title: "",
    subhead_1: {
      title: "",
      subtitle_or_date: "",
      bullet_1: "",
      bullet_2: ""
    },
    subhead_2: {
      title: "",
      subtitle_or_date: "",
      bullet_1: "",
      bullet_2: ""
    }
  }
};
