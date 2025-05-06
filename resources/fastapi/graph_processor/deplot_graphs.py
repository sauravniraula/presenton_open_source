import asyncio
import base64
from http.client import HTTPException
import json
import os
from typing import List, Tuple
import aiohttp

from api.services.email import send_email


async def deplot_charts(charts: List[str]) -> List[str]:

    async with aiohttp.ClientSession() as client:

        async def inner(chart: str) -> Tuple[bool, int, str]:
            with open(chart, "rb") as f:
                chart_b64 = base64.b64encode(f.read()).decode()

            payload = {
                "messages": [
                    {
                        "role": "user",
                        "content": f'Generate underlying data table of the figure below: <img src="data:image/png;base64,{chart_b64}" />',
                    },
                ],
                "max_tokens": 1024,
                "temperature": 0.20,
                "top_p": 0.20,
                "stream": False,
            }

            response = await client.post(
                os.getenv("NVIDIA_DEPLOT_ENDPOINT"),
                headers={"Authorization": f"Bearer {os.getenv('NVIDIA_API_KEY')}"},
                json=payload,
            )

            print("Deplot Response Status: ", response.status)
            response_data = ""
            status_code = response.status
            try:
                data = await response.json()
                response_data = data
                return True, status_code, data["choices"][0]["message"]["content"]
            except:
                print(
                    f"******* Error occured while deplotting: {status_code} : {response_data}"
                )
                return False, status_code, response_data

        coroutines = []
        for index in range(0, len(charts)):
            print(f"Deplotting chart {index+1} of {len(charts)}")
            coroutines.append(inner(charts[index]))

        response = await asyncio.gather(*coroutines)
        error = None
        deplotted_charts_data = []
        for each in response:
            if each[0]:
                deplotted_charts_data.append(each[2])
            else:
                deplotted_charts_data.append("")
                error = each

        if error:
            send_email(
                f"Error while deplotting(nvidia-deplot): {error[1]} : {error[2]}"
            )

        return deplotted_charts_data
