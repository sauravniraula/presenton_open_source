import { useState, useEffect } from "react";

export const useTypewriter = (text: string, speed = 50) => {
  const [displayText, setDisplayText] = useState("");
  const [isCursorVisible, setIsCursorVisible] = useState(true);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setDisplayText(""); // Reset text
    setIndex(0); // Reset index
    setIsCursorVisible(true); // Ensure cursor is visible
  }, [text]); // Reset when text changes

  useEffect(() => {
    if (index >= text.length) {
      setIsCursorVisible(false);
      return;
    }

    const timeout = setTimeout(() => {
      setDisplayText((prev) => prev + text.charAt(index));
      setIndex((prev) => prev + 1);
    }, speed);

    return () => clearTimeout(timeout); // Cleanup
  }, [index, text, speed]); // Runs whenever index changes

  return { displayText, isCursorVisible };
};
