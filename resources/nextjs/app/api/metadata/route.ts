// import puppeteer from 'puppeteer-core';
// import chromium from '@sparticuz/chromium-min';

// const chromiumPack = "https://github.com/Sparticuz/chromium/releases/download/v132.0.0/chromium-v132.0.0-pack.tar";

export async function POST(req: Request) {
  return Response.json({message:'hello'})
  // const { url, theme, customColors } = await req.json();

  // let browser;
  // try {
  //   browser = await puppeteer.launch({
  //    args:chromium.args,
  //    executablePath:await chromium.executablePath(chromiumPack),
  //    headless:true,
  //   });

  //   const page = await browser.newPage();
    
  //   // Set viewport to match slide dimensions
  //   await page.setViewport({
  //     width: 1440,
  //     height: 900,
  //     deviceScaleFactor: 1,
  //   });

  //   // Add error handling for navigation
  //   try {
  //     await page.goto(url, {
  //       waitUntil: 'networkidle0',
  //       timeout: 60000 // Increase timeout to 60 seconds
  //     });
  //   } catch (error) {
  //     console.error('Navigation error:', error);
  //     await browser.close();
  //     return new Response(JSON.stringify({ error: 'Failed to load page' }), {
  //       status: 500,
  //       headers: { 'Content-Type': 'application/json' },
  //     });
  //   }

  //   // Wait for slides to be fully rendered
  //   try {
  //     await page.waitForSelector('[data-element-type="slide-container"]', { timeout: 60000 });
      
  //     // Apply theme and custom colors if needed
  //     await page.evaluate(async (params:any) => {
  //       const { theme, customColors } = params;
  //       const containers = document.querySelectorAll('.slide-theme');
        
  //       containers.forEach(container => {
  //         container.removeAttribute('data-theme');
  //         container.setAttribute('data-theme', theme);
  //       });

  //       if (theme === 'custom' && customColors) {
  //         const root = document.documentElement;
  //         root.style.setProperty('--custom-slide-bg', customColors.slideBg);
  //         root.style.setProperty('--custom-slide-title', customColors.slideTitle);
  //         root.style.setProperty('--custom-slide-heading', customColors.slideHeading);
  //         root.style.setProperty('--custom-slide-description', customColors.slideDescription);
  //         root.style.setProperty('--custom-slide-box', customColors.slideBox);
  //       }
  //     }, { theme, customColors });

  
  //     // Check if there are any graphs
  //   //   const hasGraphs = await page.evaluate(() => {
  //   //     return document.querySelectorAll('[data-element-type="graph"]').length > 0;
  //   //   });
  //   //   //wait for graphs to be rendered
  //   //   if(hasGraphs){
  //   //  await new Promise(resolve => setTimeout(resolve, 1000));
  //   //   }

  //     // if (hasGraphs) {
  //     //   // Wait specifically for graphs to be rendered
  //     //   await page.waitForFunction(() => {
  //     //     const charts = document.querySelectorAll('[data-element-type="graph"]');
  //     //     return Array.from(charts).every(chart => {
  //     //       const rect = chart.getBoundingClientRect();
  //     //       return rect.width > 0 && rect.height > 0;
  //     //     });
  //     //   }, { timeout: 5000 }).catch(() => {
  //     //     console.log('Graph rendering timeout, proceeding anyway');
  //     //   });
  //     // }

  //   } catch (error) {
  //     console.error('Error during page preparation:', error);
  //     // Continue anyway - we'll try to capture what we can
  //   }

  //   const metadata = await page.evaluate(async () => {
  //     interface Position {
  //       left: number;
  //       top: number;
  //       width: number;
  //       height: number;
  //     }

  //     interface FontStyles {
  //       name: string;
  //       size: number;
  //       weight: number;
  //       color: string;
  //       bold:boolean;
  //     }

  //     interface SlideMetadata {
  //       slideIndex: number;
  //       backgroundColor: string;
  //       elements: any[];
  //     }

  //     function rgbToHex(color: string): string {
  //       if (!color || color === 'transparent' || color === 'none') return '000000';
  //       if (color.startsWith('#')) return color.replace('#', '');
  //       const matches = color.match(/\d+/g);
  //       if (!matches) return '000000';
  //       const r = parseInt(matches[0]);
  //       const g = parseInt(matches[1]);
  //       const b = parseInt(matches[2]);
  //       return [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
  //     }

  //     async function collectSlideMetadata(): Promise<SlideMetadata[]> {
  //       const slidesMetadata: SlideMetadata[] = [];
  //       const slideContainers = Array.from(document.querySelectorAll('[data-element-type="slide-container"]'));
        
  //       for (const container of slideContainers) {
  //         const containerEl = container as HTMLElement;
  //         containerEl.style.width = '1280px';
  //         containerEl.style.height = '720px';
  //         containerEl.style.transform = 'none';
          
  //         const containerRect = containerEl.getBoundingClientRect();
  //         const slideIndex = parseInt(containerEl.getAttribute('data-slide-index') || '0');
  //         const containerComputedStyle = window.getComputedStyle(containerEl);
          
  //         const slideMetadata: SlideMetadata = {
  //           slideIndex,
  //           backgroundColor: rgbToHex(containerComputedStyle.backgroundColor),
  //           elements: []
  //         };
  //          const slideType = containerEl.getAttribute('data-slide-type');

  //         const elements = Array.from(containerEl.querySelectorAll('[data-slide-element]:not([data-element-type="slide-container"])'));
          
  //         for (const element of elements) {
  //           const el = element as HTMLElement;
  //           const isIcon = el.getAttribute('data-is-icon');
  //           const isTitle = el.getAttribute('data-is-title');
           
  //           const elementRect = el.getBoundingClientRect();
  //           const computedStyle = window.getComputedStyle(el);

  //           const position: Position = {
  //             left: Math.round(elementRect.left - containerRect.left),
  //             top: Math.round(elementRect.top - containerRect.top),
  //             width: Math.round(elementRect.width),
  //             height: Math.round(elementRect.height)
  //           };

  //           const elementType = el.getAttribute('data-element-type');
  //           if (!elementType) continue;

  //           const fontStyles: FontStyles = {
  //             name: "Roboto",
  //             size: isTitle ? parseInt(computedStyle.fontSize) -2 : parseInt(computedStyle.fontSize),
  //             bold: parseInt(computedStyle.fontWeight) >= 500 ? true:false,
  //             weight: parseInt(computedStyle.fontWeight),
  //             color: rgbToHex(computedStyle.color)
  //           };

  //           switch (elementType) {
  //             case 'text':
  //               slideMetadata.elements.push({
  //                 position,
  //                 paragraphs: [{
  //                   text: el.textContent || '',
  //                   font: fontStyles
  //                 }]
  //               });
  //               break;

  //             case 'picture':
  //               const imgEl = el.tagName.toLowerCase() === 'img' ? 
  //                 (el as HTMLImageElement) : 
  //                 (el.querySelector('img') as HTMLImageElement);
  //               if (imgEl) {
  //                 slideMetadata.elements.push({
  //                   position,
  //                   picture: {
  //                     is_network: imgEl.src.startsWith('http'),
  //                     path: imgEl.src || imgEl.getAttribute('data-image-path') || '',
  //                   },
  //                   overlay: isIcon ? 'ffffff' : null,
  //                   border_radius: slideType === '4'  ? [parseInt(computedStyle.borderRadius),parseInt(computedStyle.borderRadius),0,0] : [parseInt(computedStyle.borderRadius),parseInt(computedStyle.borderRadius),parseInt(computedStyle.borderRadius),parseInt(computedStyle.borderRadius)]
  //                 });
  //               }
  //               break;

  //             case 'slide-box':
  //             case 'filledbox':
  //               const boxShadow = computedStyle.boxShadow;
  //               let shadowRadius = 0;
  //               let shadowColor = '000000';
  //               let shadowOffsetX = 0;
  //               let shadowOffsetY = 0;
  //               let shadowOpacity = 0;

  //               if (boxShadow && boxShadow !== 'none') {
  //                 const boxShadowRegex = /rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*([\d.]+)?\)?\s+(-?\d+)px\s+(-?\d+)px\s+(-?\d+)px/;
  //                 const match = boxShadow.match(boxShadowRegex);

  //                 if (match) {
  //                   const r = match[1];
  //                   const g = match[2];
  //                   const b = match[3];
  //                   const rgbStr = 'rgb(' + r + ', ' + g + ', ' + b + ')';
  //                   shadowColor = rgbToHex(rgbStr);
  //                   shadowOpacity = match[4] ? parseFloat(match[4]) : 1;
  //                   shadowOffsetX = parseInt(match[5]);
  //                   shadowOffsetY = parseInt(match[6]);
  //                   shadowRadius = parseInt(match[7]);
  //                 }
  //               }

  //               slideMetadata.elements.push({
  //                 position,
  //                 type: computedStyle.borderRadius === '9999px' || computedStyle.borderRadius === '50%' ? 9 : 5,
  //                 fill: {
  //                   color: rgbToHex(computedStyle.backgroundColor),
  //                 },
  //                 border_radius: parseInt(computedStyle.borderRadius) || 0,
  //                 stroke: {
  //                   color: rgbToHex(computedStyle.borderColor),
  //                   thickness: parseInt(computedStyle.borderWidth) || 0,
  //                 },
  //                 shadow: {
  //                   radius: shadowRadius,
  //                   color: shadowColor,
  //                   offset: Math.sqrt(shadowOffsetX * shadowOffsetX + shadowOffsetY * shadowOffsetY),
  //                   opacity: shadowOpacity,
  //                   angle: Math.round((Math.atan2(shadowOffsetY, shadowOffsetX) * 180) / Math.PI),
  //                 },
  //               });
  //               break;

  //             case 'line':
  //               slideMetadata.elements.push({
  //                 position,
  //                 lineType: 1,
  //                 thickness: computedStyle.borderWidth || computedStyle.height,
  //                 color: rgbToHex(computedStyle.borderColor || computedStyle.backgroundColor)
  //               });
  //               break;

  //             case 'graph':
  //               const graphType = el.getAttribute('data-graph-type');
  //               const graphId = el.getAttribute('data-element-id');
                
  //               slideMetadata.elements.push({
  //                 position,
  //                 picture: {
  //                   is_network: true,
  //                   path: `__GRAPH_PLACEHOLDER__${graphId}`,
  //                 },
  //                 border_radius: [0, 0, 0, 0]
  //               });
  //               break;
  //           }
  //         }

  //         slidesMetadata.push(slideMetadata);
  //       }
        
  //       return slidesMetadata;
  //     }

  //     return await collectSlideMetadata();
  //   });

  //   // Now handle graph screenshots outside of page.evaluate
  //   const graphElements = await page.$$('[data-element-type="graph"]');
    
  //   for (const graphElement of graphElements) {
  //     const graphId = await graphElement.evaluate((el:any) => el.getAttribute('data-element-id'));
      
  //     // Take screenshot of the graph
  //     const screenshot = await graphElement.screenshot({
  //       type: 'png',
  //       encoding: 'base64'
  //     });

  //     // Upload to S3 using the user-upload API
  //     const formData = new FormData();
  //     formData.append('file', new Blob([Buffer.from(screenshot, 'base64')], { type: 'image/png' }));
      
  //     const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/user-upload`, {
  //       method: 'POST',
  //       body: formData
  //     });

  //     if (!uploadResponse.ok) {
  //       console.error('Failed to upload graph screenshot');
  //       continue;
  //     }

  //     const { url: imageUrl } = await uploadResponse.json();

  //     // Update metadata with the real URL
  //     metadata.forEach((slide:any) => {
  //       slide.elements.forEach((element:any) => {
  //         if (element.picture && element.picture.path === `__GRAPH_PLACEHOLDER__${graphId}`) {
  //           element.picture.path = imageUrl;
  //         }
  //       });
  //     });
  //   }

  //   await browser.close();

  //   return new Response(JSON.stringify(metadata), {
  //     headers: { 'Content-Type': 'application/json' },
  //   });
  // } catch (error) {
  //   console.error('Puppeteer error:', error);
  //   if (browser) {
  //     await browser.close();
  //   }
  //   return new Response(JSON.stringify({ error: 'Internal server error' }), {
  //     status: 500,
  //     headers: { 'Content-Type': 'application/json' },
  //   });
  // }
} 



