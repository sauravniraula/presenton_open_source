import { getHeader, getHeaderForFormData } from "./header";
import { IconSearch, ImageGenerate, ImageSearch } from "./params";

export class PresentationGenerationApi {
  // static BASE_URL="https://api.presenton.ai";
  // static BASE_URL="https://presentation-generator-fragrant-mountain-1643.fly.dev";
  // static BASE_URL =
  //   "https://presentation-generator-wandering-night-8649.fly.dev";
  static BASE_URL = "http://localhost:8000";
  static BUCKET_URL = "https://s3.ap-south-1.amazonaws.com/pptgen-public-v2/";

  static async getChapterDetails() {
    try {
      const response = await fetch(
        `${PresentationGenerationApi.BASE_URL}/ppt/chapter-details`,
        {
          method: "GET",
          headers: getHeader(),
          cache: "no-cache",
        }
      );
      if (response.status === 200) {
        const data = await response.json();
        return data;
      }
    } catch (error) {
      console.error("Error getting chapter details:", error);
      throw error;
    }
  }

  static async uploadDoc(documents: File[], images: File[]) {
    const formData = new FormData();

    documents.forEach((document) => {
      formData.append("documents", document);
    });

    images.forEach((image) => {
      formData.append("images", image);
    });

    try {
      const response = await fetch(
        `${PresentationGenerationApi.BASE_URL}/ppt/files/upload`,
        {
          method: "POST",
          headers: getHeaderForFormData(),
          // Remove Content-Type header as browser will set it automatically with boundary
          body: formData,
          cache: "no-cache",
        }
      );

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    }
  }

