ANIMATED_SCHEMA = {
    "type": "json_schema",
    "json_schema": {
      "name": "script_segments",
      "strict": True,
      "schema": {
        
        "type": "object",
        "properties": {
          "segments": {
            "type": "array",
            "description": "A collection of script segments for the speech.",
            "items": {
              "type": "object",
              "properties": {
                "script_segment": {
                  "type": "string",
                  "description": "The actual script segment for the speech."
                },
                "texts": {
                  "type": "array",
                  "description": "Collection of texts associated with the script segment.",
                  "items": {
                    "type": "object",
                    "properties": {
                      "text_id": {
                        "type": "string",
                        "description": "Unique identifier for the text."
                      },
                      "text": {
                        "type": "string",
                        "description": "The actual text related to the script segment."
                      },
                      "animation": {
                        "type": "string",
                        "description": "The animation type for the text."
                      }
                    },
                    "required": [
                      "text_id",
                      "text",
                      "animation"
                    ],
                    "additionalProperties": False
                  }
                }
              },
              "required": [
                "script_segment",
                "texts"
              ],
              "additionalProperties": False
            }
          }
        },
        "required": [
          "segments"
        ],
        "additionalProperties": False
      }
    }
  }

SCRIPT_SCHEMA = {
    "type": "json_schema",
    "json_schema": {
      "name": "script_response",
      "strict": True,
      "schema": {
        "type": "object",
        "properties": {
          "slides": {
            "type": "array",
            "description": "An array of slides, each containing an index and script content.",
            "items": {
              "type": "object",
              "properties": {
                "index": {
                  "type": "number",
                  "description": "The index of the slide in the array."
                },
                "script": {
                  "type": "string",
                  "description": "The script content of the slide."
                }
              },
              "required": [
                "index",
                "script"
              ],
              "additionalProperties": False
            }
          }
        },
        "required": [
          "slides"
        ],
        "additionalProperties": False
      }
    }
  }

