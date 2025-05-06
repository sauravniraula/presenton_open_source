import { Slide } from '../types/slide';



export const collectSlideContent = (): Slide[] => {
  const slideContents: Slide[] = [];
  
  // Get all slide containers
  const slideContainers = document.querySelectorAll('[data-element-type="slide-container"]');

  
  slideContainers.forEach((container) => {
    const index = parseInt(container.getAttribute('data-slide-index') || '0');
    const design_index = parseInt(container.getAttribute('data-design-index') || '0');
    const slide_type = parseInt(container.getAttribute('data-slide-type') || '0');
    
    const title = document.querySelector(`[data-element-id=${`slide-${index}-title`}]`)?.textContent||''
    const slideId = container?.getAttribute('data-slide-id')||''
     
    const slideContent: Slide = {
      id: slideId,
      index: index,
      type: slide_type,
      design_index: design_index,
      images: [],
      icons: [],
      graph_id: null,
      graph: undefined,
      presentation: '',
      content: { title: title, body: [], image_prompts: [] },
    };
    const imagesEl = container.querySelectorAll('img')
    imagesEl.forEach((imageEl) => {
      const image = imageEl.getAttribute('data-is-image')
      if(image){
        if(imageEl.src){
          let src = imageEl.src;
          if(imageEl.src.includes('https://s3.ap-south-1.amazonaws.com/pptgen-public-v2/')){
            src = imageEl.src.replace('https://s3.ap-south-1.amazonaws.com/pptgen-public-v2/', '')
          }
          slideContent.images?.push(src)
        }
      }
      const icon = imageEl.getAttribute('data-is-icon')
      if(icon){
        let src = imageEl.src;
        if(imageEl.src.includes('https://s3.ap-south-1.amazonaws.com/pptgen-public-v2/')){
          src = imageEl.src.replace('https://s3.ap-south-1.amazonaws.com/pptgen-public-v2/', '')
        }
        slideContent.icons?.push(src)
      }
    })
    const graph = document.querySelector(`[data-element-id=${`slide-${index}-graph`}]`)?.textContent||''
    if(graph){
      const graphData = JSON.parse(graph)
      slideContent.graph = graphData
      slideContent.graph_id = graphData.id
    }
    const descriptionBody = document.querySelector(`[data-element-id=${`slide-${index}-description-body`}]`)
    const description = document.querySelector(`[data-element-id=${`slide-${index}-description`}]`)?.textContent||''
    const heading1 = document.querySelector(`[data-element-id=${`slide-${index}-item-0-heading`}]`)?.textContent||''
    const heading2 = document.querySelector(`[data-element-id=${`slide-${index}-item-1-heading`}]`)?.textContent||''
    const heading3 = document.querySelector(`[data-element-id=${`slide-${index}-item-2-heading`}]`)?.textContent||''
    const heading4 = document.querySelector(`[data-element-id=${`slide-${index}-item-3-heading`}]`)?.textContent||''
    const description1 = document.querySelector(`[data-element-id=${`slide-${index}-item-0-description`}]`)?.textContent||''
    const description2 = document.querySelector(`[data-element-id=${`slide-${index}-item-1-description`}]`)?.textContent||''
    const description3 = document.querySelector(`[data-element-id=${`slide-${index}-item-2-description`}]`)?.textContent||''
    const description4 = document.querySelector(`[data-element-id=${`slide-${index}-item-3-description`}]`)?.textContent||''

    if(description){
      slideContent.content.description = description
    } 
    if(descriptionBody){
      slideContent.content.body = descriptionBody.textContent||''
       slideContents.push(slideContent);
    }else{

        if(heading1 && description1){
            // @ts-ignore
            slideContent.content.body.push({ heading: heading1, description: description1 })
        }
        if(heading2 && description2){
            // @ts-ignore
            slideContent.content.body.push({ heading: heading2, description: description2 })
        }
        if(heading3 && description3){
            // @ts-ignore
            slideContent.content.body.push({ heading: heading3, description: description3 })
        }
        if(heading4 && description4){
            // @ts-ignore
            slideContent.content.body.push({ heading: heading4, description: description4 })
        }
        slideContents.push(slideContent);
    }
   
    });
  
  return slideContents;
};

