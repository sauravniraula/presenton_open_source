import { useVideoConfig } from "remotion";
import { ParagraphData, RunProps, ShapeData, BulletInfo } from "../types/slideTypes";

export const getShapeStyle = (shape: ShapeData) => {
  const style: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: shape.vertical_alignment === 'bottom' ? 'flex-end' : 
                   shape.vertical_alignment === 'middle' ? 'center' : 
                   'flex-start',
    overflow: 'visible',
  };

  return style;
};

export const getShapePosition = (shape: ShapeData): React.CSSProperties => {
  return {
    position: 'absolute',
    width: `${shape.width.value}${shape.width.unit}`,
    height: `${shape.height.value}${shape.height.unit}`,
    left: `${shape.position_x.value}${shape.position_x.unit}`,
    top: `${shape.position_y.value}${shape.position_y.unit}`,
    transform: shape.rotation ? `rotate(${shape.rotation.value}${shape.rotation.unit})` : undefined,
  };
};

export const getParagraphStyle = (paragraph: ParagraphData) => {
  let style = {
    textAlign: paragraph.alignment as any,
    // paddingTop: `${paragraph.padding.top.value}${paragraph.padding.top.unit}`,
    paddingBottom: `${paragraph.padding.bottom.value}${paragraph.padding.bottom.unit}`,
    paddingLeft: `${paragraph.padding.left.value}${paragraph.padding.left.unit}`,
    paddingRight: `${paragraph.padding.right.value}${paragraph.padding.right.unit}`,
    // lineHeight: `${paragraph.line_height.value}${paragraph.line_height.unit}`,
    whiteSpace: 'pre-wrap' as const,
    wordWrap: 'break-word' as const,
    overflow: 'visible',
  };

  return style;
};

export const getRunStyle = (run: RunProps) => {
  const style: React.CSSProperties = {
    fontFamily: run.font_name,
    fontSize: `${run.font_size}px`,
    fontWeight: run.bold ? 'bold' : 'normal',
    fontStyle: run.italic ? 'italic' : 'normal',
    textDecoration: run.underline ? 'underline' : 'none',
    color: `rgba(${run.color.red}, ${run.color.green}, ${run.color.blue}, ${run.color.alpha || 1})`,
  };

  if (run.highlight_color) {
    style.backgroundColor = `rgba(${run.highlight_color.red}, ${run.highlight_color.green}, ${run.highlight_color.blue}, ${run.highlight_color.alpha})`;
  }

  return style;
};

export const getBulletStyle = (bullet: BulletInfo) => {
  const bulletSize = bullet.bullet_size_percent 
    ? `${bullet.font_size.value * (bullet.bullet_size_percent / 100)}${bullet.font_size.unit}`
    : `${bullet.font_size.value}${bullet.font_size.unit}`;

  const bulletColor = bullet.color 
    ? `rgba(${bullet.color.red}, ${bullet.color.green}, ${bullet.color.blue}, ${bullet.color.alpha || 1})`
    : bullet.bullet_color
    ? `rgba(${bullet.bullet_color.red}, ${bullet.bullet_color.green}, ${bullet.bullet_color.blue}, ${bullet.bullet_color.alpha || 1})`
    : 'inherit';
  


  return {
    display: 'inline-block',
    fontFamily: bullet.font_name,
    fontWeight: bullet.bold ? 'bold' : 'normal',
    fontStyle: bullet.italic ? 'italic' : 'normal',
    textDecoration: bullet.underline ? 'underline' : 'none',
    color: bulletColor,
    // lineHeight: 1,
    textAlign: 'right' as const,
    paddingRight: '0.25em',
  };
};
