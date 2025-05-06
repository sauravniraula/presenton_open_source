from api.routers.presentation.mixins.process_document import ProcessDocumentMixin
from ppt_config_generator.document_summary_generator import generate_document_summary
from api.services.instances import temp_file_service

decomposed_document_keys = [
    "1aec14dd-4dc1-4e59-991b-650118996e09.txt"
    # "a15bb1cc-7334-4f6d-8c3d-349434f9dce8.txt"
]


async def test_document_summary():
    temp_dir = temp_file_service.create_temp_dir()
    process_documents = ProcessDocumentMixin()
    documents_loader, _ = (
        await process_documents.process_documents(
            decomposed_document_keys,
            split_documents=False,
            temp_dir=temp_dir,
        )
        if decomposed_document_keys
        else (None, None)
    )

    documents = []
    splitted_documents = []
    if documents_loader:
        documents.extend(documents_loader.documents)
        splitted_documents.extend(documents_loader.splitted_documents)

    summary = await generate_document_summary(documents)
    print(summary)
