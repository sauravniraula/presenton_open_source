import { AwsRegion, RenderMediaOnLambdaOutput } from "@remotion/lambda/client";
import {
  renderMediaOnLambda,
  speculateFunctionName,
} from "@remotion/lambda/client";
import { DISK, RAM, REGION, SITE_NAME, TIMEOUT } from "@/config.mjs";
import { executeApi } from "@/helpers/api-response";
import { RenderRequest } from "@/remotion/types/schema";
import { getAvailableFonts } from "@remotion/google-fonts";

// Add these interfaces
interface Run {
  font_name: string;
  text: string;
}

interface Paragraph {
  runs?: Run[];
}

interface TextFrame {
  paragraphs?: Paragraph[];
}

interface Shape {
  text_frame?: TextFrame;
}

interface Slide {
  shapes?: Shape[];
  frame_size: {
    width: number;
    height: number;
  };
}

export const POST = executeApi<RenderMediaOnLambdaOutput, typeof RenderRequest>(
  RenderRequest,
  async (req, body) => {
    if (
      !process.env.ACCESS_KEY_ID &&
      !process.env.REMOTION_AWS_ACCESS_KEY_ID
    ) {
      throw new TypeError(
        "Set up Remotion Lambda to render videos. See the README.md for how to do so.",
      );
    }
    if (
      !process.env.SECRET_ACCESS_KEY &&
      !process.env.REMOTION_AWS_SECRET_ACCESS_KEY
    ) {
      throw new TypeError(
        "The environment variable REMOTION_SECRET_ACCESS_KEY is missing. Add it to your .env file.",
      );
    }

    const { slides, currentSlideIndex, slideFrameMappings, totalDurationInFrames, showSubtitles } = body.inputProps;
    const fps = 30;

    // Now TypeScript knows the shape of your data
    const uniqueFonts = new Set(
      (slides as Slide[]).flatMap(slide => 
        slide.shapes?.flatMap(shape => 
          shape.text_frame?.paragraphs?.flatMap(paragraph => 
            paragraph.runs?.map(run => run.font_name)
          ) ?? []
        ) ?? []
      ).filter(Boolean)
    );

    // Get available Google Fonts
    const availableFonts = getAvailableFonts();
    const fontFamilies = Array.from(uniqueFonts)
      .map(font => font.toString().replace(/["']/g, '').trim())
      .filter(fontName => 
        availableFonts.some(
          googleFont => googleFont.fontFamily.toLowerCase() === fontName.toLowerCase()
        )
      );

    // Use the first slide's dimensions for the composition
    const { width, height } = (slides[0] as Slide).frame_size;

    console.log("key", process.env.ACCESS_KEY_ID);
    console.log("secret", process.env.SECRET_ACCESS_KEY);

    try {

      const result = await renderMediaOnLambda({
        codec: "h264",
        functionName: "remotion-render-4-0-220-mem3000mb-disk2048mb-240sec",
        region: REGION as AwsRegion,
        serveUrl: SITE_NAME,
        composition: "Main",
        scale: 2,
        logLevel: "verbose",
        inputProps: { 
          slides,
          currentSlideIndex,
          slideFrameMappings,
          showSubtitles
        },
        forceWidth: Math.round(width),
        forceHeight: Math.round(height),
        frameRange: [0, totalDurationInFrames],
        chromiumOptions: {
          disableWebSecurity: true,
          ignoreCertificateErrors: true,
        },
        downloadBehavior: {
          type: "download",
          fileName: "presentation.mp4",
        },
      });
      
      console.log("result", result);
      return result;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
);
