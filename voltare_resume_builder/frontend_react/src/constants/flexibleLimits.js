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
  minEducation: 2,
  maxProjects: 3,
  minProjects: 1,
  maxExperience: 3,
  minExperience: 0, // Freshers can have 0
  pageBudgetPoints: 720, // Single A4 usable vertical points
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
  certifications: "AWS Certified Cloud Practitioner, HackerRank Problem Solving (Gold Badge)"
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
  certifications: ""
};
