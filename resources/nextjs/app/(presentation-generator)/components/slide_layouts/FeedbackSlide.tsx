import React, { useState } from "react";
import { Sparkles, Frown, Meh, SmilePlus, X } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { usePathname } from "next/navigation";
import { PresentationFeedbackService } from "../../services/presentationFeedback";
import { toast } from "@/hooks/use-toast";

const FeedbackSlide = ({
  showFeedback,
  setShowFeedback,
}: {
  showFeedback: boolean;
  setShowFeedback: (showFeedback: boolean) => void;
}) => {
  const [selectedFeedback, setSelectedFeedback] = useState<
    "not-great" | "okay" | "great" | null
  >(null);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const { user } = useSelector((state: RootState) => state.auth);
  const path = usePathname();
  const [inputText, setInputText] = useState<string>("");

  const improvementOptions = [
    "Image quality",
    "Writing quality",
    "Inaccurate",
    "Missing text",
    "Amount of text",
    "Layouts and templates",
    "Fonts and colors",
    "Content relevance",
    "Chart/graph quality",
    "Infographics styling",
    "Loading speed",
    "Other",
  ];

  const sendFeedback = async (rating: string) => {
    const data = {
      tags: selectedOptions,
      rating: rating,
      feedback: inputText,
    };
    await PresentationFeedbackService.saveFeedback(
      user?.id || "",
      user?.email || "",
      path,
      data
    );
  };

  const handleFeedbackClick = (type: "not-great" | "okay" | "great") => {
    setSelectedFeedback(type);
    if (type === "great") {
      // For 'great' rating, send feedback immediately
      sendFeedback(type).then(() => {
        toast({
          title: "Thank you for your feedback!",
          variant: "success",
        });
        setShowFeedback(false);
      });
    }
  };

  const handleOptionToggle = (option: string) => {
    setSelectedOptions((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option]
    );
  };

  const handleSubmitFeedback = async () => {
    if (
      selectedFeedback &&
      (selectedOptions.length > 0 || inputText.length > 0)
    ) {
      await sendFeedback(selectedFeedback);
      toast({
        title: "Thank you for your feedback!",
        variant: "success",
      });
      setShowFeedback(false);
    }
  };

  const handleSkip = async () => {
    if (selectedFeedback) {
      await sendFeedback(selectedFeedback);
      toast({
        title: "Thank you for your feedback!",
        variant: "success",
      });
      setShowFeedback(false);
    }
  };

  const handleHide = async () => {
    if (
      selectedFeedback &&
      (selectedOptions.length > 0 || inputText.length > 0)
    ) {
      await sendFeedback(selectedFeedback);
      toast({
        title: "Thank you for your feedback!",
        variant: "success",
      });
    }
    setShowFeedback(false);
  };

  return (
    <div className="font-inter w-full slide-container rounded-lg max-w-[1280px] shadow-xl md:px-20 py-16   flex  items-center justify-center aspect-video  relative">
      <div className="text-center  w-full   max-w-xl px-4 py-8 rounded-lg shadow-lg border group">
        <h2 className="text-xl slide-title font-bold text-gray-800">
          Please rate the generated presentation.
        </h2>

        <div className="flex gap-8 max-w-xs  mt-10  mx-auto justify-center">
          <button
            className={`w-1/3 group py-1  ${
              selectedFeedback === "not-great"
                ? "ring-2 ring-red-400 bg-red-500/30"
                : ""
            }`}
            onClick={() => handleFeedbackClick("not-great")}
          >
            <Frown
              className={`w-10 h-10 mx-auto   ${
                selectedFeedback === "not-great"
                  ? "text-red-500"
                  : "text-red-400 group-hover:text-red-500"
              } transition-colors`}
            />
            <span className="text-sm slide-heading ">Not Great</span>
          </button>

          <button
            className={`w-1/3  py-1 group ${
              selectedFeedback === "okay"
                ? "ring-2 ring-yellow-400 bg-yellow-500/50"
                : ""
            }`}
            onClick={() => handleFeedbackClick("okay")}
          >
            <Meh
              className={`w-10 h-10 mx-auto ${
                selectedFeedback === "okay"
                  ? "text-yellow-600"
                  : "text-yellow-400 group-hover:text-yellow-500"
              } transition-colors`}
            />
            <span className="text-sm slide-heading ">Okay</span>
          </button>

          <button
            className={` w-1/3  py-1 group ${
              selectedFeedback === "great"
                ? "ring-2 ring-green-400 bg-green-500/50"
                : ""
            }`}
            onClick={() => handleFeedbackClick("great")}
          >
            <SmilePlus
              className={`w-10 h-10 mx-auto ${
                selectedFeedback === "great"
                  ? "text-green-500"
                  : "text-green-400 group-hover:text-green-500"
              } transition-colors`}
            />
            <span className="text-sm slide-heading ">Great!</span>
          </button>
        </div>
        {selectedFeedback && (
          <p className="text-green-600 mt-4">Thanks for your feedback.</p>
        )}
        {(selectedFeedback === "not-great" || selectedFeedback === "okay") && (
          <div className="space-y-6 mt-4">
            <div className="text-start">
              <h3 className="text-sm font-semibold text-gray-800 mb-2 slide-heading">
                What could be improved?
              </h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {improvementOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleOptionToggle(option)}
                    className={`px-2 py-1  rounded-sm text-sm transition-colors ${
                      selectedOptions.includes(option)
                        ? "bg-purple-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Is there anything else we should know?"
              className="w-full p-3 text-gray-400 border rounded-lg  bg-transparent ring-2 resize-none h-24 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <div className="flex justify-center gap-10 items-center">
              <button onClick={handleSkip} className="text-lg slide-heading ">
                Skip
              </button>
              <button
                disabled={
                  inputText.length === 0 && selectedOptions.length === 0
                }
                onClick={handleSubmitFeedback}
                className=" py-3 px-10 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit
              </button>
            </div>
          </div>
        )}

        <button onClick={handleHide} className="text-lg slide-heading mt-6">
          Hide
        </button>
      </div>
    </div>
  );
};

export default FeedbackSlide;