// code from lambda
// import puppeteer from "puppeteer-core";
// import express from "express";
// import chromium from "@sparticuz/chromium-min";
// import cors from 'cors';
// const chromiumPack =
//   "https://github.com/Sparticuz/chromium/releases/download/v132.0.0/chromium-v132.0.0-pack.tar";

// export const handler = async (event) => {
//   let body = {};
//   let browser;

//   // Validate incoming request
//   try {
//     if (!event.body) {
//       return {
//         statusCode: 400,
//         body: JSON.stringify({ error: "Request body is required" }),
//         headers: { "Content-Type": "application/json" },
//       };
//     }

//     body = JSON.parse(event.body);
    
//     // Validate required fields
//     if (!body.url) {
//       return {
//         statusCode: 400,
//         body: JSON.stringify({ error: "URL is required" }),
//         headers: { "Content-Type": "application/json" },
//       };
//     }

//     // Set default theme if not provided
//     const { url, theme = 'default', customColors } = body;

//     // Validate custom colors when theme is 'custom'
//     if (theme === 'custom' && (!customColors || Object.keys(customColors).length === 0)) {
//       return {
//         statusCode: 400,
//         body: JSON.stringify({ error: "Custom colors are required when theme is 'custom'" }),
//         headers: { "Content-Type": "application/json" },
//       };
//     }

