import os
import asyncio
from playwright.async_api import async_playwright
from backend.flexible_renderer import render_flexible_html
from backend.watermark_extractor import get_watermark_base64

# Scenario 1: Fresher with Minimum Content (1 project, 2 degrees, 150-char summary)
SCENARIO_1_MIN_FRESHER = {
    "personal": {
        "first_name": "Aarav",
        "last_name": "Patel",
        "email": "aarav.patel@email.com",
        "phone": "+91 98765 43210",
        "city_state": "Ahmedabad, Gujarat",
        "linkedin": "linkedin.com/in/aaravpatel",
        "portfolio": "github.com/aaravpatel"
    },
    "summary": "Motivated Information Technology graduate with a rigorous academic grounding in software architecture, relational databases, and algorithmic problem-solving. Keen to bring disciplined clean coding and proactive collaboration to an agile software engineering team.",
    "skills": {
        "concepts": "Data Structures, Algorithms, Object-Oriented Programming",
        "tools_cloud": "Git, VS Code, Linux",
        "languages": "Python, Java, SQL",
        "frameworks": ""
    },
    "education": [
        {
            "institution": "Gujarat Technological University",
            "location": "Ahmedabad, India",
            "degree": "B.Tech in Information Technology",
            "grad_date": "2020 – 2024",
            "gpa": "CGPA: 8.4 / 10",
            "highlights": ""
        },
        {
            "institution": "St. Xavier's High School",
            "location": "Ahmedabad, India",
            "degree": "Higher Secondary Certificate (Science)",
            "grad_date": "2018 – 2020",
            "gpa": "Score: 91.2%",
            "highlights": ""
        }
    ],
    "projects": [
        {
            "title": "Campus Resource Booking Portal",
            "tech_stack": "Python, SQLite, Flask",
            "role_or_org": "Academic Project",
            "date_range": "Jan 2024 – Apr 2024",
            "bullet_1": "Engineered an automated lab and equipment reservation system preventing double-booking across 12 university departments.",
            "bullet_2": "Implemented role-based access control and email notification triggers for faculty approval workflows.",
            "link": "github.com/aaravpatel/campus-booking"
        }
    ],
    "experience": [],
    "certifications": "",
    "custom_section": {}
}

# Scenario 2: Fresher with Moderate Content (2 projects, 2 degrees with coursework, full skills)
SCENARIO_2_MODERATE_FRESHER = {
    "personal": {
        "first_name": "Sneha",
        "last_name": "Kulkarni",
        "email": "sneha.kulkarni@email.com",
        "phone": "+91 91234 56789",
        "city_state": "Pune, Maharashtra",
        "linkedin": "linkedin.com/in/snehakulkarni",
        "portfolio": "github.com/snehakulkarni"
    },
    "summary": "Proactive Computer Science graduate with proven engineering capability in developing high-throughput web applications, REST APIs, and database optimizations. Passionate about software craftsmanship, microservices, and continuous integration in cross-functional product teams.",
    "skills": {
        "concepts": "System Design, Object-Oriented Architecture, RESTful APIs, Algorithms",
        "tools_cloud": "Docker, Git, PostgreSQL, Redis, Linux, Postman",
        "languages": "Python, JavaScript, TypeScript, C++, SQL",
        "frameworks": "React, FastAPI, Node.js, Express.js, Tailwind CSS"
    },
    "education": [
        {
            "institution": "Pune Institute of Computer Technology",
            "location": "Pune, India",
            "degree": "Bachelor of Engineering in Computer Science",
            "grad_date": "2020 – 2024",
            "gpa": "CGPA: 9.1 / 10",
            "highlights": "Coursework: Distributed Systems, Database Management Systems, Cloud Computing"
        },
        {
            "institution": "Modern Junior College",
            "location": "Pune, India",
            "degree": "Higher Secondary Certificate (HSC - Science)",
            "grad_date": "2018 – 2020",
            "gpa": "Score: 94.6%",
            "highlights": "Distinction in Mathematics and Physics; School Science Club Secretary"
        }
    ],
    "projects": [
        {
            "title": "Intelligent Document Query Engine",
            "tech_stack": "Python, FastAPI, LangChain, FAISS, PostgreSQL",
            "role_or_org": "Capstone Engineering Project",
            "date_range": "Aug 2023 – Apr 2024",
            "bullet_1": "Architected a semantic document retrieval system indexing over 10,000 PDF pages with sub-second vector search latency.",
            "bullet_2": "Integrated automated conversational summarization pipelines reducing manual research review time by 60%.",
            "link": "github.com/snehakulkarni/doc-query"
        },
        {
            "title": "Real-Time Collaborative Code Editor",
            "tech_stack": "React, Node.js, WebSockets, Redis",
            "role_or_org": "Independent Project",
            "date_range": "Dec 2023 – Feb 2024",
            "bullet_1": "Engineered multi-user document synchronization utilizing Operational Transformation with conflict-free concurrency.",
            "bullet_2": "Containerized backend services with Docker and set up automated unit test suites achieving 88% branch coverage.",
            "link": "github.com/snehakulkarni/collab-code"
        }
    ],
    "experience": [],
    "certifications": "AWS Certified Cloud Practitioner, HackerRank Problem Solving (Gold Badge)",
    "custom_section": {}
}

