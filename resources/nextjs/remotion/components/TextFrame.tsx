'use client';

import React from "react";
import { TextFrameProps, ParagraphData, ShapeData, RunProps, BulletInfo } from "../types/slideTypes";
import { getShapeStyle, getParagraphStyle, getRunStyle, getBulletStyle } from "../utils/styleHelpers";
import { useRemotionAnimation } from "../hooks/useRemotionAnimation";

const getBulletChar = (bullet: BulletInfo) => {
  const value = bullet.start_value + bullet.current_value;
  switch (bullet.type_description) {
    case 'CHAR':
      if (bullet.char == '') {
        return '•';
      }
      return bullet.char;
    case 'NUMBER':
      return value;
    case 'CHAR_UPPER_LETTER':
      return String.fromCharCode(64 + value);
    case 'CHAR_LOWER_LETTER':
      return String.fromCharCode(96 + value);
    case 'CHAR_UPPER_ROMAN':
      return toRoman(value).toUpperCase();
    case 'CHAR_LOWER_ROMAN':
      return toRoman(value).toLowerCase();
    default:
      return '';
  }
};

const toRoman = (num: number) => {
  const roman = { M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90, L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1 };
  let str = '';
  for (let i of Object.keys(roman)) {
    let q = Math.floor(num / (roman as any)[i]);
    num -= q * (roman as any)[i];
    str += i.repeat(q);
  }
  return str;
};

const Bullet: React.FC<{ bullet: BulletInfo }> = ({ bullet }) => {
  const bulletStyle = getBulletStyle(bullet);
  const bulletChar = getBulletChar(bullet);
  console.log(bulletStyle)
  console.log(bulletChar)

  const bulletTextStyle = {
    ...bulletStyle,
  };

  // try{
  //   var bulletCharCode = bulletChar.charCodeAt(0);
  // }
  // catch{
  //   var bulletCharCode = '•';
  // }
  
  return (
    <div style={bulletTextStyle}>
      {bullet.prefix}
      <div>{bulletChar}</div>
      {bullet.suffix}
    </div>
  );
};

const Run: React.FC<{ run: RunProps; isBold?: boolean }> = ({ run, isBold }) => {
  const style = {
    ...getRunStyle(run),
    fontFamily: `"${run.font_name}", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`,
    fontDisplay: 'swap' as const,
    fontWeight: isBold ? 'bold' : run.bold ? 'bold' : 'normal',
  };
  return <span style={style}>{run.text}</span>;
};

const Paragraph: React.FC<{ paragraph: ParagraphData; index: number }> = 
  ({ paragraph, index }) => {
  const paragraphStyle = getParagraphStyle(paragraph);
  const getAnimationStyle = useRemotionAnimation(paragraph, true);
  const animatedStyle = getAnimationStyle();

  return (
    <div style={{
      ...paragraphStyle,
      ...animatedStyle,
      display: 'flex',
      alignItems: 'flex-start',
    }} data-paragraph-index={index}>
      {paragraph.bullet_info.visible && (
        <div style={{
          flexShrink: 0,
          width: `${paragraph.bullet_info.indent.value}${paragraph.bullet_info.indent.unit}`,
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'flex-start',
        }}>
          <Bullet bullet={paragraph.bullet_info} />
        </div>
      )}
      <div style={{
        flex: 1,
        paddingLeft: paragraph.bullet_info.visible ? '0.5em' : '0',
        ...(paragraph.animationType === 'typewriter' ? { overflow: 'hidden' } : {}),
      }}>
        {paragraph.runs.map((run, runIndex) => (
          <Run key={runIndex} run={run} isBold={animatedStyle.isBold} />
        ))}
      </div>
    </div>
  );
};

export const TextFrame: React.FC<TextFrameProps & { shape: ShapeData }> = ({ textFrame, shape }) => {
  const shapeStyle = getShapeStyle(shape);
  const getAnimationStyle = useRemotionAnimation(shape);
  const animatedStyle = getAnimationStyle();

  const containerStyle: React.CSSProperties = {
    ...shapeStyle,
    ...animatedStyle,
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: shape.vertical_alignment === 'bottom' ? 'flex-end' : 
                   shape.vertical_alignment === 'middle' ? 'center' : 
                   'flex-start',
    zIndex: shape.animationType === 'scaleUp' ? 100 : 'auto',
    position: shape.animationType === 'scaleUp' ? 'relative' : 'static',
  };

  return (
    <div style={containerStyle}>
      {textFrame.paragraphs.map((paragraph, index) => (
        <Paragraph 
          key={index} 
          paragraph={paragraph} 
          index={index}
        />
      ))}
    </div>
  );
};

TextFrame.displayName = 'TextFrame';
