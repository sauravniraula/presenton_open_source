import uuid
from api.routers.presentation.models import PresentationModel
from api.services.instances import supabase_service
from ppt_generator.models.other_models import PresentationTheme


user_id = "bbbf2d7a-829a-4788-a048-5d9f782b8a97"


async def run_test_async():
    presentation = PresentationModel(
        id=str(uuid.uuid4()),
        user_id=user_id,
        prompt="a prompt",
        n_slides=8,
        theme=PresentationTheme.light,
        title="Hello",
        titles=[],
    )

    presentation = await supabase_service.upsert_presentation(
        presentation.to_create_dict()
    )

    print(presentation)

    presentation = await supabase_service.upsert_presentation(
        {"id": presentation.id, "file": "new_file.txt", "user_id": user_id}
    )
    print(presentation)
