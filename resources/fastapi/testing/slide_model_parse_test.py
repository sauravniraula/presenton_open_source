from ppt_generator.models.slide_model import SlideModel


to_be_parse = [
    {
        "id": None,
        "index": 1,
        "type": 1,
        "design_index": None,
        "thumbnail": None,
        "images": None,
        "icons": None,
        "graph_id": None,
        "presentation": "392f1eed-7841-4291-9935-f92d3b54e2ee",
        "content": {
            "title": "Introduction: Flavor Preferences",
            "body": "An overview of popular flavor preferences among individuals, highlighting trends and tastes across different demographics.",
            "image_prompts": [
                "A colorful assortment of ice cream cones in different flavors"
            ],
        },
    },
    {
        "id": None,
        "index": 2,
        "type": 5,
        "design_index": None,
        "thumbnail": None,
        "images": None,
        "icons": None,
        "graph_id": "1178a33f-f0b5-4845-9354-14517b99ec33",
        "presentation": "392f1eed-7841-4291-9935-f92d3b54e2ee",
        "content": {
            "title": "Chocolate: Gender Insights",
            "body": "An analysis of how gender influences chocolate flavor preferences, exploring the differences observed between males and females.",
        },
    },
    {
        "id": None,
        "index": 3,
        "type": 8,
        "design_index": None,
        "thumbnail": None,
        "images": None,
        "icons": None,
        "graph_id": None,
        "presentation": "392f1eed-7841-4291-9935-f92d3b54e2ee",
        "content": {
            "title": "Strawberry: Taste Analysis",
            "description": "An in-depth analysis of consumer preferences for strawberry flavor, focusing on taste perceptions and factors influencing its popularity.",
            "body": [
                {
                    "heading": "Sweetness",
                    "description": "Exploring how the sweetness level affects consumer preference for strawberry flavor.",
                },
                {
                    "heading": "Freshness",
                    "description": "Analyzing the impact of perceived freshness on the popularity of strawberry-flavored products.",
                },
            ],
            "icon_queries": [
                {
                    "queries": [
                        "strawberry sweetness icon",
                        "sugar icon",
                        "sweet taste icon",
                    ]
                },
                {"queries": ["fresh strawberry icon", "freshness symbol", "leaf icon"]},
            ],
        },
    },
    {
        "id": None,
        "index": 4,
        "type": 8,
        "design_index": None,
        "thumbnail": None,
        "images": None,
        "icons": None,
        "graph_id": None,
        "presentation": "392f1eed-7841-4291-9935-f92d3b54e2ee",
        "content": {
            "title": "Vanilla: Flavor Breakdown",
            "description": "A detailed breakdown of vanilla flavor components and consumer preferences.",
            "body": [
                {
                    "heading": "Aroma",
                    "description": "Examining the significance of aroma in vanilla flavor appeal.",
                },
                {
                    "heading": "Creaminess",
                    "description": "Understanding how creaminess influences vanilla flavor enjoyment.",
                },
                {
                    "heading": "Popularity",
                    "description": "Assessing the overall popularity of vanilla among consumers.",
                },
            ],
            "icon_queries": [
                {"queries": ["vanilla scent icon", "aroma icon", "nose smell icon"]},
                {"queries": ["creamy texture icon", "milk icon", "smoothness icon"]},
                {"queries": ["star icon", "thumbs up icon", "people icon"]},
            ],
        },
    },
    {
        "id": None,
        "index": 5,
        "type": 6,
        "design_index": None,
        "thumbnail": None,
        "images": None,
        "icons": None,
        "graph_id": None,
        "presentation": "392f1eed-7841-4291-9935-f92d3b54e2ee",
        "content": {
            "title": "Conclusion: Summary of Findings",
            "description": "A concise summary of our key flavor preference findings.",
            "body": [
                {
                    "heading": "Chocolate",
                    "description": "Chocolate remains a top preference, influenced by gender differences.",
                },
                {
                    "heading": "Strawberry",
                    "description": "Strawberry's appeal is affected by sweetness and freshness factors.",
                },
                {
                    "heading": "Vanilla",
                    "description": "Vanilla's popularity centers on aroma and creaminess aspects.",
                },
            ],
        },
    },
]


def run_test():
    slide_models = []
    for each in to_be_parse:
        slide_model = SlideModel.from_dict(each)
        slide_models.append(slide_model)

    print(slide_models)
