import { getHeader, getHeaderForFormData } from "@/app/(presentation-generator)/services/api/header";

export interface PresentationResponse {
    id: string;
    title: string;
    created_at: string;
    data: any | null;
    file: string;
    n_slides: number;
    prompt: string;
    summary: string | null;
    theme: string;
    titles: string[];
    user_id: string;
    vector_store: any;

    thumbnail: string;
}

export class DashboardApi {
    // static BASE_URL = "https://api.presenton.ai";
    // static BASE_URL = "https://presentation-generator-fragrant-mountain-1643.fly.dev";
    //   static BASE_URL="https://presentation-generator-wandering-night-8649.fly.dev";
    static BASE_URL = "http://localhost:8000";
    static async getPresentations(user_id: string): Promise<PresentationResponse[]> {
        try {
            const response = await fetch(`${DashboardApi.BASE_URL}/ppt/user_presentations?user_id=${user_id}`, {
                method: "GET",
                headers: getHeader()
            });
            if (response.status === 200) {
                const data = await response.json();
                return data;
            } else if (response.status === 404) {
                console.log("No presentations found");
                return [];
            }
            return [];
        } catch (error) {
            console.error('Error fetching presentations:', error);
            throw error;
        }
    }
    static async getPresentation(id: string, user_id: string) {


        // Commented code for actual API call
        //        const rawData= `{
        //   "presentation": {
        //     "id": "5990dbb0-799a-484d-8c01-15c280d05ba5",
        //     "user_id": "e3f75cc8-b03a-452d-ad83-bb4207413436",
        //     "created_at": "2025-03-14T18:55:29.915604+00:00",
        //     "prompt": "",
        //     "n_slides": 15,
        //     "theme": {
        //       "name": "royal_blue",
        //       "colors": {
        //         "iconBg": "#E100FF",
        //         "slideBg": "#091433",
        //         "slideBox": "#29136C",
        //         "fontFamily": "var(--font-satoshi)",
        //         "slideTitle": "#ffffff",
        //         "chartColors": [
        //           "#E100FF",
        //           "#496CEB",
        //           "#f051b5",
        //           "#F7A8FF",
        //           "#FCD8FF"
        //         ],
        //         "slideHeading": "#ffffff",
        //         "slideDescription": "#E6E6E6"
        //       }
        //     },
        //     "file": null,
        //     "vector_store": "user-e3f75cc8-b03a-452d-ad83-bb4207413436/5990dbb0-799a-484d-8c01-15c280d05ba5/vector_store.json",
        //     "title": "Social Media's Impact on Mental Health",
        //     "titles": [
        //       "Introduction to Social Media Impact",
        //       "Background: Rise of Social Media",
        //       "Objective: Study of Facebook's Effects",
        //       "Key Findings: Mental Health Impact",
        //       "Mental Health and Facebook Usage",
        //       "Facebook and Academic Performance",
        //       "Social Comparisons: A Closer Look",
        //       "Subpopulation Susceptibility Analysis",
        //       "Methodology: Natural Experiment Design",
        //       "Data Collection and Analysis",
        //       "Conclusion: Adverse Health Impact",
        //       "Policy Implications on Social Media",
        //       "Future Research Directions",
        //       "Social Media in Cultural Contexts",
        //       "Summary and Final Thoughts"
        //     ],
        //     "language": "English (English)",
        //     "thumbnail": null,
        //     "questions": [
        //       {
        //         "question": "Who are you presenting data to?",
        //         "options": [
        //           "Students",
        //           "Educators",
        //           "Researchers"
        //         ]
        //       },
        //       {
        //         "question": "What do you need your audience to know?",
        //         "options": [
        //           "Impact of social media",
        //           "Mental health stats",
        //           "Study methodology"
        //         ]
        //       },
        //       {
        //         "question": "What should be the tone of presentation?",
        //         "options": [
        //           "Informative",
        //           "Persuasive",
        //           "Neutral"
        //         ]
        //       },
        //       {
        //         "question": "What data points should be used to reach conclusion?",
        //         "options": [
        //           "Mental health symptoms",
        //           "Depression diagnoses",
        //           "Social media usage"
        //         ]
        //       }
        //     ],
        //     "answers": null,
        //     "big_idea": null,
        //     "story_type": null,
        //     "story": null,
        //     "interpreted_report_content": null
        //   },
        //   "slides": [
        //     {
        //       "id": "306d4831-c4cc-41e6-bf49-44251bd57083",
        //       "index": 0,
        //       "type": 1,
        //       "design_index": null,
        //       "images": null,
        //       "icons": null,
        //       "presentation": "5990dbb0-799a-484d-8c01-15c280d05ba5",
        //       "content": {
        //         "title": "Introduction to Social Media Impact",
        //         "body": "Social media revolutionized communication; **4.3 billion** people engaged by 2021. However, with its growth, concerns about its impact on mental health, especially among U.S. youth, are rising.",
        //         "image_prompts": [
        //           "an abstract network of glowing nodes and connection lines, representing a vast and dynamic internet network, futuristic digital theme, don't include text in image"
        //         ]
        //       }
        //     },
        //     {
        //       "id": "71fb8bec-8012-49d9-a22b-2795b6743eb2",
        //       "index": 1,
        //       "type": 2,
        //       "design_index": null,
        //       "images": null,
        //       "icons": null,
        //       "presentation": "5990dbb0-799a-484d-8c01-15c280d05ba5",
        //       "content": {
        //         "title": "Background: Rise of Social Media",
        //         "body": [
        //           {
        //             "heading": "Facebook's Emergence",
        //             "description": "In the mid-2000s, Facebook rapidly gained popularity, especially among students."
        //           },
        //           {
        //             "heading": "Impact on Mental Health",
        //             "description": "The rise of platforms like Facebook coincided with worsening mental health in young adults."
        //           },
        //           {
        //             "heading": "Key Milestones",
        //             "description": "Significant events in social media history highlight Facebook's growth."
        //           },
        //           {
        //             "heading": "Context for Analysis",
        //             "description": "Understanding Facebook's impact on mental health sets the stage for further exploration."
        //           }
        //         ]
        //       }
        //     },
        //     {
        //       "id": "4dfd5e27-e609-4045-ae3a-f06d30694ebf",
        //       "index": 2,
        //       "type": 6,
        //       "design_index": null,
        //       "images": null,
        //       "icons": null,
        //       "presentation": "5990dbb0-799a-484d-8c01-15c280d05ba5",
        //       "content": {
        //         "title": "Objective: Study of Facebook's Effects",
        //         "description": "Objective is to assess Facebook's impact on U.S. students' mental health using unique methodologies, revealing causal relationships with potential academic repercussions.",
        //         "body": [
        //           {
        //             "heading": "Natural Experiment",
        //             "description": "Utilizes staggered introduction of Facebook across U.S. colleges to assess impact."
        //           },
        //           {
        //             "heading": "Methodological Approach",
        //             "description": "Employs generalized difference-in-differences empirical strategy for analysis."
        //           },
        //           {
        //             "heading": "Causal Insights",
        //             "description": "Focus on understanding Facebook's role amid economic and mental health changes."
        //           }
        //         ]
        //       }
        //     },
        //     {
        //       "id": "349a2b08-61dc-4e88-a420-73e1a49a306f",
        //       "index": 3,
        //       "type": 9,
        //       "design_index": null,
        //       "images": null,
        //       "icons": null,
        //       "presentation": "5990dbb0-799a-484d-8c01-15c280d05ba5",
        //       "content": {
        //         "title": "Key Findings: Mental Health Impact",
        //         "body": [
        //           {
        //             "heading": "Increased Depression Symptoms",
        //             "description": "Facebook roll-out led to more depression symptoms among students."
        //           },
        //           {
        //             "heading": "Rise in Anxiety",
        //             "description": "Notable rise in anxiety levels was observed with Facebook's introduction."
        //           },
        //           {
        //             "heading": "Increased Healthcare Use",
        //             "description": "Higher use of mental healthcare services post-Facebook introduction."
        //           }
        //         ],
        //         "graph": {
        //           "id": null,
        //           "name": "Mental Health Trends",
        //           "type": "line",
        //           "presentation": null,
        //           "unit": null,
        //           "data": {
        //             "categories": [
        //               "January",
        //               "February",
        //               "March",
        //               "April",
        //               "May",
        //               "June",
        //               "July",
        //               "August",
        //               "September",
        //               "October",
        //               "November",
        //               "December"
        //             ],
        //             "series": [
        //               {
        //                 "name": "Symptoms of Poor Mental Health",
        //                 "data": [
        //                   30,
        //                   45,
        //                   50,
        //                   60,
        //                   55,
        //                   65,
        //                   70,
        //                   80,
        //                   90,
        //                   85,
        //                   75,
        //                   70
        //                 ]
        //               },
        //               {
        //                 "name": "Mental Healthcare Service Usage",
        //                 "data": [
        //                   15,
        //                   20,
        //                   25,
        //                   30,
        //                   28,
        //                   35,
        //                   40,
        //                   50,
        //                   55,
        //                   60,
        //                   65,
        //                   68
        //                 ]
        //               }
        //             ]
        //           }
        //         }
        //       }
        //     },
        //     {
        //       "id": "1d6e1b17-85d5-44b2-90cd-291c658ebcae",
        //       "index": 4,
        //       "type": 5,
        //       "design_index": null,
        //       "images": null,
        //       "icons": null,
        //       "presentation": "5990dbb0-799a-484d-8c01-15c280d05ba5",
        //       "content": {
        //         "title": "Mental Health and Facebook Usage",
        //         "body": "Increased Facebook usage leads to higher reports of depression and anxiety among students. Understanding potential mechanisms can help address these mental health challenges.",
        //         "graph": {
        //           "id": null,
        //           "name": "Mental Health Trends",
        //           "type": "scatter",
        //           "presentation": "This scatter plot represents the relationship between increased Facebook usage and reported anxiety/depression symptoms.",
        //           "unit": null,
        //           "data": {
        //             "series": [
        //               {
        //                 "name": "Facebook Usage vs Anxiety/Depression Symptoms",
        //                 "points": [
        //                   {
        //                     "x": 1.5,
        //                     "y": 60,
        //                     "radius": null
        //                   },
        //                   {
        //                     "x": 2,
        //                     "y": 65,
        //                     "radius": null
        //                   },
        //                   {
        //                     "x": 2.5,
        //                     "y": 70,
        //                     "radius": null
        //                   },
        //                   {
        //                     "x": 3,
        //                     "y": 75,
        //                     "radius": null
        //                   },
        //                   {
        //                     "x": 3.5,
        //                     "y": 80,
        //                     "radius": null
        //                   }
        //                 ]
        //               }
        //             ]
        //           }
        //         }
        //       }
        //     },
        //     {
        //       "id": "bb4fffa4-c012-4e71-b9eb-15eae3f3c026",
        //       "index": 5,
        //       "type": 5,
        //       "design_index": null,
        //       "images": null,
        //       "icons": null,
        //       "presentation": "5990dbb0-799a-484d-8c01-15c280d05ba5",
        //       "content": {
        //         "title": "Facebook and Academic Performance",
        //         "body": "The slide explores how Facebook adversely affects students' academic performance due to increased mental health issues like stress and anxiety, resulting in declining performance metrics.",
        //         "graph": {
        //           "id": null,
        //           "name": "Academic Performance Decline",
        //           "type": "scatter",
        //           "presentation": null,
        //           "unit": null,
        //           "data": {
        //             "series": [
        //               {
        //                 "name": "Mental Health vs Academic Performance",
        //                 "points": [
        //                   {
        //                     "x": 2,
        //                     "y": 85,
        //                     "radius": null
        //                   },
        //                   {
        //                     "x": 3,
        //                     "y": 80,
        //                     "radius": null
        //                   },
        //                   {
        //                     "x": 4,
        //                     "y": 75,
        //                     "radius": null
        //                   },
        //                   {
        //                     "x": 5,
        //                     "y": 70,
        //                     "radius": null
        //                   },
        //                   {
        //                     "x": 6,
        //                     "y": 65,
        //                     "radius": null
        //                   }
        //                 ]
        //               }
        //             ]
        //           }
        //         }
        //       }
        //     },
        //     {
        //       "id": "7d8f64e3-014e-437f-bd12-f0d9857314ad",
        //       "index": 6,
        //       "type": 11,
        //       "design_index": null,
        //       "images": null,
        //       "icons": null,
        //       "presentation": "5990dbb0-799a-484d-8c01-15c280d05ba5",
        //       "content": {
        //         "title": "Social Comparisons: A Closer Look",
        //         "description": "This slide highlights the negative effects of social comparisons on social media, with 70% of stressed students and 60% of disadvantaged students affected, suggesting the need for awareness and interventions.",
        //         "infographics": [
        //           {
        //             "title": "Frequent Social Comparisons among Stressed Students",
        //             "chart": {
        //               "chart_type": "progress-ring",
        //               "value": {
        //                 "number_type": "percentage",
        //                 "percentage": 70
        //               }
        //             },
        //             "description": "70% of students experiencing higher stress cited frequent social comparisons as a central issue."
        //           },
        //           {
        //             "title": "Lower Self-Esteem in Disadvantaged Students",
        //             "chart": {
        //               "chart_type": "progress-ring",
        //               "value": {
        //                 "number_type": "percentage",
        //                 "percentage": 60
        //               }
        //             },
        //             "description": "Lower self-esteem prevalent in 60% of socio-economically disadvantaged students."
        //           }
        //         ]
        //       }
        //     },
        //     {
        //       "id": "bdd7363a-501b-44a2-8e0c-6930411ef259",
        //       "index": 7,
        //       "type": 5,
        //       "design_index": null,
        //       "images": null,
        //       "icons": null,
        //       "presentation": "5990dbb0-799a-484d-8c01-15c280d05ba5",
        //       "content": {
        //         "title": "Subpopulation Susceptibility Analysis",
        //         "body": "Certain subpopulations, like off-campus students and those with low socio-economic status, are more susceptible to Facebook's adverse effects on mental health.",
        //         "graph": {
        //           "id": null,
        //           "name": "Heterogeneous Effects",
        //           "type": "bar",
        //           "presentation": null,
        //           "unit": null,
        //           "data": {
        //             "categories": [
        //               "Low Income Urban",
        //               "Low Income Rural",
        //               "High Income Urban",
        //               "High Income Rural"
        //             ],
        //             "series": [
        //               {
        //                 "name": "Depression Rate (%)",
        //                 "data": [
        //                   15.2,
        //                   10.8,
        //                   6.3,
        //                   4.9
        //                 ]
        //               },
        //               {
        //                 "name": "Anxiety Rate (%)",
        //                 "data": [
        //                   22.5,
        //                   18.3,
        //                   10.1,
        //                   9.7
        //                 ]
        //               }
        //             ]
        //           }
        //         }
        //       }
        //     },
        //     {
        //       "id": "17f0a9ae-4b1e-420b-9544-a1b84548fccc",
        //       "index": 8,
        //       "type": 10,
        //       "design_index": null,
        //       "images": null,
        //       "icons": null,
        //       "presentation": "5990dbb0-799a-484d-8c01-15c280d05ba5",
        //       "content": {
        //         "title": "Methodology: Natural Experiment Design",
        //         "infographics": [
        //           {
        //             "title": "Colleges Analyzed in Study",
        //             "chart": {
        //               "chart_type": "icon-infographic",
        //               "value": {
        //                 "number_type": "fraction",
        //                 "numerator": 775,
        //                 "denominator": 1
        //               },
        //               "icon": "building"
        //             },
        //             "description": "A total of **775** U.S. colleges were analyzed, using data from the National College Health Assessment survey."
        //           },
        //           {
        //             "title": "Focus on Facebook Impact",
        //             "chart": {
        //               "chart_type": "icon-infographic",
        //               "value": {
        //                 "number_type": "percentage",
        //                 "percentage": 100
        //               },
        //               "icon": "globe"
        //             },
        //             "description": "The research emphasized Facebook's impact while ruling out other confounding factors through a natural experiment."
        //           },
        //           {
        //             "title": "Staggered Facebook Introduction",
        //             "chart": {
        //               "chart_type": "icon-infographic",
        //               "value": {
        //                 "number_type": "percentage",
        //                 "percentage": 100
        //               },
        //               "icon": "laptop_computer"
        //             },
        //             "description": "The staggered entry of Facebook created an environment for controlled study, separating its impact from other influences."
        //           }
        //         ]
        //       }
        //     },
        //     {
        //       "id": "a7e0c657-7c19-46cd-8d6d-d40c8d392b1c",
        //       "index": 9,
        //       "type": 10,
        //       "design_index": null,
        //       "images": null,
        //       "icons": null,
        //       "presentation": "5990dbb0-799a-484d-8c01-15c280d05ba5",
        //       "content": {
        //         "title": "Data Collection and Analysis",
        //         "infographics": [
        //           {
        //             "title": "Comprehensive Data Collection",
        //             "chart": {
        //               "chart_type": "radial-progress",
        //               "value": {
        //                 "number_type": "percentage",
        //                 "percentage": 100
        //               }
        //             },
        //             "description": "Data gathered from a survey involving **775** U.S. colleges, ensuring extensive coverage."
        //           },
        //           {
        //             "title": "Generalized Difference-in-Differences Method",
        //             "chart": {
        //               "chart_type": "radial-progress",
        //               "value": {
        //                 "number_type": "percentage",
        //                 "percentage": 100
        //               }
        //             },
        //             "description": "Used to evaluate changes in mental health indicators, demonstrating robust analysis."
        //           }
        //         ]
        //       }
        //     },
        //     {
        //       "id": "abb52f23-edf5-451f-94f2-5294b15e5b2d",
        //       "index": 10,
        //       "type": 1,
        //       "design_index": null,
        //       "images": null,
        //       "icons": null,
        //       "presentation": "5990dbb0-799a-484d-8c01-15c280d05ba5",
        //       "content": {
        //         "title": "Conclusion: Adverse Health Impact",
        //         "body": "The study concludes that Facebook adversely affects student mental health, increasing anxiety, depression, and healthcare reliance, highlighting social media's significant role in mental well-being.",
        //         "image_prompts": [
        //           "a digital landscape with abstract visual metaphor for mental health challenges, showcasing connectivity and technology impact on mental wellness, don't include text in image"
        //         ]
        //       }
        //     },
        //     {
        //       "id": "31c4601b-9c63-465f-a91b-0168667adbba",
        //       "index": 11,
        //       "type": 10,
        //       "design_index": null,
        //       "images": null,
        //       "icons": null,
        //       "presentation": "5990dbb0-799a-484d-8c01-15c280d05ba5",
        //       "content": {
        //         "title": "Policy Implications on Social Media",
        //         "infographics": [
        //           {
        //             "title": "Frameworks for Mental Health",
        //             "chart": {
        //               "chart_type": "icon-infographic",
        //               "value": {
        //                 "number_type": "percentage",
        //                 "percentage": 65
        //               },
        //               "icon": "mortarboard"
        //             },
        //             "description": "**65%** suggest the importance of frameworks that consider mental health in digital governance."
        //           },
        //           {
        //             "title": "Support for Healthier Engagement",
        //             "chart": {
        //               "chart_type": "icon-infographic",
        //               "value": {
        //                 "number_type": "percentage",
        //                 "percentage": 72
        //               },
        //               "icon": "mobile_phone"
        //             },
        //             "description": "**72%** recognize the need for supporting healthier digital engagement practices."
        //           },
        //           {
        //             "title": "Guidance for Young Adults",
        //             "chart": {
        //               "chart_type": "icon-infographic",
        //               "value": {
        //                 "number_type": "percentage",
        //                 "percentage": 58
        //               },
        //               "icon": "globe"
        //             },
        //             "description": "**58%** emphasize guidance on digital usage for young adults and students."
        //           }
        //         ]
        //       }
        //     },
        //     {
        //       "id": "3261c8a1-4c97-48cc-ab23-b61b4c5cf4cd",
        //       "index": 12,
        //       "type": 10,
        //       "design_index": null,
        //       "images": null,
        //       "icons": null,
        //       "presentation": "5990dbb0-799a-484d-8c01-15c280d05ba5",
        //       "content": {
        //         "title": "Future Research Directions",
        //         "infographics": [
        //           {
        //             "title": "Broadened Demographics",
        //             "chart": {
        //               "chart_type": "progress-ring",
        //               "value": {
        //                 "number_type": "percentage",
        //                 "percentage": 68
        //               }
        //             },
        //             "description": "Expanding research to include more diverse demographic groups beyond college students can uncover social media's impact on different socio-economic and cultural profiles."
        //           },
        //           {
        //             "title": "Cross-Platform Impact",
        //             "chart": {
        //               "chart_type": "progress-ring",
        //               "value": {
        //                 "number_type": "percentage",
        //                 "percentage": 75
        //               }
        //             },
        //             "description": "Investigating various social media platforms beyond Facebook will help understand their distinct impacts on mental health."
        //           },
        //           {
        //             "title": "Modern Features Analysis",
        //             "chart": {
        //               "chart_type": "progress-ring",
        //               "value": {
        //                 "number_type": "percentage",
        //                 "percentage": 50
        //               }
        //             },
        //             "description": "Using insights from modern social network features, beyond their original implementation, can refine strategies for safe digital engagement."
        //           }
        //         ]
        //       }
        //     },
        //     {
        //       "id": "add3c702-1bac-4d49-ab14-b9aa7c4b8598",
        //       "index": 13,
        //       "type": 11,
        //       "design_index": null,
        //       "images": null,
        //       "icons": null,
        //       "presentation": "5990dbb0-799a-484d-8c01-15c280d05ba5",
        //       "content": {
        //         "title": "Social Media in Cultural Contexts",
        //         "description": "Examining the diverse influence of cultural contexts on social media's impact and mental health across societies. Highlights the need for culturally adaptive strategies in digital engagement.",
        //         "infographics": [
        //           {
        //             "title": "Developing Regions Negative Mental Health Indication",
        //             "chart": {
        //               "chart_type": "radial-progress",
        //               "value": {
        //                 "number_type": "percentage",
        //                 "percentage": 15
        //               }
        //             },
        //             "description": "Developing regions show a **15%** higher negative mental health indication compared to the minimal variance observed in Western societies."
        //           }
        //         ]
        //       }
        //     },
        //     {
        //       "id": "1f62d455-008d-4ff6-a558-8a528c8df91b",
        //       "index": 14,
        //       "type": 1,
        //       "design_index": null,
        //       "images": null,
        //       "icons": null,
        //       "presentation": "5990dbb0-799a-484d-8c01-15c280d05ba5",
        //       "content": {
        //         "title": "Summary and Final Thoughts",
        //         "body": "Facebook's introduction highlights significant mental health impacts on students, emphasizing a balance of benefits and risks. It's crucial for thoughtful engagement and policymaking.",
        //         "image_prompts": [
        //           "a thoughtful person sitting at a desk, surrounded by books and a laptop, gazing out of a window contemplating with a serene landscape, soft warm lighting"
        //         ]
        //       }
        //     }
        //   ]
        // }`
        //         const data = JSON.parse(rawData)
        //        return data

        try {
            const response = await fetch(`${DashboardApi.BASE_URL}/ppt/presentation?presentation_id=${id}&user_id=${user_id}`, {
                method: "GET",
            });
            if (response.status === 200) {
                const data = await response.json();
                return data;
            }
            throw new Error("Presentation not found");
        } catch (error) {
            console.error('Error fetching presentations:', error);
            throw error;
        }
    }
    static async deletePresentation(user_id: string, presentation_id: string) {
        try {
            const response = await fetch(`${DashboardApi.BASE_URL}/ppt/delete?user_id=${user_id}&presentation_id=${presentation_id}`, {
                method: 'DELETE',
                headers: getHeader()
            });

            if (response.status === 204) {
                return true
            }
            return false

        } catch (error) {
            console.error('Error deleting presentation:', error);
            throw error;
        }
    }
    static async setSlideThumbnail(presentation_id: string, file: any) {
        const formData = new FormData();

        formData.append('presentation_id', presentation_id);
        formData.append('thumbnail', file);
        try {
            const response = await fetch(`${DashboardApi.BASE_URL}/ppt/presentation/thumbnail`, {
                method: 'POST',
                headers: getHeaderForFormData(),
                body: formData,
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error setting slide thumbnail:', error);
            throw error;
        }
    }
}
