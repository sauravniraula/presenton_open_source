'use client';

import React from 'react';
import { Group, Text, Transformer } from 'react-konva';
import { ParagraphData, RunProps } from '@/remotion/types/slideTypes';

interface ParagraphProps {
  paragraph: ParagraphData;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (newProps: Partial<ParagraphData>) => void;
}

const Paragraph: React.FC<ParagraphProps> = ({ paragraph, isSelected, onSelect, onChange }) => {
  const groupRef = React.useRef<any>();
  const trRef = React.useRef<any>();

  React.useEffect(() => {
    if (isSelected && groupRef.current) {
      trRef.current.nodes([groupRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  const handleDragEnd = (e: any) => {
    onChange({
      position_x: { ...paragraph.position_x, value: e.target.x() },
      position_y: { ...paragraph.position_y, value: e.target.y() },
    });
  };

  const handleTransformEnd = (e: any) => {
    const node = groupRef.current;
    onChange({
      width: { ...paragraph.width, value: node.width() },
      height: { ...paragraph.height, value: node.height() },
      position_x: { ...paragraph.position_x, value: node.x() },
      position_y: { ...paragraph.position_y, value: node.y() },
    });
  };

  const paragraphWidth = paragraph.width?.value || 200;
  const lineHeight = paragraph.runs[0]?.font_size || 16;

  // Splitting runs into words to handle wrapping
  const words = paragraph.runs.flatMap((run) =>
    run.text.split(' ').map((word, i, arr) => ({
      ...run,
      text: i < arr.length - 1 ? word + ' ' : word,
    }))
  );

  // Calculating lines
  let lines: { runs: RunProps[] }[] = [];
  let currentLineRuns: RunProps[] = [];
  let currentLineWidth = 0;

  words.forEach((wordRun) => {
    const tempText = new window.Konva.Text({
      text: wordRun.text,
      fontSize: wordRun.font_size,
      fontFamily: wordRun.font_name,
      fontStyle: wordRun.bold ? 'bold' : 'normal',
      fontVariant: wordRun.italic ? 'italic' : 'normal',
      textDecoration: wordRun.underline ? 'underline' : '',
    });
    const wordWidth = tempText.width();

    if (currentLineWidth + wordWidth > paragraphWidth && currentLineRuns.length > 0) {
      // Start a new line
      lines.push({ runs: currentLineRuns });
      currentLineRuns = [wordRun];
      currentLineWidth = wordWidth;
    } else {
      // Continue in the current line
      currentLineRuns.push(wordRun);
      currentLineWidth += wordWidth;
    }
  });

  // Add the last line
  if (currentLineRuns.length > 0) {
    lines.push({ runs: currentLineRuns });
  }

  return (
    <>
      <Group
        ref={groupRef}
        x={paragraph.position_x.value}
        y={paragraph.position_y.value}
        draggable
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
        onClick={onSelect}
        onTap={onSelect}
      >
        {lines.map((line, lineIndex) => {
          let currentX = 0;
          return (
            <Group key={lineIndex} y={lineIndex * lineHeight}>
              {line.runs.map((run, runIndex) => {
                const textProps = {
                  text: run.text,
                  fill: `rgba(${run.color.red}, ${run.color.green}, ${run.color.blue}, ${
                    run.color.alpha || 1
                  })`,
                  fontFamily: run.font_name,
                  fontSize: run.font_size,
                  fontStyle: run.bold ? 'bold' : 'normal',
                  fontVariant: run.italic ? 'italic' : 'normal',
                  textDecoration: run.underline ? 'underline' : '',
                };
                // Measure text width
                const tempText = new window.Konva.Text({
                  text: run.text,
                  ...textProps,
                });
                const textWidth = tempText.width();

                const textNode = (
                  <Text key={runIndex} x={currentX} y={0} {...textProps} />
                );
                currentX += textWidth;
                return textNode;
              })}
            </Group>
          );
        })}
      </Group>
      {isSelected && (
        <Transformer
          ref={trRef}
          nodes={[groupRef.current]}
          boundBoxFunc={(oldBox: any, newBox: any) => {
            if (newBox.width < 50 || newBox.height < 20) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
};

interface TextFrameProps {
  paragraphs: ParagraphData[];
  selectedParagraphId: number | null;
  onSelectParagraph: (index: number) => void;
  onChangeParagraph: (index: number, newProps: Partial<ParagraphData>) => void;
}

const TextFrame: React.FC<TextFrameProps> = ({
  paragraphs,
  selectedParagraphId,
  onSelectParagraph,
  onChangeParagraph,
}) => {
  return (
    <>
      {paragraphs.map((paragraph, index) => (
        <Paragraph
          key={index}
          paragraph={paragraph}
          isSelected={selectedParagraphId === index}
          onSelect={() => onSelectParagraph(index)}
          onChange={(newProps) => onChangeParagraph(index, newProps)}
        />
      ))}
    </>
  );
};

export default TextFrame;
