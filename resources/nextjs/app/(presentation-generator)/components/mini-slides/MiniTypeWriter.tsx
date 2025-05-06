import { useTypewriter } from "@/hooks/useTypeWriter";
import { RootState } from "@/store/store";
import { useSelector } from "react-redux";

const MiniTypeWriter = ({ text }: { text: string }) => {
    const { displayText, isCursorVisible } = useTypewriter(text, 20);
    const { isStreaming } = useSelector((state: RootState) => state.presentationGeneration);

    return <span>{isStreaming ? displayText : text}</span>;
};

export default MiniTypeWriter;