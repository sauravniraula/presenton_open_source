# from ultralytics import YOLO
from PIL import Image
import base64
import io
import json

# model = YOLO("models/best-4000.pt")


def detect_graphs(images):
    detected_graphs = []
    
    
    # predictions = model(images)
    # for prediction, image in zip(predictions, images):
    #     for box in prediction.boxes:
    #         if box.conf.item() > 0.7:  # Check confidence threshold
    #             # Get bounding box coordinates
    #             x1, y1, x2, y2 = [int(coord) for coord in box.xyxy[0].tolist()]
                
    #             # Crop the detected graph
    #             graph_image = image.crop((x1, y1, x2, y2))
                
    #             # Convert to base64
    #             buffered = io.BytesIO()
    #             graph_image.save(buffered, format="PNG")
    #             img_str = base64.b64encode(buffered.getvalue()).decode()
    #             detected_graphs.append(img_str)
    
    return []

if __name__ == "__main__":
    with open("test.json", "r") as f:
        data = json.load(f)
        image_path = data["images"]["3__page_40_Figure_0.jpeg"]
        detected_graphs = detect_graphs([image_path])
        print(len(detected_graphs))