# Scenario 3: Experienced Candidate with Extensive Content (3 jobs, 2 projects, 2 degrees, certs)
SCENARIO_3_EXPERIENCED = {
    "personal": {
        "first_name": "Rohan",
        "last_name": "Mehta",
        "email": "rohan.mehta@email.com",
        "phone": "+91 99887 76655",
        "city_state": "Bengaluru, Karnataka",
        "linkedin": "linkedin.com/in/rohanmehta",
        "portfolio": "rohanmehta.dev"
    },
    "summary": "Senior Software Engineer with 5+ years of experience engineering distributed cloud backends, high-throughput microservices, and database scaling solutions. Proven track record leading agile engineering squads and reducing infrastructure operating costs by 35%.",
    "skills": {
        "concepts": "Microservices Architecture, System Scalability, Event-Driven Design, CI/CD",
        "tools_cloud": "Kubernetes, Docker, AWS (ECS, EKS, RDS), Terraform, Redis, Kafka",
        "languages": "Go, Python, Java, SQL, TypeScript",
        "frameworks": "gRPC, FastAPI, Spring Boot, React"
    },
    "experience": [
        {
            "company": "Razorpay Payments",
            "location": "Bengaluru, India",
            "role": "Senior Software Engineer",
            "start_date": "Jun 2022",
            "end_date": "Present",
            "bullet_1": "Spearheaded payout transaction pipeline processing 4M+ daily webhooks with 99.99% service availability.",
            "bullet_2": "Re-architected ledger idempotency checks with Redis distributed locks, eliminating payment collision bugs."
        },
        {
            "company": "Swiggy Delivery Platform",
            "location": "Bengaluru, India",
            "role": "Software Development Engineer II",
            "start_date": "Jul 2020",
            "end_date": "May 2022",
            "bullet_1": "Engineered real-time order dispatch algorithms reducing delivery assignment latency by 28% during peak hours.",
            "bullet_2": "Refactored monolith notification dispatch to Kafka event streams handling 50k events/sec smoothly."
        },
        {
            "company": "InMobi Tech Labs",
            "location": "Bengaluru, India",
            "role": "Software Engineer",
            "start_date": "Jul 2018",
            "end_date": "Jun 2020",
            "bullet_1": "Built analytics ingestion workers in Go consuming real-time ad performance metrics from 100M+ mobile impressions."
        }
    ],
    "projects": [
        {
            "title": "Distributed Task Scheduler & Worker Pool",
            "tech_stack": "Go, Redis, Docker, gRPC",
            "date_range": "2023",
            "bullet_1": "Open-source asynchronous task runner featuring exponential backoff retries and graceful worker cancellation.",
            "link": "github.com/rohanmehta/task-pool"
        }
    ],
    "education": [
        {
            "institution": "National Institute of Technology",
            "location": "Surathkal, India",
            "degree": "B.Tech in Computer Science and Engineering",
            "grad_date": "2014 – 2018",
            "gpa": "CGPA: 8.9 / 10",
            "highlights": "ACM Student Chapter Chair"
        },
        {
            "institution": "Delhi Public School",
            "location": "New Delhi, India",
            "degree": "CBSE Class XII (Science Stream)",
            "grad_date": "2012 – 2014",
            "gpa": "Score: 96.2%",
            "highlights": "National Science Olympiad State Rank 14"
        }
    ],
    "certifications": "AWS Solutions Architect Associate, Certified Kubernetes Application Developer (CKAD)",
    "custom_section": {}
}

