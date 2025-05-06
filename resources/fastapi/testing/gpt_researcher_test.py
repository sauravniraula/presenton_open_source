from research_report.generator import get_report
from gpt_researcher.utils.enum import ReportType


def run_test_async():
    return get_report(
        "What are the executive orders that Trump signed today?",
        ReportType.ResearchReport.value,
    )
