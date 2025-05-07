"use client";

import styles from "../styles/main.module.css";
import { useEffect, useState, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { OverlayLoader } from "@/components/ui/overlay-loader";
import { PresentationGenerationApi } from "../../services/api/presentation-generation";
import { setTitles } from "@/store/slices/presentationGeneration";
import { useDispatch, useSelector } from "react-redux";
import { setPresentationId } from "@/store/slices/presentationGeneration";
import { useRouter } from "next/navigation";
import { RootState } from "@/store/store";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import Header from "@/app/dashboard/components/Header";
import MarkdownRenderer from "./MarkdownRenderer";
import { fetchTextFromURL } from "../../utils/download";
import { getIconFromFile, removeUUID } from "../../utils/others";
import { ChevronRight, PanelRightOpen, X } from "lucide-react";
import ToolTip from "@/components/ToolTip";

const DocumentsPreviewPage: React.FC = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const {
    config,
    reports,
    documents,
    images,
    charts,
    tables,
    promptTablesExtraction,
  } = useSelector((state: RootState) => state.pptGenUpload);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [textContents, setTextContents] = useState<any>({});
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [downloadingDocuments, setDownloadingDocuments] = useState<string[]>(
    []
  );
  const [isOpen, setIsOpen] = useState(true);
  const [changedDocuments, setChangedDocuments] = useState<string[]>([]);

  const [showLoading, setShowLoading] = useState({
    message: "",
    show: false,
    duration: 10,
    progress: false,
  });

  const reportKeys = Object.keys(reports);
  const documentKeys = Object.keys(documents);
  const imageKeys = Object.keys(images);
  const promptTablesKeys = Object.keys(promptTablesExtraction);
  const allSources = [
    ...reportKeys,
    ...documentKeys,
    ...imageKeys,
    ...promptTablesKeys,
  ];

  const updateText = (value: string) => {
    if (selectedDocument) {
      textContents[selectedDocument] = value;
      if (!changedDocuments.includes(selectedDocument)) {
        changedDocuments.push(selectedDocument);
      }
    }
  };
  const updateSelectedDocument = (value: string) => {
    setSelectedDocument(value);
    if (textareaRef.current) {
      textareaRef.current.value = textContents[value];
    }
  };

  const mantainDocumentTexts = async () => {
    let promises: Promise<string>[] = [];
    let newDocuments = [];
    for (const each of documentKeys) {
      if (!(each in textContents)) {
        newDocuments.push(each);
        promises.push(fetchTextFromURL(documents[each][1]));
      }
    }
    for (const each of reportKeys) {
      if (!(each in textContents)) {
        newDocuments.push(each);
        promises.push(fetchTextFromURL(reports[each]));
      }
    }

    setDownloadingDocuments(newDocuments);
    const results = await Promise.all(promises);
    for (let i = 0; i < newDocuments.length; i++) {
      textContents[newDocuments[i]] = results[i];
    }
    // setTextContents(textContents)
    setDownloadingDocuments([]);
  };

  const saveDocuments = async () => {
    const promises: Promise<any>[] = [];

    for (const each of changedDocuments) {
      const blob = new Blob([textContents[each]], { type: "text/plain" });
      const file = new File([blob], "document.txt", { type: "text/plain" });

      const isReport = reportKeys.includes(each);
      promises.push(
        sendUploadDocumentRequest(
          isReport ? each : documents[each][0],
          isReport,
          file
        )
      );
    }
    if (promises.length > 0) {
      await Promise.all(promises);
    }
  };

  const sendUploadDocumentRequest = async (
    path: string,
    isPrivate: boolean,
    file: File
  ) => {
    const formData = new FormData();
    formData.append("path", path);
    formData.append("private", isPrivate ? "true" : "false");
    formData.append("file", file);

    try {
      const data = await PresentationGenerationApi.updateDocuments(formData);
      return data;
    } catch (error) {
      console.error("Error uploading document:", error);
      throw error;
    }
  };
  const documentTablesAndCharts = () => {
    if (selectedDocument == null) {
      return [];
    }
    let images: string[] = [];
    if (selectedDocument in tables) {
      images = images.concat(tables[selectedDocument]);
    }
    if (selectedDocument in charts) {
      images = images.concat(charts[selectedDocument]);
    }
    return images;
  };

  const handleCreatePresentation = async () => {
    try {
      setShowLoading({
        message: "Generating presentation outline...",
        show: true,
        duration: 40,
        progress: true,
      });
      // Markdown are now READ ONLY
      // await saveDocuments();

      // Prepare document paths
      const documentPaths = documentKeys.map((key) => documents[key][0]);

      const createResponse = await PresentationGenerationApi.getQuestions({
        prompt: config?.prompt ?? "",
        n_slides: config?.slides ? parseInt(config.slides) : null,

        documents: documentPaths,
        images: imageKeys,
        research_reports: reportKeys,
        language: config?.language ?? "",
        sources: allSources,
      });
      try {
        // Start both API calls immediately in parallel
        const titlePromise = await PresentationGenerationApi.titleGeneration({
          presentation_id: createResponse.id,
        });
        dispatch(setPresentationId(titlePromise.id)); // Update Redux store with presentation ID
        dispatch(setTitles(titlePromise.titles)); // Update Redux store with titles
        // Hide loading
        setShowLoading({
          message: "",
          show: false,
          duration: 0,
          progress: false,
        });
        router.push("/theme");
      } catch (error) {
        console.error("Error in title generation:", error);
        toast({
          title: "Error in title generation.",
          description: "Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error in presentation creation:", error);
      toast({
        title: "Error in presentation creation.",
        description: "Please try again.",
        variant: "destructive",
      });
      setShowLoading({
        message: "Error in presentation creation.",
        show: true,
        duration: 10,
        progress: false,
      });
    } finally {
      setShowLoading({
        message: "",
        show: false,
        duration: 10,
        progress: false,
      });
    }
  };

  const handleSaveMarkdown = (content: string) => {
    updateText(content);
  };
  const handleClose = () => {
    setIsOpen(false);
    // if (window.innerWidth < 768) {
    //   setIsMobilePanelOpen(false);
    // }
  };

  return (
    <>
      <div className={`${styles.wrapper} min-h-screen flex flex-col w-full`}>
        <OverlayLoader
          show={showLoading.show}
          text={showLoading.message}
          showProgress={showLoading.progress}
          duration={showLoading.duration}
        />

        <Header />
        <div className="flex  mt-6 gap-4 ">
          {/* Sidebar */}
          {!isOpen && (
            <div className=" fixed left-4 top-1/2 -translate-y-1/2 z-50">
              <ToolTip content="Open Panel">
                <Button
                  onClick={() => setIsOpen(true)}
                  className="bg-[#5146E5] text-white p-3 shadow-lg"
                >
                  <PanelRightOpen className="text-white" size={20} />
                </Button>
              </ToolTip>
            </div>
          )}
          {isOpen && (
            <div
              className={`${styles.sidebar}  fixed xl:relative w-full z-50 xl:z-auto
          transition-all duration-300 ease-in-out max-w-[200px] md:max-w-[300px] h-[85vh] rounded-md p-5`}
            >
              <X
                onClick={handleClose}
                className="text-black mb-4 ml-auto mr-0 cursor-pointer hover:text-gray-600"
                size={20}
              />
              {/* Prompt Tables */}
              {Object.keys(promptTablesExtraction).length > 0 &&
                // @ts-ignore
                Object.values(promptTablesExtraction)[0].length > 0 && (
                  <div
                    className={`${
                      selectedDocument == Object.keys(promptTablesExtraction)[0]
                        ? styles.selected_border
                        : styles.unselected_border
                    } my-4 w-full h-20 cursor-pointer flex items-center justify-center border border-gray-200 rounded-lg`}
                    onClick={() =>
                      updateSelectedDocument(
                        Object.keys(promptTablesExtraction)[0]
                      )
                    }
                  >
                    <p className="text-base mt-2 text-[#2E2E2E] opacity-70">
                      PROMPT TABLES
                    </p>
                  </div>
                )}
              {/* Research Report */}
              {reportKeys.length > 0 && (
                <div
                  onClick={() => updateSelectedDocument(reportKeys[0])}
                  className={`${
                    selectedDocument == reportKeys[0]
                      ? styles.selected_border
                      : styles.unselected_border
                  } ${
                    styles.report_icon_box
                  } flex justify-center items-center rounded-lg w-full h-32 cursor-pointer`}
                >
                  <div>
                    <img
                      className="mx-auto h-20"
                      src="/generator/report.png"
                      alt="Document preview"
                    />
                    <p className="text-sm mt-2 text-[#2E2E2E]">
                      Research Report
                    </p>
                  </div>
                </div>
              )}
              {documentKeys.length > 0 && (
                <div className="mt-8">
                  <p className="text-xs mt-2 text-[#2E2E2E] opacity-70">
                    DOCUMENTS
                  </p>
                  <div className="flex flex-col gap-2 mt-6">
                    {documentKeys.map((key) => {
                      return (
                        <div
                          key={key}
                          onClick={() => updateSelectedDocument(key)}
                          className={
                            (selectedDocument == key
                              ? styles.selected_border
                              : "") +
                            " flex p-2 rounded-sm gap-2 items-center cursor-pointer"
                          }
                        >
                          <img
                            className="h-6 w-6 border border-gray-200"
                            src={getIconFromFile(key)}
                            alt="uploaded image"
                          />
                          <span className="text-sm h-6 text-[#2E2E2E] overflow-hidden">
                            {removeUUID(key.split("/").pop() ?? "file.txt")}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {imageKeys.length > 0 && (
                <div className="mt-8">
                  <p className="text-xs mt-2 text-[#2E2E2E] opacity-70">
                    IMAGES
                  </p>
                  <div className="flex flex-col gap-2 mt-6">
                    {imageKeys.map((key) => {
                      return (
                        <div
                          key={key}
                          onClick={() => updateSelectedDocument(key)}
                          className="cursor-pointer"
                        >
                          <img
                            className={` ${
                              selectedDocument == key
                                ? styles.selected_border
                                : styles.unselected_border
                            } ${
                              styles.uploaded_images
                            } rounded-lg h-24 w-full border border-gray-200`}
                            src={images[key]}
                            alt="uploaded image"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
          {/* Content */}
          <div className="bg-white  w-full mx-2 sm:mx-4 h-[calc(100vh-100px)] rounded-md  overflow-y-auto py-6 pl-6">
            {selectedDocument != null && (
              <div className="h-full mr-4">
                {/* Prompt Tables  Content*/}
                {Object.keys(promptTablesExtraction).includes(
                  selectedDocument
                ) && (
                  <div>
                    {
                      // @ts-ignore
                      Object.values(promptTablesExtraction)[0].map(
                        (each: any) => {
                          return (
                            <MarkdownRenderer
                              key={each.id}
                              content={each.markdown || ""}
                            />
                          );
                        }
                      )
                    }
                  </div>
                )}
                {documentKeys.includes(selectedDocument) && (
                  <div
                    className={` overflow-y-auto  hide-scrollbar ${
                      documentTablesAndCharts().length > 0
                        ? "h-[calc(100vh-300px)]"
                        : "h-full"
                    }`}
                  >
                    <div
                      className={`h-full w-full max-w-full flex flex-col  mb-5`}
                    >
                      <h1 className="text-2xl font-medium mb-5">Content:</h1>

                      {downloadingDocuments.includes(selectedDocument) ? (
                        <Skeleton className="w-full h-full"></Skeleton>
                      ) : (
                        <MarkdownRenderer
                          content={textContents[selectedDocument] || ""}
                        />
                      )}
                    </div>
                  </div>
                )}
                {reportKeys.includes(selectedDocument) && (
                  <div
                    className={` overflow-y-auto  hide-scrollbar ${
                      documentTablesAndCharts().length > 0
                        ? "h-[calc(100vh-300px)]"
                        : "h-full"
                    }`}
                  >
                    <div
                      className={`h-full w-full max-w-full flex flex-col  mb-5`}
                    >
                      <h1 className="text-2xl font-medium mb-5">Content:</h1>

                      {
                        downloadingDocuments.includes(selectedDocument) ? (
                          <Skeleton className="w-full h-full"></Skeleton>
                        ) : (
                          <MarkdownRenderer
                            content={textContents[selectedDocument] || ""}
                          />
                        )
                        // <MarkdownEditor
                        //     key={selectedDocument}
                        //     initialValue={textContents[selectedDocument] || ''}
                        //     onSave={handleSaveMarkdown}
                        // />
                      }
                    </div>
                  </div>
                )}
                {documentTablesAndCharts().length > 0 && (
                  <div className="py-4">
                    <h1 className="text-2xl font-medium mb-5">
                      Tables And Charts
                    </h1>
                    {documentTablesAndCharts().map((each, index) => {
                      return (
                        <div
                          key={index}
                          className="w-full border rounded-lg p-4 my-4 bg-white shadow-sm"
                        >
                          {/* @ts-ignore */}
                          {each.markdown && (
                            <MarkdownRenderer
                              key={selectedDocument}
                              content={each.markdown || ""}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="fixed bottom-5 right-5">
            <Button
              onClick={handleCreatePresentation}
              className="flex items-center gap-2 px-8 py-6  rounded-sm text-md bg-[#5146E5] hover:bg-[#5146E5]/90"
            >
              {/* <img className="h-6 w-6" src='/generator/convert-to-slides.svg' alt="convert-to-slides" /> */}
              <span className="text-white font-semibold">Next</span>
              <ChevronRight />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default DocumentsPreviewPage;