# Scenario 4: Long Descriptions / Heavy Bullets
SCENARIO_4_LONG_DESCRIPTIONS = {
    "personal": {
        "first_name": "Vikram",
        "last_name": "Singhania",
        "email": "vikram.s@email.com",
        "phone": "+91 98111 22334",
        "city_state": "Gurugram, Haryana",
        "linkedin": "linkedin.com/in/vikramsinghania",
        "portfolio": "github.com/vikramsinghania"
    },
    "summary": "Accomplished Full-Stack Platform Engineer specializing in high-performance web applications, cloud-native backend systems, and modern API infrastructures. Demonstrated expertise in taking complex software projects from conceptual whiteboard design through production deployment, performance tuning, and long-term site reliability maintenance across enterprise clients.",
    "skills": {
        "concepts": "Software Architecture, Performance Profiling, Asynchronous Programming, Secure API Design",
        "tools_cloud": "AWS (EC2, S3, RDS, CloudFront), Docker, GitHub Actions, PostgreSQL, Redis, Nginx",
        "languages": "TypeScript, Python, SQL, JavaScript, HTML5, CSS3",
        "frameworks": "Next.js, FastAPI, Node.js, Express, Tailwind CSS, Prisma ORM"
    },
    "education": [
        {
            "institution": "Delhi Technological University (DTU)",
            "location": "New Delhi, India",
            "degree": "Bachelor of Technology in Information Technology",
            "grad_date": "2019 – 2023",
            "gpa": "CGPA: 8.7 / 10",
            "highlights": "Coursework: Database Management Systems, Object Oriented Analysis, Web Development"
        },
        {
            "institution": "Modern School Barakhamba Road",
            "location": "New Delhi, India",
            "degree": "All India Senior School Certificate Examination",
            "grad_date": "2017 – 2019",
            "gpa": "Score: 95.8%",
            "highlights": "School Topper in Computer Science"
        }
    ],
    "projects": [
        {
            "title": "Enterprise Cloud Telemetry Dashboard & Log Aggregator",
            "tech_stack": "Next.js, FastAPI, TimescaleDB, Docker, Tailwind CSS",
            "date_range": "2023 – 2024",
            "bullet_1": "Engineered high-throughput log ingestion server processing 10,000 requests/sec with automated index rotation.",
            "bullet_2": "Designed interactive real-time telemetry charts rendering time-series latency and error spikes with 60 FPS smoothness.",
            "link": "github.com/vikramsinghania/telemetry"
        }
    ],
    "experience": [
        {
            "company": "Zomato Media Pvt. Ltd.",
            "location": "Gurugram, India",
            "role": "Software Development Engineer",
            "start_date": "Jun 2023",
            "end_date": "Present",
            "bullet_1": "Developed and maintained 15+ customer-facing checkout API endpoints handling millions of order transactions every week.",
            "bullet_2": "Optimized database queries across PostgreSQL tables with composite indexes, reducing p95 latency from 240ms down to 65ms."
        }
    ],
    "certifications": "Oracle Certified Professional: Java SE 11 Developer",
    "custom_section": {}
}

