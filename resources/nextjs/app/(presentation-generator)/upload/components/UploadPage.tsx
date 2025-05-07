"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
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
import { setPptGenUploadState } from "@/store/slices/presentationGenUpload";

const UploadPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { toast } = useToast();
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
    });

    setDocuments(docs);
    setImages(imgs);
  };

  const handleGeneratePresentation = async () => {
    if (
      !config.prompt.trim() &&
      documents.length === 0 &&
      images.length === 0
    ) {
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
          const uploadResponse = await PresentationGenerationApi.uploadDoc(
            documents,
            images
          );
          documentKeys = uploadResponse["documents"];
          imageKeys = uploadResponse["images"];
        }

        const promises: Promise<any>[] = [];
        if (researchMode) {
          promises.push(
            PresentationGenerationApi.generateResearchReport(
              config.prompt,
              config.language
            )
          );
        }
        if (hasUploadedAssets) {
          promises.push(
            PresentationGenerationApi.decomposeDocuments(
              documentKeys,
              imageKeys
            )
          );
        }

        let responses = await Promise.all(promises);
        let research: any = {};
        let processed_documents: any = {};
        let processed_images: any = {};
        let extracted_charts: any = {};
        let extracted_tables: any = {};

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

        const pptGenUpdateNewState = {
          config: config,
          reports: research,
          documents: processed_documents,
          images: processed_images,
          charts: extracted_charts,
          tables: extracted_tables,
          questions: [],
        };
        dispatch(setPptGenUploadState(pptGenUpdateNewState));
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
        }

        router.push("/theme");
      }
    } catch (error) {
      console.error("Error in presentation generation:", error);

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
