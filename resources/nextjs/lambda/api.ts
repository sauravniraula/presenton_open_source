import { z } from "zod";
import type { RenderMediaOnLambdaOutput } from "@remotion/lambda/client";
import {
  ProgressRequest,
  ProgressResponse,
  RenderRequest,
} from "../remotion/types/schema";
import { SlideData } from "../remotion/types/slideTypes";

interface InputProps {
  slides: SlideData[];
  currentSlideIndex: number | undefined;
  slideFrameMappings: Array<{
    startFrame: number;
    endFrame: number;
    duration: number;
  }>;
  totalDurationInFrames: number;
  showSubtitles?: boolean;
}

const makeRequest = async <Res>(
  endpoint: string,
  body: unknown,
): Promise<Res> => {
  console.log("body while making request", body);
  const result = await fetch(endpoint, {
    method: "post",
    body: JSON.stringify(body),
    headers: {
      "content-type": "application/json",
    },
  });
  const json = await result.json();
  console.log("json", json);
  if (json.type === "error") {
    throw new Error(json.message);
  }

  return json.data;
};

export const renderVideo = async ({
  id,
  inputProps,
}: {
  id: string;
  inputProps: InputProps;
}) => {
  const body: z.infer<typeof RenderRequest> = {
    id,
    inputProps
  };

  return makeRequest<RenderMediaOnLambdaOutput>("/api/presentation-data/lambda/render", body);
};

export const getProgress = async ({
  id,
  bucketName,
}: {
  id: string;
  bucketName: string;
}) => {
  const body: z.infer<typeof ProgressRequest> = {
    id,
    bucketName,
  };

  return makeRequest<ProgressResponse>("/api/presentation-data/lambda/progress", body);
};