//     // Initialize browser
//     browser = await puppeteer.launch({
//       args: chromium.args,
//       executablePath: await chromium.executablePath(chromiumPack),
//       headless: true,
//     });
//     const page = await browser.newPage();
//     await page.viewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
//     try {
//       await page.goto(url, {
//         waitUntil: "networkidle0",
//         timeout: 60000, // Increase timeout to 60 seconds
//       });
//     } catch (error) {
//       console.error("Navigation error:", error);
//       await browser.close();
//       return {
//         statusCode: 500,
//         body: JSON.stringify({"navigation error": error}),
//         headers: { "Content-Type": "application/json" },
//       };
//     }
//     try {
//       await page.waitForSelector('[data-element-type="slide-container"]', {
//         timeout: 60000,
//       });
//       // Apply theme and custom colors if needed
//       await page.evaluate(
//         async (params) => {
//           const { theme, customColors } = params;
//           const containers = document.querySelectorAll(".slide-theme");

//           containers.forEach((container) => {
//             container.removeAttribute("data-theme");
//             container.setAttribute("data-theme", theme);
//           });

//           if (theme === "custom" && customColors) {
//             const root = document.documentElement;
//             root.style.setProperty("--custom-slide-bg", customColors.slideBg);
//             root.style.setProperty(
//               "--custom-slide-title",
//               customColors.slideTitle
//             );
//             root.style.setProperty(
//               "--custom-slide-heading",
//               customColors.slideHeading
//             );
//             root.style.setProperty(
//               "--custom-slide-description",
//               customColors.slideDescription
//             );
//             root.style.setProperty("--custom-slide-box", customColors.slideBox);
//           }
//         },
//         { theme, customColors }
//       );
//     } catch (error) {
//       console.error("Slide container not found:", error);
//       await browser.close();
//       return {
//         statusCode: 500,
//         body: JSON.stringify({ error: "Slide container not found" }),
//         headers: { "Content-Type": "application/json" },
//       };
//     }
//    await new Promise(resolve => setTimeout(resolve, 10000));
//     const metadata = await page.evaluate(async () => {
//       function rgbToHex(color) {
//         if (!color || color === "transparent" || color === "none")
//           return "000000";
//         if (color.startsWith("#")) return color.replace("#", "");
//         const matches = color.match(/\d+/g);
//         if (!matches) return "000000";
//         const r = parseInt(matches[0]);
//         const g = parseInt(matches[1]);
//         const b = parseInt(matches[2]);
//         return [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
//       }
//       async function collectSlideMetadata() {
//         const slidesMetadata = [];
//         const slideContainers = Array.from(
//           document.querySelectorAll('[data-element-type="slide-container"]')
//         );

