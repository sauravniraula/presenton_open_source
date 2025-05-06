import { z } from "zod";
import { SlideData } from "./slideTypes";

const FrameMapping = z.object({
  startFrame: z.number(),
  endFrame: z.number(),
  duration: z.number(),
  audioDuration: z.number(),
});

export const RenderRequest = z.object({
  id: z.string(),
  inputProps: z.object({
    slides: z.array(z.any()),
    currentSlideIndex: z.number().optional(),
    slideFrameMappings: z.array(FrameMapping),
    totalDurationInFrames: z.number(),
    showSubtitles: z.boolean().optional(),
  }),
});

export const ProgressRequest = z.object({
  bucketName: z.string(),
  id: z.string(),
});

export type ProgressResponse =
  | {
      type: "progress";
      progress: number;
    }
  | {
      type: "done";
      url: string;
      size: number;
    }
  | {
      type: "error";
      message: string;
    };
