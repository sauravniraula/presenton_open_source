from langchain_text_splitters import CharacterTextSplitter

with open("/home/suraj-jha/Downloads/WEF_Annual_Report_2023_2024.txt", "r") as file:
    document = file.read()

text_splitter = CharacterTextSplitter.from_tiktoken_encoder(
    encoding_name="cl100k_base",
    chunk_size=200000,
    chunk_overlap=0
)
chunks = text_splitter.split_text(document)
print(type(chunks[0]))