//         for (const container of slideContainers) {
//           const containerEl = container;
//           containerEl.style.width = "1280px";
//           containerEl.style.height = "720px";
//           containerEl.style.transform = "none";

//           const containerRect = containerEl.getBoundingClientRect();
//           const slideIndex = parseInt(
//             containerEl.getAttribute("data-slide-index") || "0"
//           );
//           const containerComputedStyle = window.getComputedStyle(containerEl);

//           const slideMetadata = {
//             slideIndex,
//             backgroundColor: rgbToHex(containerComputedStyle.backgroundColor),
//             elements: [],
//           };
//           const slideType = containerEl.getAttribute("data-slide-type");

//           const elements = Array.from(
//             containerEl.querySelectorAll(
//               '[data-slide-element]:not([data-element-type="slide-container"])'
//             )
//           );

//           for (const element of elements) {
//             const el = element;
//             const isIcon = el.getAttribute("data-is-icon");
//             const isAlign = el.getAttribute("data-is-align");

//             const elementRect = el.getBoundingClientRect();
//             const computedStyle = window.getComputedStyle(el);

//             const position = {
//               left: Math.round(elementRect.left - containerRect.left),
//               top: Math.round(elementRect.top - containerRect.top),
//               width: Math.round(elementRect.width),
//               height: Math.round(elementRect.height),
//             };

