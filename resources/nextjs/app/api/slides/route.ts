import { NextResponse } from 'next/server';

export async function GET() {
    // Define mock data as a constant array
    const mockData = [
        {
            id: null,
            index: 0,
            type: 1,
            design_index: null,
            images: ["https://picsum.photos/seed/slide0/800/600"],
            icons: null,
            graph_id: null,
            presentation: "2ba76c29-66fe-481b-9942-287f199b7289",
            content: {
                title: "The Future of Remote Work",
                body: "Exploring how technology and changing workplace dynamics are reshaping the way we work in the digital age.",
                image_prompts: [
                    "Create a modern office setup with remote work elements like laptops, virtual meetings, and collaborative tools, use warm lighting."
                ]
            }
        },
        {
            id: null,
            index: 1,
            type: 2,
            design_index: null,
            images: ["https://picsum.photos/seed/slide0/800/600","https://picsum.photos/seed/slide0/800/600","https://picsum.photos/seed/slide0/800/600"],
            icons: null,
            graph_id: null,
            presentation: "2ba76c29-66fe-481b-9942-287f199b7289",
            content: {
                title: "Key Trends Shaping Remote Work",
                body: [
                    {
                        heading: "Digital Transformation",
                        description: "Companies are rapidly adopting cloud-based tools and digital workflows to enable seamless remote collaboration."
                    },
                    {
                        heading: "Flexible Schedules",
                        description: "The rise of asynchronous work patterns allowing employees to work across different time zones."
                    },
                    {
                        heading: "Remote Work",
                        description: "The rise of asynchronous work patterns allowing employees to work across different time zones."
                    }
                ],
                image_prompts: [
                    "A modern visualization of cloud computing and digital transformation",
                    "An illustration showing flexible work schedules and time zone collaboration",
                    "A representation of virtual team collaboration tools"
                ]
            }
        },
        {
            id: null,
            index: 2,
            type: 4,
            design_index: null,
            images: ["https://picsum.photos/seed/slide0/800/600","https://picsum.photos/seed/slide0/800/600","https://picsum.photos/seed/slide0/800/600"],
            icons: null,
            graph_id: null,
            presentation: "2ba76c29-66fe-481b-9942-287f199b7289",
            content: {
                title: "Essential Remote Work Tools",
                body: [
                    {
                        heading: "Communication Platforms",
                        description: "Modern chat and video conferencing tools enabling real-time collaboration across distributed teams."
                    },
                    {
                        heading: "Project Management",
                        description: "Digital tools for tracking tasks, deadlines, and team progress in virtual environments."
                    },
                    {
                        heading: "Cloud Storage",
                        description: "Secure file sharing and storage solutions for remote access to company resources."
                    }
                ],
                image_prompts: [
                    "An illustration of modern communication tools and platforms",
                    "A visual representation of digital project management",
                    "A modern depiction of cloud storage and security"
                ]
            }
        },
        {
            id: null,
            index: 3,
            type: 5,
            design_index: null,
            images: ["https://picsum.photos/seed/slide0/800/600"],
            icons: null,
            graph_id: null,
            presentation: "2ba76c29-66fe-481b-9942-287f199b7289",
            content: {
                title: "Remote Work Productivity Metrics",
                description: "Data shows significant increases in employee productivity and satisfaction with flexible work arrangements.",
                image_prompts: [
                    "A clean, modern visualization of productivity metrics and data"
                ]
            }
        },
        {
            id: null,
            index: 4,
            type: 6,
            design_index: null,
            images: null,
            icons: ["https://picsum.photos/seed/slide0/800/600","https://picsum.photos/seed/slide0/800/600","https://picsum.photos/seed/slide0/800/600"],
            graph_id: null,
            presentation: "2ba76c29-66fe-481b-9942-287f199b7289",
            content: {
                title: "Remote Work Benefits",
                description: "The benefits of remote work are clear, with increased productivity, reduced costs, and a more diverse talent pool.",
                body: [
                    {
                        heading: "Work-Life Balance",
                        description: "Employees report better work-life integration with flexible remote arrangements."
                    },
                    {
                        heading: "Cost Savings",
                        description: "Reduced commuting and office overhead leads to significant cost reductions."
                    },
                    {
                        heading: "Global Talent",
                        description: "Access to worldwide talent pools without geographical constraints."
                    }
                ],
                icon_queries: [
                    {
                        queries: ["balance", "lifestyle", "wellbeing"]
                    },
                    {
                        queries: ["savings", "cost", "efficiency"]
                    },
                    {
                        queries: ["global", "talent", "diversity"]
                    }
                ]
            }
        },
        {
            id: null,
            index: 5,
            type: 5,
            design_index: null,
            images: null,
            icons: null,
            graph_id: "a2053d5b-bb13-4bc6-bc6f-c9de1f81ee70",
            presentation: "2ba76c29-66fe-481b-9942-287f199b7289",
            content: {
                title: "Remote Work Adoption Trends",
                description: "Global statistics showing the rapid increase in remote work adoption across industries."
            }
        },
        {
            id: null,
            index: 6,
            type: 6,
            design_index: null,
            images: ["https://picsum.photos/seed/slide0/800/600","https://picsum.photos/seed/slide0/800/600","https://picsum.photos/seed/slide0/800/600"],
            icons: null,
            graph_id: null,
            presentation: "2ba76c29-66fe-481b-9942-287f199b7289",
            content: {
                title: "Remote Work Challenges",
                description: "Understanding and addressing key challenges in remote work environments.",
                body: [
                    {
                        heading: "Team Collaboration",
                        description: "Maintaining effective team dynamics and collaboration in virtual settings."
                    },
                    {
                        heading: "Digital Security",
                        description: "Ensuring data security and privacy in remote work environments."
                    },
                    {
                        heading: "Employee Engagement",
                        description: "Keeping remote teams motivated and connected to company culture."
                    }
                ],
                image_prompts: [
                    "An illustration of virtual team collaboration",
                    "A visualization of digital security measures",
                    "A representation of remote employee engagement"
                ]
            }
        },
        {
            id: null,
            index: 7,
            type: 7,
            design_index: null,
            images: null,
            icons: ["https://picsum.photos/seed/slide0/800/600","https://picsum.photos/seed/slide0/800/600"],
            graph_id: null,
            presentation: "2ba76c29-66fe-481b-9942-287f199b7289",
            content: {
                title: "Future Outlook",
                body: [
                    {
                        heading: "Hybrid Models",
                        description: "The emergence of flexible hybrid work models combining remote and office work."
                    },
                    {
                        heading: "Technology Evolution",
                        description: "Continued advancement in remote collaboration tools and virtual office solutions."
                    }
                ],
                icon_queries: [
                    {
                        queries: ["hybrid", "flexible", "work"]
                    },
                    {
                        queries: ["technology", "evolution", "future"]
                    }
                ]
            }
        },
        {
            id: null,
            index: 8,
            type: 8,
            design_index: null,
            images: null,
            icons: ["https://picsum.photos/seed/slide0/800/600","https://picsum.photos/seed/slide0/800/600"],
            graph_id: null,
            presentation: "2ba76c29-66fe-481b-9942-287f199b7289",
            content: {
                title: "Best Practices",
                description: "Key strategies for successful remote work implementation.",
                body: [
                    {
                        heading: "Clear Communication",
                        description: "Establishing effective communication protocols and expectations."
                    },
                    {
                        heading: "Regular Check-ins",
                        description: "Maintaining team connectivity through structured virtual meetings."
                    }
                ],
                icon_queries: [
                    {
                        queries: ["communication", "clarity", "protocol"]
                    },
                    {
                        queries: ["meeting", "check-in", "team"]
                    }
                ]
            }
        },
        {
            id: null,
            index: 9,
            type: 9,
            design_index: null,
            images: ["https://picsum.photos/seed/slide0/800/600","https://picsum.photos/seed/slide0/800/600","https://picsum.photos/seed/slide0/800/600"],
            icons: null,
            graph_id: null,
            presentation: "2ba76c29-66fe-481b-9942-287f199b7289",
            content: {
                title: "Remote Work Success Stories",
                body: [
                    {
                        heading: "Tech Industry",
                        description: "Leading tech companies demonstrating successful remote-first cultures."
                    },
                    {
                        heading: "Traditional Sectors",
                        description: "Traditional businesses successfully transitioning to remote operations."
                    },
                    {
                        heading: "Global Teams",
                        description: "Organizations effectively managing distributed global workforces."
                    }
                ],
                image_prompts: [
                    "A modern tech company workspace illustration",
                    "Traditional business adaptation to remote work",
                    "Global team collaboration visualization"
                ]
            }
        },
        {
            id: null,
            index: 10,
            type: 1,
            design_index: null,
            images: ["https://picsum.photos/seed/slide0/800/600"],
            icons: null,
            graph_id: null,
            presentation: "2ba76c29-66fe-481b-9942-287f199b7289",
            content: {
                title: "Embracing the Future",
                body: "Remote work is reshaping the future of work, creating new opportunities for both employees and organizations.",
                image_prompts: [
                    "A forward-looking illustration of the future workplace, combining technology and human elements."
                ]
            }
        }
    ];

    return NextResponse.json(mockData);
} 