# Scenario 5: Almost-Empty Resume (Minimum thresholds for 1-page validation)
SCENARIO_5_MINIMAL = {
    "personal": {
        "first_name": "Pooja",
        "last_name": "Sharma",
        "email": "pooja.sharma@email.com",
        "phone": "+91 97777 88888",
        "city_state": "Jaipur, Rajasthan",
        "linkedin": "",
        "portfolio": ""
    },
    "summary": "Enthusiastic and detail-oriented Computer Science graduate seeking an entry-level software engineering role to utilize academic skills in programming, web development, and problem solving to contribute to real-world software applications.",
    "skills": {
        "concepts": "Problem Solving, Data Structures",
        "tools_cloud": "Git, VS Code",
        "languages": "C++, Python, SQL",
        "frameworks": ""
    },
    "education": [
        {
            "institution": "Malaviya National Institute of Technology",
            "location": "Jaipur, India",
            "degree": "B.Tech in Computer Engineering",
            "grad_date": "2020 – 2024",
            "gpa": "CGPA: 8.2 / 10",
            "highlights": ""
        },
        {
            "institution": "Mahaveer Public School",
            "location": "Jaipur, India",
            "degree": "Senior Secondary Examination (Science)",
            "grad_date": "2018 – 2020",
            "gpa": "Score: 89.4%",
            "highlights": ""
        }
    ],
    "projects": [
        {
            "title": "Hospital Management Database System",
            "tech_stack": "Python, MySQL, Tkinter",
            "date_range": "2023",
            "bullet_1": "Created a desktop management application for tracking patient registrations, room allocations, and billing history.",
            "bullet_2": "",
            "link": ""
        }
    ],
    "experience": [],
    "certifications": "",
    "custom_section": {}
}

# Scenario 6: All Optional Sections Included (Custom section with 2 subheads + bullets)
SCENARIO_6_ALL_OPTIONALS = {
    "personal": {
        "first_name": "Aditya",
        "last_name": "Verma",
        "email": "aditya.verma@email.com",
        "phone": "+91 98222 33445",
        "city_state": "Hyderabad, Telangana",
        "linkedin": "linkedin.com/in/adityaverma",
        "portfolio": "github.com/adityaverma"
    },
    "summary": "Dynamic Full-Stack Developer with hands-on expertise building responsive web platforms, REST APIs, and database-driven cloud applications. Experienced student leader adept at organizing technical hackathons, coordinating technical teams, and shipping production-quality software.",
    "skills": {
        "concepts": "Software Architecture, Agile Methodologies, API Design, System Optimization",
        "tools_cloud": "Docker, Git, PostgreSQL, MongoDB, Redis, Linux, AWS",
        "languages": "Python, TypeScript, JavaScript, SQL, C++",
        "frameworks": "React, Vite, Node.js, FastAPI, Express.js"
    },
    "education": [
        {
            "institution": "International Institute of Information Technology (IIIT)",
            "location": "Hyderabad, India",
            "degree": "B.Tech in Computer Science and Engineering",
            "grad_date": "2020 – 2024",
            "gpa": "CGPA: 9.0 / 10",
            "highlights": "Coursework: Database Internals, Machine Learning, Computer Networks"
        },
        {
            "institution": "Hyderabad Public School",
            "location": "Hyderabad, India",
            "degree": "CBSE Class XII (Science Stream)",
            "grad_date": "2018 – 2020",
            "gpa": "Score: 95.4%",
            "highlights": "Head Boy, School Prefect Council"
        }
    ],
    "projects": [
        {
            "title": "Decentralized File Storage & Retrieval Network",
            "tech_stack": "Node.js, Express, IPFS, React, PostgreSQL",
            "date_range": "2023 – 2024",
            "bullet_1": "Implemented content-addressable storage using IPFS protocols for verifiable and tamper-proof media distribution.",
            "bullet_2": "Engineered client-side AES-256 encryption ensuring zero-knowledge privacy for all stored personal files.",
            "link": "github.com/adityaverma/ipfs-store"
        }
    ],
    "experience": [
        {
            "company": "Microsoft Tech Center",
            "location": "Hyderabad, India",
            "role": "Software Engineering Intern",
            "start_date": "May 2023",
            "end_date": "Jul 2023",
            "bullet_1": "Contributed to telemetry microservices in C#/.NET Core, writing automated integration tests for cloud APIs.",
            "bullet_2": "Identified and patched 4 memory leak vulnerabilities in data streaming pipelines during performance sprints."
        }
    ],
    "certifications": "Microsoft Certified: Azure Developer Associate, Google Cloud Digital Leader",
    "custom_section": {
        "title": "Leadership & Extracurricular Activities",
        "subhead_1": {
            "title": "Convenor — Annual National College Hackathon",
            "subtitle_or_date": "2023 – 2024",
            "bullet_1": "Led an organizing committee of 35 students managing 1,200+ participants from 60 universities across India.",
            "bullet_2": "Secured INR 4.5 Lakhs in corporate sponsorship and partnered with tech industry leaders for judge panels."
        },
        "subhead_2": {
            "title": "President — Open Source Developers Community",
            "subtitle_or_date": "2022 – 2023",
            "bullet_1": "Mentored 150+ junior students in Git version control, pull request etiquette, and contributing to open-source software.",
            "bullet_2": "Organized 8 hands-on technical workshops on Docker containerization, REST API design, and web security."
        }
    }
}