//             const elementType = el.getAttribute("data-element-type");
//             if (!elementType) continue;

//             const fontStyles = {
//               name: computedStyle.fontFamily.split('_')[2] ||'Inter',
//               size: parseInt(computedStyle.fontSize),
//               bold: parseInt(computedStyle.fontWeight) >= 500 ? true : false,
//               weight: parseInt(computedStyle.fontWeight),
//               color: rgbToHex(computedStyle.color),
//             };

//             switch (elementType) {
//               case "text":
//                 const textContent = el.getAttribute("data-text-content");
//                 slideMetadata.elements.push({
//                   position,
//                   paragraphs: [
//                     {
//                       alignment:isAlign ==='true' ?2:1,
//                       text: textContent || "",
//                       font: fontStyles,
//                     },
//                   ],
//                 });
//                 break;

//               case "picture":
//                 const imgEl =
//                   el.tagName.toLowerCase() === "img"
//                     ? el
//                     : el.querySelector("img");
//                 if (imgEl) {
//                   slideMetadata.elements.push({
//                     position,
//                     picture: {
//                       is_network: imgEl.src.startsWith("http"),
//                       path:
//                         imgEl.src ||
//                         imgEl.getAttribute("data-image-path") ||
//                         "",
//                     },
//                     overlay: isIcon ? "ffffff" : null,
//                     border_radius:
//                       slideType === "4"
//                         ? [
//                             parseInt(computedStyle.borderRadius),
//                             parseInt(computedStyle.borderRadius),
//                             0,
//                             0,
//                           ]
//                         : [
//                             parseInt(computedStyle.borderRadius),
//                             parseInt(computedStyle.borderRadius),
//                             parseInt(computedStyle.borderRadius),
//                             parseInt(computedStyle.borderRadius),
//                           ],
//                   });
//                 }
//                 break;

//               case "slide-box":
//               case "filledbox":
//                 const boxShadow = computedStyle.boxShadow;
//                 let shadowRadius = 0;
//                 let shadowColor = "000000";
//                 let shadowOffsetX = 0;
//                 let shadowOffsetY = 0;
//                 let shadowOpacity = 0;

//                 if (boxShadow && boxShadow !== "none") {
//                   const boxShadowRegex =
//                     /rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*([\d.]+)?\)?\s+(-?\d+)px\s+(-?\d+)px\s+(-?\d+)px/;
//                   const match = boxShadow.match(boxShadowRegex);

