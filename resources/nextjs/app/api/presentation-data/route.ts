import { NextResponse } from 'next/server';

export async function GET() {
  let baseData = {
    "16c6bc0c-5204-4463-94e0-88b9665c59d7": {},
    "slide_0": {
      "3a68fd4f-7c72-408c-b2bf-8595dd7d45de": "https://pub-ae5a83dfee0146d886142453235c2605.r2.dev/16c6bc0c-5204-4463-94e0-88b9665c59d7/slide_0/3a68fd4f-7c72-408c-b2bf-8595dd7d45de.png",
      "3d2e3f03-bc66-4b1b-9271-b509df2d2abc": "https://pub-ae5a83dfee0146d886142453235c2605.r2.dev/16c6bc0c-5204-4463-94e0-88b9665c59d7/slide_0/3d2e3f03-bc66-4b1b-9271-b509df2d2abc.png",
      "48249ac1-c94b-4e81-9401-a88be83038c2": "https://pub-ae5a83dfee0146d886142453235c2605.r2.dev/16c6bc0c-5204-4463-94e0-88b9665c59d7/slide_0/48249ac1-c94b-4e81-9401-a88be83038c2.png",
      "70875847-547b-4a9e-b50f-3ee853404459": "https://pub-ae5a83dfee0146d886142453235c2605.r2.dev/16c6bc0c-5204-4463-94e0-88b9665c59d7/slide_0/70875847-547b-4a9e-b50f-3ee853404459.png",
      "81089d9e-4588-47b8-bdb9-fe5f2be0452b": "https://pub-ae5a83dfee0146d886142453235c2605.r2.dev/16c6bc0c-5204-4463-94e0-88b9665c59d7/slide_0/81089d9e-4588-47b8-bdb9-fe5f2be0452b.png",
      "background": "https://pub-ae5a83dfee0146d886142453235c2605.r2.dev/16c6bc0c-5204-4463-94e0-88b9665c59d7/slide_0/background.png",
      "e1d33b7c-ed59-4465-a553-5344059f3fa1": "https://pub-ae5a83dfee0146d886142453235c2605.r2.dev/16c6bc0c-5204-4463-94e0-88b9665c59d7/slide_0/e1d33b7c-ed59-4465-a553-5344059f3fa1.png",
      "f47d6687-cb80-4e7b-92d8-9025f2786758": "https://pub-ae5a83dfee0146d886142453235c2605.r2.dev/16c6bc0c-5204-4463-94e0-88b9665c59d7/slide_0/f47d6687-cb80-4e7b-92d8-9025f2786758.png",
      "ffd1b44d-de6b-4412-b9a7-7c3a8941e868": "https://pub-ae5a83dfee0146d886142453235c2605.r2.dev/16c6bc0c-5204-4463-94e0-88b9665c59d7/slide_0/ffd1b44d-de6b-4412-b9a7-7c3a8941e868.png"
    },
    "presentation_file": "https://66f903215ee11cb820883e93cff8c6d6.r2.cloudflarestorage.com/present-for-me/presentations/db1d2394-bf4c-47ef-92d9-d0363461237f.pptx",
    "structure": "https://pub-ae5a83dfee0146d886142453235c2605.r2.dev/16c6bc0c-5204-4463-94e0-88b9665c59d7/structure.json"
  };

  try {
    const structureResponse = await fetch(baseData.structure);
    if (!structureResponse.ok) {
      throw new Error('Failed to fetch structure data');
    }
    const structureData = await structureResponse.json();
    baseData["structure"] = structureData


    return NextResponse.json(baseData);
  } catch (error) {
    console.error('Error fetching structure data:', error);
    return NextResponse.json({ error: 'Failed to fetch structure data' }, { status: 500 });
  }
}