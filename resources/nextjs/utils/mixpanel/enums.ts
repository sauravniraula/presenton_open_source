export enum ToastType {
  error = "error",
  success = "success",
  info = "info",
}

export enum LimitType {
  slide_count = "slide_count",
  presentation_count = "presentation_count",
}

export enum SearchTypeEnum {
  icon = "icon",
  image = "image",
}

export enum DialogType {
  presentationTypeSelection = "presentation_type_selection",
}

export enum MixpanelEventName {
  error = "error",
  notAuthenticated = "not_authenticated",
  pageOpened = "page_opened",
  navigation = "navigation",
  dialogShown = "dialog_shown",
  limitReached = "limit_reached",
  toastShown = "toast_shown",
  upgradePlan = "update_plan",

  //? Presentation Generation Sequence
  selectedImage = "image_selected",
  selectedDocument = "document_selected",
  uploadingFiles = "uploading_files",
  generatingResearchReport = "generating_research_report",
  decomposingDocuments = "decomposing_documents",
  extractingTables = "extracting_tables",
  waitingForResponse = "waiting_for_response",
  startingPresentationGeneration = "starting_presentation_generation",
  fetchingQuestions = "fetching_questions",
  generatingTitles = "generating_titles",
  documentEdited = "document_edited",
  downloadingDocuments = "downloading_documents",
  savingDocuments = "saving_documents",
  savingDocument = "saving_document",
  optionsSelected = "options_selected",
  questionOptionsSelected = "question_options_selected",
  submittingQuestionAnswers = "submitting_question_answers",
  fetchingStory = "fetching_story",
  themeSelected = "theme_selected",
  submittingPresentationGenerationData = "submitting_presentation_generation_data",
  reorderingTitles = "reordering_titles",
  listeningStream = "listening_stream",
  streamResponseReceived = "stream_response_received",
  fetchingPresentationSlides = "fetching_presentation_slides",
  fullscreenToggled = "fullscreen_toggled",
  slideSelected = "slide_selected",
  savingSlides = "saving_slides",
  addingSlides = "adding_slide",
  deletingSlides = "deleting_slide",
  search = "search",
  generatingImageForSlide = "generating_image_for_slide",
  uploadingImageForSlide = "uploading_image_for_slide",
  slideIconChanged = "slide_icon_changed",
  slideImageChanged = "slide_image_changed",
  updating_presentation_using_prompt = "updating_presentation_using_prompt",
  exportingPresentation = "exporting_presentation",

  //? Dashboard Page
  createNewPresentationClicked = "create_new_presentation_clicked",
  deletingPresentation = "deleting_presentation",

  //? Profile Page
  upgradePlanClicked = "upgrade_plan_clicked",
  stripeCheckoutSessionCreated = "stripe_checkout_session_created",
  redirectToStripe = "redirect_to_stripe",
  openingBillingPortal = "opening_billing_portal",

  //? Not Implemented
  updatePresentationThumbnail = "update_presentation_thumbnail",
  deplottingCharts = "deplotting_charts",
  assigningCharts = "assigning_charts",
  updatingCharts = "updating_charts",
  addingCharts = "adding_charts",
  // share
  share = "share_click",
}
