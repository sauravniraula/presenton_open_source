import React, { useCallback, useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch } from '@/store/store';
import { updateShape, updateParagraph } from '@/store/slices/slideSlice';
import { setSelectedShape, setSelectedParagraph } from '@/store/slices/editorSlice';
import { ShapeData, ParagraphData, Position, Size } from '@/remotion/types/slideTypes';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from 'next/image';
import { selectCurrentSlide, selectShapes, selectSlideImages, selectSelectedShape } from '@/store/selectors';

const EditorBar: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const currentSlide = useSelector(selectCurrentSlide);
  const shapes = useSelector(selectShapes);
  const selectedShape = useSelector(selectSelectedShape);
  const slideImages = useSelector(selectSlideImages);

  const [activeTab, setActiveTab] = useState<'shape' | 'paragraph'>('shape');
  const [localSelectedParagraphIndex, setLocalSelectedParagraphIndex] = useState<number>(-1);

  const selectedParagraph = useMemo(() => 
    selectedShape?.text_frame?.paragraphs[localSelectedParagraphIndex],
    [selectedShape, localSelectedParagraphIndex]
  );

  const handleSelectShape = useCallback((shapeName: string) => {
    const shape = shapes.find(s => s.name === shapeName) || null;
    dispatch(setSelectedShape(shape));
    dispatch(setSelectedParagraph(null));
    setActiveTab('shape');
    setLocalSelectedParagraphIndex(-1);
  }, [shapes, dispatch]);

  const handleSelectParagraph = useCallback((paragraphIndex: number) => {
    if (selectedShape && selectedShape.text_frame) {
      const paragraph = selectedShape.text_frame.paragraphs[paragraphIndex] || null;
      if (paragraph) {
        dispatch(setSelectedParagraph(paragraph));
        setActiveTab('paragraph');
        setLocalSelectedParagraphIndex(paragraphIndex);
      }
    }
  }, [selectedShape, dispatch]);

  const handleShapeChange = useCallback((property: string, value: any) => {
    if (selectedShape) {
      dispatch(updateShape({ 
        slideIndex: currentSlide?.index || 0,
        shapeId: selectedShape.name, 
        updates: { [property]: value } 
      }));
    }
  }, [selectedShape, currentSlide, dispatch]);

  const handleParagraphChange = useCallback((property: string, value: any) => {
    if (selectedShape && localSelectedParagraphIndex !== -1) {
      dispatch(updateParagraph({
        slideIndex: currentSlide?.index || 0,
        shapeId: selectedShape.name,
        paragraphIndex: localSelectedParagraphIndex,
        updates: { [property]: value }
      }));
    }
  }, [selectedShape, localSelectedParagraphIndex, currentSlide, dispatch]);

  const handlePositionChange = useCallback((axis: 'x' | 'y', value: number) => {
    if (selectedShape) {
      const property = axis === 'x' ? 'position_x' : 'position_y';
      handleShapeChange(property, { ...selectedShape[property], value });
    }
  }, [selectedShape, handleShapeChange]);

  const handleSizeChange = useCallback((dimension: 'width' | 'height', value: number) => {
    if (selectedShape) {
      handleShapeChange(dimension, { value, unit: selectedShape[dimension].unit });
    }
  }, [selectedShape, handleShapeChange]);

  const handleParagraphPaddingChange = useCallback((side: 'top' | 'bottom' | 'left' | 'right', value: number) => {
    if (selectedShape && localSelectedParagraphIndex !== -1 && selectedParagraph) {
      dispatch(updateParagraph({
        slideIndex: currentSlide?.index || 0,
        shapeId: selectedShape.name,
        paragraphIndex: localSelectedParagraphIndex,
        updates: { 
          padding: {
            ...selectedParagraph.padding,
            [side]: { value, unit: 'px' }
          }
        }
      }));
    }
  }, [selectedShape, localSelectedParagraphIndex, currentSlide, dispatch, selectedParagraph]);

  const handleRunChange = useCallback((runIndex: number, property: string, value: any) => {
    if (selectedShape && localSelectedParagraphIndex !== -1 && selectedParagraph) {
      const updatedRuns = [...selectedParagraph.runs];
      updatedRuns[runIndex] = {
        ...updatedRuns[runIndex],
        [property]: value
      };
      dispatch(updateParagraph({
        slideIndex: currentSlide?.index || 0,
        shapeId: selectedShape.name,
        paragraphIndex: localSelectedParagraphIndex,
        updates: { runs: updatedRuns }
      }));
    }
  }, [selectedShape, localSelectedParagraphIndex, currentSlide, dispatch, selectedParagraph]);

  const handleParagraphAnimationChange = useCallback((property: string, value: any) => {
    if (selectedShape && localSelectedParagraphIndex !== -1) {
      dispatch(updateParagraph({
        slideIndex: currentSlide?.index || 0,
        shapeId: selectedShape.name,
        paragraphIndex: localSelectedParagraphIndex,
        updates: { [property]: value }
      }));
    }
  }, [selectedShape, localSelectedParagraphIndex, currentSlide, dispatch]);

  if (!currentSlide) {
    return <div>Loading...</div>;
  }

  return (
    <Card className="w-[350px] h-full overflow-y-auto">
      <CardHeader>
        <CardTitle>Editor</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="shape-select">Select Shape</Label>
            <Select onValueChange={handleSelectShape} value={selectedShape?.name || ''}>
              <SelectTrigger id="shape-select">
                <SelectValue placeholder="Select a shape" />
              </SelectTrigger>
              <SelectContent>
                {shapes.map(shape => (
                  <SelectItem key={shape.name} value={shape.name}>
                    <div className="flex items-center">
                      {slideImages[shape.name] && (
                        <div className="relative w-8 h-8 mr-2">
                          <Image
                            src={slideImages[shape.name]}
                            alt={shape.name}
                            fill
                            sizes="32px"
                            style={{ objectFit: 'contain' }}
                          />
                        </div>
                      )}
                      <span>{shape.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedShape && (
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'shape' | 'paragraph')}>
              <TabsList>
                <TabsTrigger value="shape">Shape</TabsTrigger>
                {selectedShape.has_text && <TabsTrigger value="paragraph">Paragraph</TabsTrigger>}
              </TabsList>
              <TabsContent value="shape">
                <div className="space-y-4">
                  {/* Position controls */}
                  <div>
                    <Label htmlFor="shape-position-x">Position X</Label>
                    <Input
                      id="shape-position-x"
                      type="number"
                      value={selectedShape.position_x.value}
                      onChange={(e) => handlePositionChange('x', Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="shape-position-y">Position Y</Label>
                    <Input
                      id="shape-position-y"
                      type="number"
                      value={selectedShape.position_y.value}
                      onChange={(e) => handlePositionChange('y', Number(e.target.value))}
                    />
                  </div>

                  {/* Size controls */}
                  <div>
                    <Label htmlFor="shape-width">Width</Label>
                    <Input
                      id="shape-width"
                      type="number"
                      value={selectedShape.width.value}
                      onChange={(e) => handleSizeChange('width', Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="shape-height">Height</Label>
                    <Input
                      id="shape-height"
                      type="number"
                      value={selectedShape.height.value}
                      onChange={(e) => handleSizeChange('height', Number(e.target.value))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="shape-animation-type">Animation Type</Label>
                    <Select
                      onValueChange={(value) => handleShapeChange('animationType', value)}
                      value={selectedShape.animationType || 'none'}
                    >
                      <SelectTrigger id="shape-animation-type">
                        <SelectValue placeholder="Select animation type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="scaleUp">Scale Up</SelectItem>
                        <SelectItem value="slideInLeft">Slide In Left</SelectItem>
                        <SelectItem value="slideInRight">Slide In Right</SelectItem>
                        <SelectItem value="fadeIn">Fade In</SelectItem>
                        <SelectItem value="wiggle">Wiggle</SelectItem>
                        <SelectItem value="typewriter">Typewriter</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="shape-animation-delay">Animation Delay (seconds)</Label>
                    <Input
                      id="shape-animation-delay"
                      type="number"
                      value={selectedShape.animationDelay}
                      onChange={(e) => handleShapeChange('animationDelay', Number(e.target.value))}
                      min="0"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="shape-animation-duration">Animation Duration (seconds)</Label>
                    <Input
                      id="shape-animation-duration"
                      type="number"
                      value={selectedShape.animationDuration}
                      onChange={(e) => handleShapeChange('animationDuration', Number(e.target.value))}
                      min="0"
                      step="0.1"
                    />
                  </div>
                  {selectedShape.has_text && (
                    <div>
                      <Label htmlFor="shape-vertical-alignment">Vertical Alignment</Label>
                      <Select
                        onValueChange={(value) => handleShapeChange('vertical_alignment', value)}
                        value={selectedShape.vertical_alignment || 'top'}
                      >
                        <SelectTrigger id="shape-vertical-alignment">
                          <SelectValue placeholder="Select vertical alignment" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="top">Top</SelectItem>
                          <SelectItem value="middle">Middle</SelectItem>
                          <SelectItem value="bottom">Bottom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div>
                    <Label htmlFor="shape-autofit">Autofit</Label>
                    <Select
                      onValueChange={(value) => handleShapeChange('autofit', value)}
                      value={selectedShape.autofit}
                    >
                      <SelectTrigger id="shape-autofit">
                        <SelectValue placeholder="Select autofit option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Shrink Text on Overflow">Shrink Text on Overflow</SelectItem>
                        <SelectItem value="Do Not Autofit">Do Not Autofit</SelectItem>
                        <SelectItem value="Resize Shape to Fit Text">Resize Shape to Fit Text</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="paragraph">
                {selectedShape.has_text && selectedShape.text_frame && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="paragraph-select">Select Paragraph</Label>
                      <Select onValueChange={(value) => handleSelectParagraph(Number(value))} value={String(localSelectedParagraphIndex)}>
                        <SelectTrigger id="paragraph-select">
                          <SelectValue placeholder="Select a paragraph" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedShape.text_frame.paragraphs.map((paragraph, index) => (
                            <SelectItem key={index} value={String(index)}>
                              Paragraph {index + 1}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {selectedParagraph && (
                      <>
                        <div>
                          <Label htmlFor="paragraph-animation-type">Animation Type</Label>
                          <Select
                            onValueChange={(value) => handleParagraphAnimationChange('animationType', value)}
                            value={selectedParagraph?.animationType || 'none'}
                          >
                            <SelectTrigger id="paragraph-animation-type">
                              <SelectValue placeholder="Select animation type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              <SelectItem value="scaleUp">Scale Up</SelectItem>
                              <SelectItem value="slideInLeft">Slide In Left</SelectItem>
                              <SelectItem value="slideInRight">Slide In Right</SelectItem>
                              <SelectItem value="fadeIn">Fade In</SelectItem>
                              <SelectItem value="wiggle">Wiggle</SelectItem>
                              <SelectItem value="typewriter">Typewriter</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="paragraph-animation-delay">Animation Delay (s)</Label>
                          <Input
                            id="paragraph-animation-delay"
                            type="number"
                            value={selectedParagraph?.animationDelay || 0}
                            onChange={(e) => handleParagraphAnimationChange('animationDelay', Number(e.target.value))}
                            min="0"
                            step="0.1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="paragraph-animation-duration">Animation Duration (s)</Label>
                          <Input
                            id="paragraph-animation-duration"
                            type="number"
                            value={selectedParagraph?.animationDuration || 1}
                            onChange={(e) => handleParagraphAnimationChange('animationDuration', Number(e.target.value))}
                            min="0.1"
                            step="0.1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="paragraph-alignment">Alignment</Label>
                          <Select
                            onValueChange={(value) => handleParagraphChange('alignment', value)}
                            value={selectedParagraph?.alignment || 'left'}
                          >
                            <SelectTrigger id="paragraph-alignment">
                              <SelectValue placeholder="Select alignment" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="left">Left</SelectItem>
                              <SelectItem value="center">Center</SelectItem>
                              <SelectItem value="right">Right</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="paragraph-margin-top">Margin Top (px)</Label>
                          <Input
                            id="paragraph-margin-top"
                            type="number"
                            value={selectedParagraph?.margin?.top?.value || 0}
                            onChange={(e) => handleParagraphChange('margin', { 
                              ...selectedParagraph?.margin,
                              top: { value: Number(e.target.value), unit: 'px' }
                            })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="paragraph-margin-bottom">Margin Bottom (px)</Label>
                          <Input
                            id="paragraph-margin-bottom"
                            type="number"
                            value={selectedParagraph?.margin?.bottom?.value || 0}
                            onChange={(e) => handleParagraphChange('margin', { 
                              ...selectedParagraph?.margin,
                              bottom: { value: Number(e.target.value), unit: 'px' }
                            })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="paragraph-margin-left">Margin Left (px)</Label>
                          <Input
                            id="paragraph-margin-left"
                            type="number"
                            value={selectedParagraph?.margin?.left?.value || 0}
                            onChange={(e) => handleParagraphChange('margin', { 
                              ...selectedParagraph?.margin,
                              left: { value: Number(e.target.value), unit: 'px' }
                            })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="paragraph-margin-right">Margin Right (px)</Label>
                          <Input
                            id="paragraph-margin-right"
                            type="number"
                            value={selectedParagraph?.margin?.right?.value || 0}
                            onChange={(e) => handleParagraphChange('margin', { 
                              ...selectedParagraph?.margin,
                              right: { value: Number(e.target.value), unit: 'px' }
                            })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="paragraph-padding-top">Padding Top (px)</Label>
                          <Input
                            id="paragraph-padding-top"
                            type="number"
                            value={selectedParagraph?.padding.top.value || 0}
                            onChange={(e) => handleParagraphPaddingChange('top', Number(e.target.value))}
                          />
                        </div>
                        {/* Add similar inputs for margin_bottom, margin_left, and margin_right */}
                      </>
                    )}
                    {selectedParagraph && selectedParagraph.runs.map((run, runIndex) => (
                      <div key={runIndex}>
                        <h4>Run {runIndex + 1}</h4>
                        <div>
                          <Label htmlFor={`run-text-${runIndex}`}>Text</Label>
                          <Input
                            id={`run-text-${runIndex}`}
                            type="text"
                            value={run.text}
                            onChange={(e) => handleRunChange(runIndex, 'text', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`run-font-name-${runIndex}`}>Font Name</Label>
                          <Input
                            id={`run-font-name-${runIndex}`}
                            type="text"
                            value={run.font_name}
                            onChange={(e) => handleRunChange(runIndex, 'font_name', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`run-font-size-${runIndex}`}>Font Size</Label>
                          <Input
                            id={`run-font-size-${runIndex}`}
                            type="number"
                            value={run.font_size}
                            onChange={(e) => handleRunChange(runIndex, 'font_size', Number(e.target.value))}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`run-bold-${runIndex}`}>Bold</Label>
                          <input
                            id={`run-bold-${runIndex}`}
                            type="checkbox"
                            checked={run.bold}
                            onChange={(e) => handleRunChange(runIndex, 'bold', e.target.checked)}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`run-italic-${runIndex}`}>Italic</Label>
                          <input
                            id={`run-italic-${runIndex}`}
                            type="checkbox"
                            checked={run.italic}
                            onChange={(e) => handleRunChange(runIndex, 'italic', e.target.checked)}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`run-underline-${runIndex}`}>Underline</Label>
                          <input
                            id={`run-underline-${runIndex}`}
                            type="checkbox"
                            checked={run.underline}
                            onChange={(e) => handleRunChange(runIndex, 'underline', e.target.checked)}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`run-color-${runIndex}`}>Color</Label>
                          <Input
                            id={`run-color-${runIndex}`}
                            type="color"
                            value={`#${run.color.red.toString(16).padStart(2, '0')}${run.color.green.toString(16).padStart(2, '0')}${run.color.blue.toString(16).padStart(2, '0')}`}
                            onChange={(e) => {
                              const hex = e.target.value.substring(1);
                              const r = parseInt(hex.substring(0, 2), 16);
                              const g = parseInt(hex.substring(2, 4), 16);
                              const b = parseInt(hex.substring(4, 6), 16);
                              handleRunChange(runIndex, 'color', { red: r, green: g, blue: b, alpha: 1 });
                            }}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`run-highlight-color-${runIndex}`}>Highlight Color</Label>
                          <Input
                            id={`run-highlight-color-${runIndex}`}
                            type="color"
                            value={`#${run.highlight_color?.red.toString(16).padStart(2, '0')}${run.highlight_color?.green.toString(16).padStart(2, '0')}${run.highlight_color?.blue.toString(16).padStart(2, '0')}`}
                            onChange={(e) => {
                              const hex = e.target.value.substring(1);
                              const r = parseInt(hex.substring(0, 2), 16);
                              const g = parseInt(hex.substring(2, 4), 16);
                              const b = parseInt(hex.substring(4, 6), 16);
                              handleRunChange(runIndex, 'highlight_color', { red: r, green: g, blue: b, alpha: 1 });
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default React.memo(EditorBar);
