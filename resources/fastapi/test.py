# import asyncio
# from dotenv import load_dotenv

# load_dotenv()


# from testing import file_to_markdown_test, image_to_table, document_summary_test


# asyncio.run(document_summary_test.test_document_summary())



import json

data = json.load(open("/home/suraj-jha/Downloads/books_info (3).json", "r"))
print(data[0])


print(len(data))

compiled_data = {i+ 1: [] for i in range(12)}
compiled_data[None] = []

for each in data:
    grade = each["info"]["grade"]
    del each["info"]["offset"]
    for chapter in each["info"]["chapters"]:
        del chapter["start_page"]
        del chapter["end_page"]
    compiled_data[grade].append(each["info"])

with open("books_chapers_overview.json", "w") as f:
    json.dump(compiled_data, f)