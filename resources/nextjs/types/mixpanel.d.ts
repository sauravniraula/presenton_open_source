import { SearchTypeEnum } from "@/utils/mixpanel/enums";

export interface FileSelectedEvent {
  file_name: string;
  file_size: number;
  file_type: string;
}

export interface PageOpenedEvent {
  page_name: string;
}

export interface LimitReachedEvent {
  limit_type: LimitType;
  limit_name: string;
}

export interface ToastShownEvent {
  toast_type: ToastType;
  toast_message: string;
}

export interface DialogShownEvent {
  dialog_type: string;
  dialog_title: string;
}

export interface UploadingFilesEvent {
  image_count: number;
  document_count: number;
}

export interface GeneratingResearchReportEvent {
  report_prompt: string;
  report_language: string | null;
}

export interface ExtractingTablesEvent {
  from: string;
}

export interface WaitingForResponseEvent {
  message: string;
}

export interface ErrorEvent {
  error_message: string;
}

export interface StartingPresentationGenerationEvent {
  presentation_type: string;
  language: LanguageType | null;
  prompt: string | null;
  slides: number | null;
}

export interface NavigationEvent {
  to: string;
}

export interface EventWithPresentationId {
  presentation_id: string;
}

export interface DocumentEditedEvent {
  document_key: string;
}

export interface DownloadingDocumentsEvent {
  document_keys: string[];
}

export interface SavingDocumentsEvent {
  document_keys: string[];
}

export interface SavingDocumentEvent {
  document_key: string;
  is_private: boolean;
}

export interface OptionsSelectedEvent {
  presentation_id: string;
  option_for: string;
  option_value: string;
}

export interface FetchingStoryEvent {
  presentation_id: string;
  big_idea: string | null;
  story_type: string | null;
}

export interface ThemeSelectedEvent {
  theme_name: string;
}

export interface SubmittingPresentationGenerationDataEvent {
  presentation_id: string;
  theme_name: string;
  watermark: boolean;
  images: string[];
  titles: string[];
  sources: string[];
}

export interface ReorderingTitlesEvent {
  presentation_id: string;
  old_index: number;
  new_index: number;
  old_title: string;
  new_title: string;
}

export interface ListeningStreamEvent {
  presentation_id: string;
  stream_detail: string;
}

export interface StreamResponseReceivedEvent {
  presentation_id: string;
  stream_detail: string;
}

export interface FullscreenToggledEvent {
  presentation_id: string;
  fullscreen: boolean;
}

export interface SlideSelectedEvent {
  presentation_id: string;
  slide_index: number;
}

export interface StripeCheckoutSessionCreatedEvent {
  session_id: string;
  price: string;
  price_type: string;
}

export interface SearchEvent {
  presentation_id?: string,
  search_type: SearchTypeEnum,
  query: string;
  page?: number;
  limit?: number;
}

export interface IconChangedEvent {
  presentation_id: string,
  slide_index: number,
  old_icon: string,
  new_icon: string,
}

export interface ImageChangedEvent {
  presentation_id: string,
  slide_index: number,
  old_image: string,
  new_image: string,
}

export interface UploadingFileForSlideEvent {
  presentation_id: string,
  slide_index: number,
  file_name: string,
  file_size: number,
  file_type: string,
}

export interface GeneratingImageForSlideEvent {
  presentation_id: string,
  slide_index: number,
  prompt: string,
  theme_prompt: string,
  aspect_ratio: string,
}

export interface UpdatingPresentationUsingPromptEvent {
  presentation_id: string,
  slide_index: number,
  prompt: string,
}

export interface ExportingPresentationEvent {
  presentation_id: string,
  export_type: "pdf" | "pptx",
}

export type MixpanelEventData =
  | FileSelectedEvent
  | PageOpenedEvent
  | LimitReachedEvent
  | ToastShownEvent
  | DialogShownEvent
  | UploadingFilesEvent
  | GeneratingResearchReportEvent
  | ExtractingTablesEvent
  | WaitingForResponseEvent
  | ErrorEvent
  | StartingPresentationGenerationEvent
  | NavigationEvent
  | EventWithPresentationId
  | DocumentEditedEvent
  | DownloadingDocumentsEvent
  | SavingDocumentsEvent
  | SavingDocumentEvent
  | OptionsSelectedEvent
  | FetchingStoryEvent
  | ThemeSelectedEvent
  | SubmittingPresentationGenerationDataEvent
  | ReorderingTitlesEvent
  | ListeningStreamEvent
  | StreamResponseReceivedEvent
  | FullscreenToggledEvent
  | SlideSelectedEvent
  | StripeCheckoutSessionCreatedEvent
  | SearchEvent
  | IconChangedEvent
  | ImageChangedEvent
  | UploadingFileForSlideEvent
  | GeneratingImageForSlideEvent
  | UpdatingPresentationUsingPromptEvent
  | ExportingPresentationEvent;