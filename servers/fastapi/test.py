import asyncio
from dotenv import load_dotenv

from tests.test_summary_generator import test_generate_document_summary

load_dotenv()


async def run_test():
    await test_generate_document_summary()


asyncio.run(run_test())
