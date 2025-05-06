interface Position {
    value: number;
    unit: string;
  }
  
  interface Size {
    width: Position;
    height: Position;
  }
  
  interface TextRun {
    content: string;
    style: {
      foregroundColor: string;
      fontFamily: string;
      fontSize: number;
      bold: boolean;
      italic: boolean;
    };
  }
  
  function convertRGBString(rgbString: string): { red: number; green: number; blue: number; alpha: number } {
    const matches = rgbString.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (!matches) return { red: 0, green: 0, blue: 0, alpha: 255 };
    
    return {
      red: parseInt(matches[1]),
      green: parseInt(matches[2]),
      blue: parseInt(matches[3]),
      alpha: 255
    };
  }
  
  function convertTextElement(textElement: any) {
    const paragraphs = textElement.paragraphs.map((para: any) => ({
      text: para.textSpans
        .filter((span: any) => span.textRun)
        .map((span: any) => span.textRun.content)
        .join(""),
      alignment: para.paragraphProperty.alignment === "START" ? "left" : para.paragraphProperty.alignment.toLowerCase(),
      level: null,
      bullet_info: {
        visible: false,
        type: 0,
        char: null,
        image_url: null,
        bullet_size_percent: null,
        bullet_color: null,
        color: null,
        font_name: null,
        font_size: { value: 0, unit: "px" },
        bold: false,
        italic: false,
        underline: false,
        orientation: 0,
        kerning: false,
        distance: { value: 0, unit: "px" },
        start_value: 0,
        current_value: 0,
        indent: { value: 0, unit: "px" },
        prefix: "",
        suffix: "",
        level: null,
        style: "",
        type_description: "NONE"
      },
      runs: para.textSpans
        .filter((span: any) => span.textRun)
        .map((span: any) => ({
          text: span.textRun.content,
          font_name: span.textRun.style.fontFamily,
          font_size: Math.round(span.textRun.style.fontSize.value * 0.75), // Convert to appropriate size
          bold: span.textRun.style.bold,
          italic: span.textRun.style.italic,
          underline: false,
          color: convertRGBString(span.textRun.style.foregroundColor),
          highlight_color: {
            red: 255,
            green: 255,
            blue: 255,
            alpha: 0
          },
          position_x: { value: span.position?.x?.value || 0, unit: "px" },
          position_y: { value: span.position?.y?.value || 0, unit: "px" },
          width: { value: span.textRun.content.length * 50, unit: "px" }, // Approximate width
          height: { value: Math.round(span.textRun.style.fontSize.value), unit: "px" }
        })),
      position_x: { value: para.position?.x?.value || 0, unit: "px" },
      position_y: { value: para.position?.y?.value || 0, unit: "px" },
      width: { value: para.width?.value || 0, unit: "px" },
      height: { value: para.height?.value || 0, unit: "px" },
      padding: {
        left: { value: para.padding?.left?.value || 9, unit: "px" },
        right: { value: para.padding?.right?.value || 9, unit: "px" },
        top: { value: para.padding?.top?.value || 5, unit: "px" },
        bottom: { value: para.padding?.bottom?.value || 5, unit: "px" }
      },
      autofit: "Do Not Autofit",
      line_height: { value: para.paragraphProperty.lineSpacing?.value || 30, unit: "px" },
      margin: {
        left: { value: 0, unit: "px" },
        right: { value: 0, unit: "px" },
        top: { value: 0, unit: "px" },
        bottom: { value: 0, unit: "px" }
      }
    }));
  
    return paragraphs;
  }
  
  function isTextElement(element: any): boolean {
    return !!(element.shape?.text?.paragraphs?.some((para: any) => 
      para.textSpans?.some((span: any) => 
        span.textRun?.content?.trim()
      )
    ));
  }
  
  function isImageElement(element: any): boolean {
    return !!element.image?.contentUrl;
  }
  
  function createSvgFromPathData(element: any): string {
    if (!element.shape?.pathData) return '';
  
    // Create SVG with the path data
    const svgContent = `
      <svg viewBox="0 0 ${element.size.width.value} ${element.size.height.value}" xmlns="http://www.w3.org/2000/svg">
        <path d="${element.shape.pathData.join(' ')}" 
              fill="${element.fill?.solidFill || 'none'}"
              stroke="${element.outline?.outlineFill?.solidFill || 'none'}"
              stroke-width="${element.outline?.weight?.value || 0}"
        />
      </svg>
    `;
  
    // Convert SVG to data URL
    return `data:image/svg+xml;base64,${btoa(svgContent)}`;
  }
  
  function convertElement(element: any, index: number) {
    const shapeName = `Shape_${index + 1}`;
    let shapeType = "com.sun.star.drawing.CustomShape";
    
    // Determine shape type
    if (isTextElement(element)) {
      shapeType = "com.sun.star.drawing.TextShape";
    } else if (isImageElement(element)) {
      shapeType = "com.sun.star.drawing.GraphicObjectShape";
    } else if (element.shape?.pathData) {
      shapeType = "com.sun.star.drawing.CustomShape";
    }
  
    const baseShape: any = {
      name: shapeName,
      type: shapeType,
      width: element.size.width,
      height: element.size.height,
      position_x: element.position.x,
      position_y: element.position.y,
      rotation: { value: element.rotate || 0, unit: "0.01degree" },
      z_order: index,
      has_text: isTextElement(element),
      vertical_alignment: "top",
      text_auto_grow_height: false,
      text_auto_grow_width: false,
      text_word_wrap: true,
      text_fit_to_size: false,
      fill: {
        type: element.fill?.fillType === "SOLID_FILL" ? "SOLID" : "NONE",
        color: element.fill?.solidFill ? convertRGBString(element.fill.solidFill) : { red: 114, green: 159, blue: 207, alpha: 0 },
        transparency: { value: 0, unit: "%" }
      },
      line: {
        color: { red: 52, green: 101, blue: 164, alpha: 255 },
        width: { value: element.outline?.weight?.value || 0, unit: "px" },
        style: element.outline?.outlineFill?.fillType === "SOLID_FILL" ? "SOLID" : "NONE",
        transparency: { value: 0, unit: "%" }
      },
      animationType: "none",
      animationDelay: 0,
      animationDuration: 1,
      padding: {
        left: { value: element.shape?.text?.bodyProperty?.paddingLeft?.value || 9, unit: "px" },
        right: { value: element.shape?.text?.bodyProperty?.paddingRight?.value || 9, unit: "px" },
        top: { value: element.shape?.text?.bodyProperty?.paddingTop?.value || 5, unit: "px" },
        bottom: { value: element.shape?.text?.bodyProperty?.paddingBottom?.value || 5, unit: "px" }
      },
      autofit: "Do Not Autofit"
    };
  
    // Add text frame if it's a text element
    if (isTextElement(element)) {
      baseShape.text_frame = {
        paragraphs: convertTextElement(element.shape.text),
        vertical_alignment: "top"
      };
    }
  
    return baseShape;
  }
  
  function convertBackground(pageProperties: any): Background {
    if (pageProperties?.pageBackgroundFill?.fillType === "SOLID_FILL" && pageProperties?.pageBackgroundFill?.solidFill) {
      return {
        type: 'color',
        color: convertRGBString(pageProperties.pageBackgroundFill.solidFill)
      };
    }
    
    // If there's a background image or no background specified, default to white
    return {
      type: 'color',
      color: {
        red: 255,
        green: 255,
        blue: 255,
        alpha: 255
      }
    };
  }
  
  async function blobUrlToBase64(blobUrl: string): Promise<string> {
    try {
      const response = await fetch(blobUrl);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error converting blob URL to base64:', error);
      return '';
    }
  }
  
  async function extractSlideImages(slide: any, slideIndex: number) {
    const slideImages: Record<string, string> = {};
    
    await Promise.all(slide.pageElements.map(async (element: any, index: number) => {
      const shapeName = `Shape_${index + 1}`;
  
      if (isImageElement(element)) {
        // Handle image elements
        const imageUrl = await blobUrlToBase64(element.image.contentUrl);
        slideImages[shapeName] = imageUrl;
      } else if (element.shape?.pathData) {
        // Handle custom shapes with path data
        const svgUrl = createSvgFromPathData(element);
        if (svgUrl) {
          slideImages[shapeName] = svgUrl;
        }
      }
    }));
  
    return slideImages;
  }
  
  export async function convertPresentationFormat(pptxJson: any) {
    const slides = await Promise.all(pptxJson.slides.map(async (slide: any, slideIndex: number) => {
      const slideImages = await extractSlideImages(slide, slideIndex);
      
      return {
        index: slideIndex,
        shapes: slide.pageElements.map((element: any, elementIndex: number) => 
          convertElement(element, elementIndex)
        ),
        frame_size: {
          width: pptxJson.pageSize.width.value,
          height: pptxJson.pageSize.height.value
        },
        slideImages,
        background: convertBackground(slide.pageProperties),
        thumbnail: `https://present-for-me.s3.amazonaws.com/processed/${pptxJson.id}/slide_${slideIndex}/thumbnail.png`
      };
    }));
  
    return slides;
  }