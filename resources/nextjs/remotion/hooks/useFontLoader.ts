'use client';

import { useState, useEffect } from "react";
import { continueRender, delayRender } from 'remotion';
import { getAvailableFonts } from "@remotion/google-fonts";
import { SlideData } from "../types/slideTypes";

const externalFonts = {
  'Liberation Sans': [{
      url: 'http://fonts.happyinsights.io/LiberationSans-Regular.ttf',
      weight: '400',
    },
    {
      url: 'http://fonts.happyinsights.io/LiberationSans-Bold.ttf',
      weight: '700',
    },
    {
      url: 'http://fonts.happyinsights.io/LiberationSans-Italic.ttf',
      weight: '400',
      style: 'italic',
    }
  ],
  'Calibri': [{
      url: 'http://fonts.happyinsights.io/Calibri-Regular.ttf',
      weight: '400',
    },
    {
      url: 'http://fonts.happyinsights.io/Calibri-Bold.ttf',
      weight: '700',
    },
    {
      url: 'http://fonts.happyinsights.io/Calibri-Italic.ttf',
      weight: '400',
      style: 'italic',
    }
  ],
  'Calibri Light': [{
    url: 'http://fonts.happyinsights.io/calibril.ttf',
    weight: '400',
  }]
}

export const useFontLoader = (slides: SlideData[] | null) => {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    if (!slides?.length) {
      setFontsLoaded(true);
      return;
    }

    const handle = delayRender("Loading fonts...");

    // Collect unique fonts from all slides
    const uniqueFonts = new Set(
      slides.flatMap(slide => 
        slide.shapes?.flatMap(shape => 
          shape.text_frame?.paragraphs?.flatMap(paragraph => 
            paragraph.runs?.map(run => run.font_name)
          ) ?? []
        ) ?? []
      ).filter(Boolean)
    );

    const loadAllFonts = async () => {
      try {
        const availableFonts = getAvailableFonts();
        const fontPromises = Array.from(uniqueFonts).map(async (fontName) => {
          if (!fontName) return;
          
          // Remove any quotes and trim whitespace
          const cleanFontName = fontName.toString().replace(/["']/g, '').trim();
          
          // Find the matching Google Font
          const googleFont = availableFonts.find(
            font => font.fontFamily.toLowerCase() === cleanFontName.toLowerCase()
          );

          if (googleFont) {
            try {
              const font = await googleFont.load();
              await font.loadFont();
            } catch (err) {
              console.warn(`Failed to load Google font ${cleanFontName}:`, err);
            }
          } else {
            // Check if font exists in externalFonts
            const externalFont = externalFonts[cleanFontName as keyof typeof externalFonts];
            
            if (externalFont) {
              try {
                // Load all font variants
                await Promise.all(externalFont.map(async (fontData) => {
                  const font = new FontFace(
                    cleanFontName,
                    `url(${fontData.url})`,
                    {
                      weight: fontData.weight,
                      style: fontData.style || 'normal'
                    }
                  );
                  await font.load();
                  document.fonts.add(font);
                }));
              } catch (err) {
                console.warn(`Failed to load external font ${cleanFontName}:`, err);
              }
            } else {
              console.warn(`Font not found in Google Fonts or external fonts: ${cleanFontName}`);
            }
          }
        });

        await Promise.all(fontPromises);
        setFontsLoaded(true);
        continueRender(handle);
      } catch (err) {
        console.error("Error loading fonts:", err);
        // Continue rendering even if fonts fail to load
        setFontsLoaded(true);
        continueRender(handle);
      }
    };

    loadAllFonts();

    return () => {
      continueRender(handle);
    };
  }, [slides]);

  return { fontsLoaded };
};
