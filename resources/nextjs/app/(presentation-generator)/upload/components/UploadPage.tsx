"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  setError,
  setPresentationId,
  setTitles,
} from "@/store/slices/presentationGeneration";
import { ConfigurationSelects } from "./ConfigurationSelects";
import { PromptInput } from "./PromptInput";
import { PresentationConfig } from "../type";
import SupportingDoc from "./SupportingDoc";
import { Button } from "@/components/ui/button";

import { ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PresentationGenerationApi } from "../../services/api/presentation-generation";
import { OverlayLoader } from "@/components/ui/overlay-loader";
import Wrapper from "@/components/Wrapper";
import { RootState } from "@/store/store";
import { useUsageTracking } from "@/hooks/useUsageTracking";
import { setPptGenUploadState } from "@/store/slices/presentationGenUpload";
import {
  LimitType,
  MixpanelEventName,
  ToastType,
} from "@/utils/mixpanel/enums";
import { sendMpEvent } from "@/utils/mixpanel/services";

const UploadPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { toast } = useToast();
  const { checkLimit, incrementUsage } = useUsageTracking();
  const [researchMode, setResearchModel] = useState<boolean>(false);
  const [documents, setDocuments] = useState<File[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [config, setConfig] = useState<PresentationConfig>({
    slides: null,
    language: null,
    prompt: "",
  });

  const [loadingState, setLoadingState] = useState<{
    isLoading: boolean;
    message: string;
    duration?: number;
    showProgress?: boolean;
    extra_info?: string;
  }>({
    isLoading: false,
    message: "",
    duration: 4,
    showProgress: false,
    extra_info: "",
  });
  const getPromptTablesExtraction = async () => {
    //? Mixpanel User Tracking
    sendMpEvent(MixpanelEventName.extractingTables, {
      from: "prompt",
    });
    const response = await PresentationGenerationApi.promptTablesExtraction(
      config.prompt
    );
    return response;
  };

  // Handlers for presentation config
  const handleConfigChange = (key: keyof PresentationConfig, value: string) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleFilesChange = (newFiles: File[]) => {
    // Separate files based on type
    const docs: File[] = [];
    const imgs: File[] = [];

    newFiles.forEach((file) => {
      const isImage = file.type?.startsWith("image/");
      if (isImage) {
        imgs.push(file);
      } else {
        docs.push(file);
      }
      //? Mixpanel User Tracking
      sendMpEvent(
        isImage
          ? MixpanelEventName.selectedImage
          : MixpanelEventName.selectedDocument,
        {
          file_name: file.name,
          file_size: file.size,
          file_type: file.type,
        }
      );
    });

    setDocuments(docs);
    setImages(imgs);
  };

  const handleGeneratePresentation = async () => {
    if (!user) {
      //? Mixpanel User Tracking
      sendMpEvent(MixpanelEventName.notAuthenticated);
      sendMpEvent(MixpanelEventName.navigation, {
        to: "/auth/login",
      });
      router.push("/auth/login");
    }
    const isLimitReached = await checkLimit("aiPresentations");

    if (!isLimitReached) {
      //? Mixpanel User Tracking
      sendMpEvent(MixpanelEventName.limitReached, {
        limit_type: LimitType.presentation_count,
        limit_name: "Presentation Generation limit reached",
      });
      toast({
        title: "Limit Reached",
        description:
          "You have reached the limit for your current plan. Please upgrade your plan to continue.",
        variant: "destructive",
      });
      //? Mixpanel User Tracking
      sendMpEvent(MixpanelEventName.navigation, {
        to: "/profile",
      });
      router.push("/profile");
      return;
    }

    if (
      !config.prompt.trim() &&
      documents.length === 0 &&
      images.length === 0
    ) {
      //? Mixpanel User Tracking
      sendMpEvent(MixpanelEventName.toastShown, {
        toast_type: ToastType.info,
        toast_message: "No Prompt or Document Provided",
      });
      toast({
        title: "No Prompt or Document Provided",
        description: " Please provide prompt or document.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (researchMode || documents.length > 0 || images.length > 0) {
        setLoadingState({
          isLoading: true,
          message: researchMode
            ? "Creating research report..."
            : "Processing documents...",
          showProgress: true,
          duration: researchMode ? 80 : 90,
          extra_info:
            documents.length > 0
              ? "It might take a few minutes for large documents."
              : "",
        });
        let documentKeys = [];
        let imageKeys = [];

        let hasUploadedAssets = documents.length > 0 || images.length > 0;
        if (hasUploadedAssets) {
          //? Mixpanel User Tracking
          sendMpEvent(MixpanelEventName.uploadingFiles, {
            document_count: documents.length,
            image_count: images.length,
          });
          const uploadResponse = await PresentationGenerationApi.uploadDoc(
            documents,
            images
          );
          documentKeys = uploadResponse["documents"];
          imageKeys = uploadResponse["images"];
        }

        const promises: Promise<any>[] = [];
        if (researchMode) {
          //? Mixpanel User Tracking
          sendMpEvent(MixpanelEventName.generatingResearchReport, {
            report_prompt: config.prompt,
            report_language: config.language,
          });
          promises.push(
            PresentationGenerationApi.generateResearchReport(
              config.prompt,
              config.language
            )
          );
        }
        if (hasUploadedAssets) {
          //? Mixpanel User Tracking
          sendMpEvent(MixpanelEventName.decomposingDocuments);
          promises.push(
            PresentationGenerationApi.decomposeDocuments(
              documentKeys,
              imageKeys
            )
          );
        }
        if (config.prompt.trim().length > 0) {
          promises.push(getPromptTablesExtraction());
        }

        //? Mixpanel User Tracking
        sendMpEvent(MixpanelEventName.waitingForResponse, {
          message: "Waiting for research report or documents to be decomposed.",
        });
        let responses = await Promise.all(promises);
        let research: any = {};
        let processed_documents: any = {};
        let processed_images: any = {};
        let extracted_charts: any = {};
        let extracted_tables: any = {};
        let extracted_prompt_tables: any = {};
        if (researchMode) {
          let researchResponse = responses.shift();

          research[researchResponse["key"]] = researchResponse["url"];
        }
        if (hasUploadedAssets) {
          let decomposedResponse = responses.shift();

          processed_documents = decomposedResponse["documents"];
          processed_images = decomposedResponse["images"];
          extracted_charts = decomposedResponse["charts"];
          extracted_tables = decomposedResponse["tables"];
        }
        if (config.prompt.trim().length > 0) {
          let promptTablesExtractionResponse = responses.shift();

          extracted_prompt_tables[promptTablesExtractionResponse["source"]] =
            promptTablesExtractionResponse["tables"];
        }
        const pptGenUpdateNewState = {
          config: config,
          reports: research,
          documents: processed_documents,
          images: processed_images,
          charts: extracted_charts,
          tables: extracted_tables,
          promptTablesExtraction: extracted_prompt_tables,
          questions: [],
        };

        dispatch(setPptGenUploadState(pptGenUpdateNewState));
        incrementUsage("aiPresentations");

        //? Mixpanel User Tracking
        sendMpEvent(MixpanelEventName.navigation, {
          to: "/documents-preview",
        });
        router.push("/documents-preview");
      } else {
        setLoadingState({
          isLoading: true,
          message: "Generating outlines...",
          showProgress: true,
          duration: 30,
        });
        const createResponse = await PresentationGenerationApi.getQuestions({
          prompt: config?.prompt ?? "",
          n_slides: config?.slides ? parseInt(config.slides) : null,

          documents: [],
          images: [],
          research_reports: [],
          language: config?.language ?? "",
          sources: [],
        });
        try {
          //? Mixpanel User Tracking
          sendMpEvent(MixpanelEventName.generatingTitles, {
            presentation_id: createResponse.id,
          });
          // Start both API calls immediately in parallel
          const titlePromise = await PresentationGenerationApi.titleGeneration({
            presentation_id: createResponse.id,
          });
          dispatch(setPresentationId(titlePromise.id));
          dispatch(setTitles(titlePromise.titles));

          router.push("/theme");
        } catch (error) {
          console.error("Error in title generation:", error);
          toast({
            title: "Error in title generation.",
            description: "Please try again.",
            variant: "destructive",
          });
          //? Mixpanel User Tracking
          sendMpEvent(MixpanelEventName.error, {
            error_message:
              error instanceof Error
                ? error.message
                : "Unknown error in catch block",
          });
        }
        //? Mixpanel User Tracking
        sendMpEvent(MixpanelEventName.navigation, {
          to: "/theme",
        });
        router.push("/theme");
      }
    } catch (error) {
      console.error("Error in presentation generation:", error);
      //? Mixpanel User Tracking
      sendMpEvent(MixpanelEventName.error, {
        error_message:
          error instanceof Error
            ? error.message
            : "Unknown error in catch block",
      });
      dispatch(setError("Failed to generate presentation"));
      setLoadingState({
        isLoading: false,
        message: "",
        duration: 0,
        showProgress: false,
      });
      toast({
        title: "Error",
        description: "Failed to generate presentation. Please try again.",
        variant: "destructive",
      });
    }
  };

  //? Mixpanel User Tracking
  useEffect(() => {
    sendMpEvent(MixpanelEventName.pageOpened, {
      page_name: "Prompt and File Upload Page",
    });
  }, []);

  return (
    <Wrapper className="pb-10 lg:max-w-[70%] xl:max-w-[65%]">
      <OverlayLoader
        show={loadingState.isLoading}
        text={loadingState.message}
        showProgress={loadingState.showProgress}
        duration={loadingState.duration}
        extra_info={loadingState.extra_info}
      />
      <div className="flex flex-col gap-4 md:items-center md:flex-row justify-between py-4">
        <p></p>
        <ConfigurationSelects
          config={config}
          onConfigChange={handleConfigChange}
        />
      </div>
      <div className="relative">
        <PromptInput
          value={config.prompt}
          onChange={(value) => handleConfigChange("prompt", value)}
          researchMode={researchMode}
          setResearchMode={setResearchModel}
        />
      </div>
      <SupportingDoc
        files={[...documents, ...images]}
        onFilesChange={handleFilesChange}
      />
      <Button
        onClick={handleGeneratePresentation}
        className="w-full rounded-[32px] flex items-center justify-center py-6 bg-[#5141e5] text-white font-satoshi font-semibold text-xl hover:bg-[#5141e5]/80 transition-colors duration-300"
      >
        <span> Next</span>
        <ChevronRight className="!w-6 !h-6" />
      </Button>
    </Wrapper>
  );
};

export default UploadPage;
