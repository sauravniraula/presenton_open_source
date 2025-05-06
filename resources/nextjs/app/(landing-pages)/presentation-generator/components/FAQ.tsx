"use client";
import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Wrapper from "@/components/Wrapper";
import { Heading4 } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "What is Presenton.ai?",
    answer:
      "Presenton is your AI-powered presentation assistant that helps you create stunning, professional slides in minutes — from any idea, topic, or content. Whether it’s for a pitch, a class, a client, or a team meeting, Presenton makes it super easy to turn your thoughts into beautifully designed slides without spending hours on formatting or design. Just add your input, and we handle the rest — visuals, structure, flow, and even talking points.",
  },
  {
    question: "What types of files can I upload to Presenton.ai?",
    answer: "You can upload PDFs and images to Presenton.ai.",
  },
  {
    question: "Is my data secure on Presenton.ai?",
    answer: "Yes, all data is secure with Presenton.ai.",
  },
  {
    question: "Can I customize the presentations created by Presenton.ai?",
    answer: "Yes, you can customize each slide with a prompt.",
  },
  {
    question: "Does Presenton.ai create visuals and charts?",
    answer:
      "Yes, charts are one of our main features. Presenton.ai automatically extracts data from files to create charts. These charts can also be edited using a visual editor or through prompts.",
  },
  {
    question: "Who can benefit from using Presenton.ai?",
    answer:
      "Anyone who needs to present data or insights from data in any form can benefit from using Presenton.ai.",
  },
  {
    question: "Do I need design skills to use Presenton.ai?",
    answer:
      "No, you don’t need design skills. Simply pick a theme, and Presenton.ai will create a beautiful and polished presentation for you within minutes.",
  },
  {
    question: "Can I collaborate with my team using Presenton.ai?",
    answer:
      "Not for now. However, we can add this feature if it’s something you want.",
  },
  {
    question: "Is there a free version of Presenton.ai?",
    answer: "Yes, you can create up to 5 presentations for free every month.",
  },
  {
    question:
      "How long does it take to create a presentation with Presenton.ai?",
    answer:
      "Most of our users receive a polished and edited presentation in under 2 minutes.",
  },
  {
    question: "What sets Presenton.ai apart from other presentation tools?",
    answer:
      "Presenton.ai is uniquely focused on users who work with data, making it the ideal tool for creating data-driven presentations.",
  },
  {
    question: "Is there a limit to the file size I can upload?",
    answer:
      "The free version has some limitations on file size, but there is no limit in the paid version.",
  },
  {
    question:
      "What happens to my presentation if the AI makes a mistake in summarizing data?",
    answer:
      "You can always edit your presentation using prompts if anything goes wrong.",
  },
  {
    question:
      "Can I integrate Presenton.ai with other tools like Google Drive or Microsoft Office?",
    answer: "We will be adding this feature shortly.",
  },
  {
    question: "Does Presenton.ai support multiple languages?",
    answer:
      "Yes, Presenton.ai supports all languages. Users can specify their desired language in the prompt for accurate results.",
  },
];

const FAQ = () => {
  return (
    <div id="faq" className="bg-black py-10 lg:py-20">
      <Wrapper>
        <h2 className="text-white lg:text-[56px]  text-xl sm:text-3xl md:text-[32px] font-switzer font-extrabold mb-8 sm:mb-10 md:mb-16">
          FAQs
        </h2>

        <Accordion type="single" collapsible className="space-y-4">
          {faqData.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="bg-[#1A1A1A] rounded-2xl  px-4 md:px-6 lg:px-8 border-none"
            >
              <AccordionTrigger className="hover:no-underline py-4 md:py-4 lg:py-6">
                <span className="text-white/90 font-switzer text-left font-medium text-sm sm:text-base md:text-xl lg:text-2xl">
                  {faq.question}
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-gray-400 text-xs sm:text-sm md:text-lg  font-base font-satoshi leading-relaxed pb-6">
                  {faq.answer}
                </p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Wrapper>
    </div>
  );
};

export default FAQ;