SCENARIOS = [
    ("Scenario 1: Minimum Fresher", SCENARIO_1_MIN_FRESHER),
    ("Scenario 2: Moderate Fresher", SCENARIO_2_MODERATE_FRESHER),
    ("Scenario 3: Experienced Candidate", SCENARIO_3_EXPERIENCED),
    ("Scenario 4: Long Descriptions", SCENARIO_4_LONG_DESCRIPTIONS),
    ("Scenario 5: Minimal Profile", SCENARIO_5_MINIMAL),
    ("Scenario 6: All Optional Sections Included", SCENARIO_6_ALL_OPTIONALS),
]

OUT_DIR = r"C:\Users\welcome\.gemini\antigravity\brain\c8afbbd8-2a3f-43ba-9e15-ce538cbf6aa1"

async def test_all_scenarios():
    watermark_b64 = get_watermark_base64()
    results = []

    async with async_playwright() as p:
        browser = await p.chromium.launch()

        for idx, (name, data) in enumerate(SCENARIOS, 1):
            html = render_flexible_html(data, watermark_base64=watermark_b64)
            page = await browser.new_page(viewport={"width": 1200, "height": 1300})
            await page.set_content(html, wait_until="networkidle")
            await page.wait_for_timeout(300)

            # Measure the rendered sheet element
            sheet = await page.query_selector(".sheet")
            box = await sheet.bounding_box()
            scroll_height = await page.evaluate("() => document.querySelector('.sheet').scrollHeight")
            
            # Capture screenshot
            img_filename = f"adaptive_test_scenario_{idx}.png"
            img_path = os.path.join(OUT_DIR, img_filename)
            await sheet.screenshot(path=img_path)

            # Generate PDF and verify it is strictly 1 page
            pdf_filename = f"adaptive_test_scenario_{idx}.pdf"
            pdf_path = os.path.join(OUT_DIR, pdf_filename)
            await page.pdf(
                path=pdf_path,
                format="A4",
                print_background=True,
                margin={"top": "0mm", "bottom": "0mm", "left": "0mm", "right": "0mm"}
            )

            is_within_a4 = scroll_height <= 1125 # 1123px A4 + 2px tolerance
            status_str = "PASS (Strict 1 Page)" if is_within_a4 else "FAIL (Overflow)"

            results.append({
                "scenario": name,
                "height_px": scroll_height,
                "target_a4_px": 1123,
                "is_within_a4": is_within_a4,
                "status": status_str,
                "screenshot": img_filename,
                "pdf": pdf_filename
            })

            print(f"[{status_str}] {name}: Rendered Height = {scroll_height}px / 1123px (A4)")

        await browser.close()

    print("\n" + "="*80)
    print("ADAPTIVE PAGE COMPOSITION ENGINE: 6 SCENARIOS TEST SUMMARY")
    print("="*80)
    for r in results:
        print(f"{r['scenario']:<40} | Height: {r['height_px']}px / 1123px | Status: {r['status']}")
    print("="*80)

if __name__ == "__main__":
    asyncio.run(test_all_scenarios())
