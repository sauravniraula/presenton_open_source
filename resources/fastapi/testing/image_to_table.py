from graph_processor.deplot_charts_and_tables import deplot_image_to_table


async def run_test_async():
    table_markdown = await deplot_image_to_table("/home/viristo/Downloads/chart.png")
    print(table_markdown)
