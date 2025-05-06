import {
  speculateFunctionName,
  AwsRegion,
  getRenderProgress,
} from "@remotion/lambda/client";
import { DISK, RAM, REGION, TIMEOUT } from "@/config.mjs";
import { executeApi } from "@/helpers/api-response";
import { ProgressRequest, ProgressResponse } from "@/remotion/types/schema";

export const POST = executeApi<ProgressResponse, typeof ProgressRequest>(
  ProgressRequest,
  async (req, body) => {
    const renderProgress = await getRenderProgress({
      bucketName: body.bucketName,
      functionName: "remotion-render-4-0-220-mem3000mb-disk2048mb-240sec",
      region: REGION as AwsRegion,
      renderId: body.id,
    });

    if (renderProgress.fatalErrorEncountered) {
      return {
        type: "error",
        message: renderProgress.errors[0].message,
      };
    }

    console.log('Costs ', renderProgress.costs);
    console.log("time taken", renderProgress.timeToFinish);

    if (renderProgress.done) {
      return {
        type: "done",
        url: renderProgress.outputFile as string,
        size: renderProgress.outputSizeInBytes as number,
      };
    }

    return {
      type: "progress",
      progress: Math.max(0.03, renderProgress.overallProgress),
    };
  },
);