//                   if (match) {
//                     const r = match[1];
//                     const g = match[2];
//                     const b = match[3];
//                     const rgbStr = "rgb(" + r + ", " + g + ", " + b + ")";
//                     shadowColor = rgbToHex(rgbStr);
//                     shadowOpacity = match[4] ? parseFloat(match[4]) : 1;
//                     shadowOffsetX = parseInt(match[5]);
//                     shadowOffsetY = parseInt(match[6]);
//                     shadowRadius = parseInt(match[7]);
//                   }
//                 }

//                 slideMetadata.elements.push({
//                   position,
//                   type:
//                     computedStyle.borderRadius === "9999px" ||
//                     computedStyle.borderRadius === "50%"
//                       ? 9
//                       : 5,
//                   fill: {
//                     color: rgbToHex(computedStyle.backgroundColor),
//                   },
//                   border_radius: parseInt(computedStyle.borderRadius) || 0,
//                   stroke: {
//                     color: rgbToHex(computedStyle.borderColor),
//                     thickness: parseInt(computedStyle.borderWidth) || 0,
//                   },
//                   shadow: {
//                     radius: shadowRadius,
//                     color: shadowColor,
//                     offset: Math.sqrt(
//                       shadowOffsetX * shadowOffsetX +
//                         shadowOffsetY * shadowOffsetY
//                     ),
//                     opacity: shadowOpacity,
//                     angle: Math.round(
//                       (Math.atan2(shadowOffsetY, shadowOffsetX) * 180) / Math.PI
//                     ),
//                   },
//                 });
//                 break;

//               case "line":
//                 slideMetadata.elements.push({
//                   position,
//                   lineType: 1,
//                   thickness: computedStyle.borderWidth || computedStyle.height,
//                   color: rgbToHex(
//                     computedStyle.borderColor || computedStyle.backgroundColor
//                   ),
//                 });
//                 break;

//               case "graph":
//                 const graphType = el.getAttribute("data-graph-type");
//                 const graphId = el.getAttribute("data-element-id");

//                 slideMetadata.elements.push({
//                   position,
//                   picture: {
//                     is_network: true,
//                     path: `__GRAPH_PLACEHOLDER__${graphId}`,
//                   },
//                   border_radius: [0, 0, 0, 0],
//                 });
//                 break;
//             }
//           }

//           slidesMetadata.push(slideMetadata);
//         }

//         return slidesMetadata;
//       }
//       return await collectSlideMetadata();
//     });
//     const graphElements = await page.$$('[data-element-type="graph"]');

//     for (const graphElement of graphElements) {
//       const graphId = await graphElement.evaluate((el) =>
//         el.getAttribute("data-element-id")
//       );
//       // Take screenshot of the graph
//       const screenshot = await graphElement.screenshot({
//         type: "png",
//         encoding: "base64",
      
//       });

//       // Upload to S3 using the user-upload API
//       const formData = new FormData();
//       formData.append(
//         "file",
//         new Blob([Buffer.from(screenshot, "base64")], { type: "image/png" })
//       );

//       const uploadResponse = await fetch(
//         `https://presenton.ai/api/user-upload`,
//         {
//           method: "POST",
//           body: formData,
//         }
//       );

//       if (!uploadResponse.ok) {
//         console.error("Failed to upload graph screenshot",uploadResponse);
//         continue;
//       }

//       const { url: imageUrl } = await uploadResponse.json();

//       // Update metadata with the real URL
//       metadata.forEach((slide) => {
//         slide.elements.forEach((element) => {
//           if (
//             element.picture &&
//             element.picture.path === `__GRAPH_PLACEHOLDER__${graphId}`
//           ) {
//             element.picture.path = imageUrl;
//           }
//         });
//       });
//     }
//     await browser.close();
//     return {
//       statusCode: 200,
//       body: JSON.stringify(metadata),
//       headers: { "Content-Type": "application/json" },
//     };
//   } catch (err) {
//     console.error("Error processing request:", err);
//     if (browser) await browser.close();
//     return {
//       statusCode: 500,
//       body: JSON.stringify({ 
//         error: "Internal server error",
//         details: err.message 
//       }),
//       headers: { "Content-Type": "application/json" },
//     };
//   }
// };
