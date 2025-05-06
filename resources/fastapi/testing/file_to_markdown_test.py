from document_processor.file_to_markdown import generate_markdown_from_file


def run_test():
    print(generate_markdown_from_file("/home/viristo/Documents/the_sun.pdf"))
