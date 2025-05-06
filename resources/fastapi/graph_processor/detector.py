import os
from typing import List
import aiohttp

from graph_processor.models import DetectedObjectModel

ACCEPTED_CLASSES = [0, 1, 3, 4, 5, 6, 10, 12]



async def detect_graphs(zip_link: str) -> List[List[DetectedObjectModel]]:

    async with aiohttp.ClientSession() as client:
        response = await client.post(
            os.getenv("GRAPH_DETECTION_ENDPOINT"),
            headers={"Authorization": f"Bearer {os.getenv('BEAM_CLOUD_AUTH_TOKEN')}"},
            json={"zip_link": zip_link},
        )
        response = await response.json()

        detected_graphs_collection = []
        for each_image in response:
            detected_graphs = []
            for each_graph in each_image:
                confidence = each_graph["confidence"]
                if confidence < 0.4:
                    continue

                detected_graphs.append(
                    DetectedObjectModel(
                        class_id=each_graph["class"],
                        class_name=each_graph["name"],
                        confidence=confidence,
                        bbox=list(each_graph["box"].values()),
                    ),
                )

            detected_graphs_collection.append(detected_graphs)

        return detected_graphs_collection


async def detect_tables(zip_link: str) -> List[List[DetectedObjectModel]]:

    async with aiohttp.ClientSession() as client:
        response = await client.post(
            os.getenv("TABLE_DETECTION_ENDPOINT"),
            headers={"Authorization": f"Bearer {os.getenv('BEAM_CLOUD_AUTH_TOKEN')}"},
            json={"zip_link": zip_link},
        )
        response = await response.json()

        detected_tables_collection = []
        for each_image in response:
            detected_tables = []
            predictions = each_image["predictions"]
            for each_table in predictions:
                confidence = each_table["confidence"]
                if confidence < 0.5:
                    continue

                half_width = each_table["width"] // 2
                half_height = each_table["height"] // 2

                x1 = each_table["x"] - half_width
                y1 = each_table["y"] - half_height
                x2 = each_table["x"] + half_width
                y2 = each_table["y"] + half_height

                detected_tables.append(
                    DetectedObjectModel(
                        class_id=each_table["class_id"],
                        class_name=each_table["class_name"],
                        confidence=confidence,
                        bbox=[x1, y1, x2, y2],
                    ),
                )

            detected_tables_collection.append(detected_tables)

        return detected_tables_collection
