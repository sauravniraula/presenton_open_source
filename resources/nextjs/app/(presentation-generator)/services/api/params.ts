export interface ImageSearch {
    user_id:string;
    presentation_id:string;
    query:string;
    page:number;
    limit:number;
}

export interface ImageGenerate {
    user_id:string;
    presentation_id:string;
    prompt:{
        theme_prompt:string;
        image_prompt:string;
        aspect_ratio:string;
    };
}
export interface IconSearch {
    user_id:string,
    presentation_id:string,

    query:string;
    category?:string
    page:number,
    limit:number;
}