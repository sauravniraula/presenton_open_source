export async function fetchTextFromURL(url: string): Promise<string> {
  if(!url) return "";
 
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
    }

    const text = await response.text();
    return text; // Return the extracted text
  } catch (error) {
    console.error("Error fetching text:", error);
    return "";
  }
}