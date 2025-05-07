import { useTypewriter } from "@/hooks/useTypeWriter";

const Typewriter = ({ text, speed }: { text: string; speed: number }) => {
  console.log("called here TypeWriter");
  const { displayText, isCursorVisible } = useTypewriter(text, speed, true);

  return (
    <p>
      {displayText}
      {isCursorVisible && <span className="slide-title">|</span>}
    </p>
  );
};

export default Typewriter;
