// import puppeteer from 'puppeteer-core';

export async function POST(req: Request) {
  return new Response('Hello World', );
  // const { url, theme } = await req.json();
  
  // const browser = await puppeteer.launch();
  // const page = await browser.newPage();
  
  // // Set viewport
  // await page.setViewport({
  //   width: 1280,
  //   height: 720,
  //   deviceScaleFactor: 1,
  // });

  // // Navigate to the page
  // await page.goto(url, {
  //   waitUntil: 'networkidle0',
  // });

  // // Wait for slides to be rendered
  // await page.waitForSelector('[data-element-type="slide-container"]');
  
  // // Apply theme
  // await page.evaluate((currentTheme) => {
  //   const containers = document.querySelectorAll('.slide-theme');
  //   containers.forEach(container => {
  //     container.removeAttribute('data-theme');
  //     container.setAttribute('data-theme', currentTheme);
  //   });
  //   return new Promise(resolve => setTimeout(resolve, 100));
  // }, theme);

  // // Wait for styles
  // await page.waitForFunction(() => {
  //   const container = document.querySelector('[data-element-type="slide-container"]');
  //   return container && window.getComputedStyle(container).backgroundColor !== 'rgba(0, 0, 0, 0)';
  // });

  // // Collect DPI and viewport data
  // const displayInfo = await page.evaluate(() => {
  //   const div = document.createElement('div');
  //   div.style.width = '1in';
  //   div.style.height = '1in';
  //   div.style.padding = '0';
  //   div.style.position = 'absolute';
  //   div.style.left = '-100%';
  //   div.style.top = '-100%';
  //   document.body.appendChild(div);
  //   const dpi = div.offsetWidth;
  //   document.body.removeChild(div);

  //   // Get the actual viewport dimensions
  //   const viewport = {
  //     width: document.documentElement.clientWidth,
  //     height: document.documentElement.clientHeight
  //   };

  //   // Get the slide container dimensions
  //   const slideContainer = document.querySelector('[data-element-type="slide-container"]');
  //   const slideRect = slideContainer ? slideContainer.getBoundingClientRect() : null;

  //   return {
  //     dpi,
  //     viewport: {
  //       width: viewport.width,
  //       height: viewport.height
  //     },
  //     slideContainer: slideRect ? {
  //       width: Math.round(slideRect.width),
  //       height: Math.round(slideRect.height)
  //     } : null,
  //     deviceScaleFactor: window.devicePixelRatio
  //   };
  // });

  // await browser.close();

  // return new Response(JSON.stringify(displayInfo, null, 2), {
  //   headers: { 'Content-Type': 'application/json' },
  // });
} 