  static async postCSVContentSubmit({
    presentation_id,
    report,
  }: {
    presentation_id: string;
    report: any;
  }) {
    try {
      const response = await fetch(
        `${PresentationGenerationApi.BASE_URL}/ppt/interpreted_report/submit`,
        {
          method: "POST",
          headers: getHeader(),
          body: JSON.stringify({
            presentation_id: presentation_id,
            report: report,
          }),
          cache: "no-cache",
        }
      );

      if (response.status === 200) {
        return true;
      } else {
        throw new Error(`Failed to generate report: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error in Generate Research Report", error);
      throw error;
    }
  }
  static async generateResearchReport(prompt: string, language: string | null) {
    const apiBody = {
      query: prompt,
      language: language,
    };
    try {
      const response = await fetch(
        `${PresentationGenerationApi.BASE_URL}/ppt/report/generate`,
        {
          method: "POST",
          headers: getHeader(),
          body: JSON.stringify(apiBody),
          cache: "no-cache",
        }
      );

      if (response.status === 200) {
        const data = await response.json();

        return data;
      } else {
        throw new Error(`Failed to generate report: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error in Generate Research Report", error);
      throw error;
    }
  }
  static async promptTablesExtraction(prompt: string) {
    try {
      const response = await fetch(
        `${PresentationGenerationApi.BASE_URL}/ppt/prompt-tables-extraction`,
        {
          method: "POST",
          headers: getHeader(),
          body: JSON.stringify({
            prompt,
          }),
          cache: "no-cache",
        }
      );
      if (response.ok) {
        const data = await response.json();

        return data;
      } else {
        throw new Error(`Failed to extract tables: ${response.statusText}`);
      }
    } catch (error) {
      console.error("error in table extraction", error);
      throw error;
    }
  }
  static async decomposeDocuments(documentKeys: string[], imageKeys: string[]) {
    try {
      const response = await fetch(
        `${PresentationGenerationApi.BASE_URL}/ppt/files/decompose`,
        {
          method: "POST",
          headers: getHeader(),
          body: JSON.stringify({
            documents: documentKeys,
            images: imageKeys,
          }),
          cache: "no-cache",
        }
      );
      if (response.status === 200) {
        const data = await response.json();

        return data;
      } else {
        throw new Error(`Failed to decompose files: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error in Decompose Files", error);
      throw error;
    }
  }
  static async titleGeneration({
    presentation_id,
  }: {
    presentation_id: string;
  }) {
    try {
      const response = await fetch(
        `${PresentationGenerationApi.BASE_URL}/ppt/titles/generate`,
        {
          method: "POST",
          headers: getHeader(),
          body: JSON.stringify({
            prompt: prompt,
            presentation_id: presentation_id,
          }),
          cache: "no-cache",
        }
      );
      if (response.status === 200) {
        const data = await response.json();

        return data;
      } else {
        throw new Error(`Failed to generate titles: ${response.statusText}`);
      }
    } catch (error) {
      console.error("error in title generation", error);
      throw error;
    }
  }
  static async chartDeplot({
    images,
    chart_links,
    table_links,
    research_reports,
    presentation_id,
  }: {
    images: string[];
    chart_links: string[];
    table_links: string[];
    research_reports: string[];
    presentation_id: string;
  }) {
    try {
      const response = await fetch(
        `${PresentationGenerationApi.BASE_URL}/ppt/charts/deplot_v2`,
        {
          method: "POST",
          headers: getHeader(),
          body: JSON.stringify({
            images: images,
            chart_links: chart_links,
            table_links: table_links,
            research_reports: research_reports,
            presentation_id: presentation_id,
          }),
          cache: "no-cache",
        }
      );
      if (!response.ok) {
        throw new Error(`Chart deplot failed: ${response.statusText}`);
      }
      const data = await response.json();

      return data;
    } catch (error) {
      console.error("error in chart deplot", error);
      throw error;
    }
  }

  static async assignCharts(presentation_id: string) {
    try {
      const response = await fetch(
        `${PresentationGenerationApi.BASE_URL}/ppt/charts/assign`,
        {
          method: "POST",
          headers: getHeader(),
          body: JSON.stringify({
            presentation_id,
          }),
          cache: "no-cache",
        }
      );
      if (response.status === 200) {
        const data = await response.json();

        return data;
      } else {
        throw new Error(`Failed to assign charts: ${response.statusText}`);
      }
    } catch (error) {
      console.error("error in chart assignment", error);
      throw error;
    }
  }

  static async generatePresentation(presentationData: any) {
    try {
      const response = await fetch(
        `${PresentationGenerationApi.BASE_URL}/ppt/generate`,
        {
          method: "POST",
          headers: getHeader(),
          body: JSON.stringify(presentationData),
          cache: "no-cache",
        }
      );
      if (response.status === 200) {
        const data = await response.json();

        return data;
      } else {
        throw new Error(
          `Failed to generate presentation: ${response.statusText}`
        );
      }
    } catch (error) {
      console.error("error in presentation generation", error);
      throw error;
    }
  }
  static async editSlide(
    presentation_id: string,
    index: number,
    prompt: string
  ) {
    try {
      const response = await fetch(
        `${PresentationGenerationApi.BASE_URL}/ppt/edit`,
        {
          method: "POST",
          headers: getHeader(),
          body: JSON.stringify({
            presentation_id,

            index,
            prompt,
          }),
          cache: "no-cache",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update slides");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("error in slide update", error);
      throw error;
    }
  }
  static async updateChart(presentation_id: string, charts: any) {
    try {
      const response = await fetch(
        `${PresentationGenerationApi.BASE_URL}/ppt/charts/update`,
        {
          method: "POST",
          headers: getHeader(),
          body: JSON.stringify({
            charts,
            presentation_id,
          }),
          cache: "no-cache",
        }
      );
      if (response.ok) {
        const data = await response.json();

        return data;
      } else {
        throw new Error(`Failed to update charts: ${response.statusText}`);
      }
    } catch (error) {
      console.error("error in chart update", error);
      throw error;
    }
  }
  static async addNewChart(presentation_id: string, charts: any) {
    try {
      const response = await fetch(
        `${PresentationGenerationApi.BASE_URL}/ppt/charts/add`,
        {
          method: "POST",
          headers: getHeader(),
          body: JSON.stringify({
            presentation_id,
            charts,
          }),
          cache: "no-cache",
        }
      );
      if (response.ok) {
        const data = await response.json();

        return data;
      } else {
        throw new Error(`Failed to add charts: ${response.statusText}`);
      }
    } catch (error) {
      console.error("error in chart addition", error);
      throw error;
    }
  }

  static async updatePresentationContent(body: any) {
    try {
      const response = await fetch(
        `${PresentationGenerationApi.BASE_URL}/ppt/slides/update`,
        {
          method: "POST",
          headers: getHeader(),
          body: JSON.stringify(body),
          cache: "no-cache",
        }
      );
      if (response.ok) {
        const data = await response.json();

        return data;
      } else {
        throw new Error(
          `Failed to update presentation content: ${response.statusText}`
        );
      }
    } catch (error) {
      console.error("error in presentation content update", error);
      throw error;
    }
  }

  static async generateData(presentationData: any) {
    try {
      const response = await fetch(
        `${PresentationGenerationApi.BASE_URL}/ppt/generate/data`,
        {
          method: "POST",
          headers: getHeader(),
          body: JSON.stringify(presentationData),
          cache: "no-cache",
        }
      );
      if (response.ok) {
        const data = await response.json();

        return data;
      } else {
        throw new Error(`Failed to generate data: ${response.statusText}`);
      }
    } catch (error) {
      console.error("error in data generation", error);
      throw error;
    }
  }
  // IMAGE AND ICON SEARCH
  static async imageSearch(imageSearch: ImageSearch) {
    try {
      const response = await fetch(
        `${PresentationGenerationApi.BASE_URL}/ppt/image/search`,
        {
          method: "POST",
          headers: getHeader(),
          body: JSON.stringify(imageSearch),
          cache: "no-cache",
        }
      );
      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        throw new Error(`Failed to search images: ${response.statusText}`);
      }
    } catch (error) {
      console.error("error in image search", error);
      throw error;
    }
  }
  static async generateImage(imageGenerate: ImageGenerate) {
    try {
      const response = await fetch(
        `${PresentationGenerationApi.BASE_URL}/ppt/image/generate`,
        {
          method: "POST",
          headers: getHeader(),
          body: JSON.stringify(imageGenerate),
          cache: "no-cache",
        }
      );
      if (response.ok) {
        const data = await response.json();

        return data;
      } else {
        throw new Error(`Failed to generate images: ${response.statusText}`);
      }
    } catch (error) {
      console.error("error in image generation", error);
      throw error;
    }
  }
  static async searchIcons(iconSearch: IconSearch) {
    try {
      const response = await fetch(
        `${PresentationGenerationApi.BASE_URL}/ppt/icon/search`,
        {
          method: "POST",
          headers: getHeader(),
          body: JSON.stringify(iconSearch),
          cache: "no-cache",
        }
      );
      if (response.ok) {
        const data = await response.json();

        return data;
      } else {
        throw new Error(`Failed to search icons: ${response.statusText}`);
      }
    } catch (error) {
      console.error("error in icon search", error);
      throw error;
    }
  }

  static async updateDocuments(body: any) {
    try {
      const response = await fetch(
        `${PresentationGenerationApi.BASE_URL}/ppt/document/update`,
        {
          method: "POST",
          headers: getHeaderForFormData(),
          body: body,
          cache: "no-cache",
        }
      );
      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        throw new Error(`Failed to update documents: ${response.statusText}`);
      }
    } catch (error) {
      console.error("error in document update", error);
      throw error;
    }
  }

  // EXPORT PRESENTATION
  static async exportAsPPTX(presentationData: any) {
    try {
      const response = await fetch(
        `${PresentationGenerationApi.BASE_URL}/ppt/presentation/export_as_pptx`,
        {
          method: "POST",
          headers: getHeader(),
          body: JSON.stringify(presentationData),
          cache: "no-cache",
        }
      );
      if (response.ok) {
        const data = await response.json();

        return {
          ...data,
          url: `${PresentationGenerationApi.BUCKET_URL}${data.url}`,
        };
      } else {
        throw new Error(`Failed to export as pptx: ${response.statusText}`);
      }
    } catch (error) {
      console.error("error in pptx export", error);
      throw error;
    }
  }
  static async exportAsPDF(presentationData: any) {
    try {
      const response = await fetch(
        `${PresentationGenerationApi.BASE_URL}/ppt/presentation/export_as_pdf`,
        {
          method: "POST",
          headers: getHeader(),
          body: JSON.stringify(presentationData),
          cache: "no-cache",
        }
      );
      if (response.ok) {
        const data = await response.json();

        return data;
      } else {
        throw new Error(`Failed to export as pdf: ${response.statusText}`);
      }
    } catch (error) {
      console.error("error in pdf export", error);
      throw error;
    }
  }
  static async deleteSlide(
    user_id: string,
    presentation_id: string,
    slide_id: string
  ) {
    try {
      const response = await fetch(
        `${PresentationGenerationApi.BASE_URL}/ppt/slide/delete?user_id=${user_id}&presentation_id=${presentation_id}&slide_id=${slide_id}`,
        {
          method: "DELETE",
          headers: getHeader(),
          cache: "no-cache",
        }
      );
      if (response.status === 204) {
        return true;
      } else {
        throw new Error(`Failed to delete slide: ${response.statusText}`);
      }
    } catch (error) {
      console.error("error in slide deletion", error);
      throw error;
    }
  }
  // SET THEME COLORS
  static async setThemeColors(presentation_id: string, theme: any) {
    try {
      const response = await fetch(
        `${PresentationGenerationApi.BASE_URL}/ppt/presentation/theme`,
        {
          method: "POST",
          headers: getHeader(),
          body: JSON.stringify({
            presentation_id,
            theme,
          }),
          cache: "no-cache",
        }
      );
      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        throw new Error(`Failed to set theme colors: ${response.statusText}`);
      }
    } catch (error) {
      console.error("error in theme colors set", error);
      throw error;
    }
  }
  // QUESTIONS

  static async getQuestions({
    prompt,
    n_slides,
    documents,
    images,
    research_reports,
    language,
    sources,
  }: {
    prompt: string;
    n_slides: number | null;
    documents?: string[];
    images?: string[];
    research_reports?: string[];
    language: string | null;
    sources?: string[];
  }) {
    try {
      const response = await fetch(
        `${PresentationGenerationApi.BASE_URL}/ppt/create`,
        {
          method: "POST",
          headers: getHeader(),
          body: JSON.stringify({
            prompt,
            n_slides,
            language,
            documents,
            research_reports,
            images,
            sources,
          }),
          cache: "no-cache",
        }
      );
      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        throw new Error(`Failed to get questions: ${response.statusText}`);
      }
    } catch (error) {
      console.error("error in question generation", error);
      throw error;
    }
  }

  static async submitAnswers(
    presentation_id: string,
    answers: Array<{ question: string; answer: string }>
  ) {
    try {
      const response = await fetch(
        `${PresentationGenerationApi.BASE_URL}/ppt/answers/submit`,
        {
          method: "POST",
          headers: getHeader(),
          body: JSON.stringify({
            presentation_id,
            answers,
          }),
          cache: "no-cache",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to submit answers");
      }

      return await response.json();
    } catch (error) {
      console.error("Error submitting answers:", error);
      throw error;
    }
  }

  static async getStoryFormats({
    presentation_id,
    big_idea,
    story_type,
  }: {
    presentation_id: string;
    big_idea: string | null;
    story_type: string | null;
  }) {
    try {
      const response = await fetch(
        `${PresentationGenerationApi.BASE_URL}/ppt/story`,
        {
          method: "POST",
          headers: getHeader(),
          body: JSON.stringify({
            presentation_id,
            big_idea,
            story_type,
          }),
          cache: "no-cache",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch story formats");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching story formats:", error);
      throw error;
    }
  }
}
