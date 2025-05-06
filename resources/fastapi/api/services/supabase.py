from typing import List, Optional
import os
import json
import datetime
from supabase import create_async_client


from api.models import UserPreferences
from api.routers.presentation.models import (
    PresentationGenerateRequest,
    PresentationModel,
)
from graph_processor.models import GraphModel, TableMarkdownModel, TableMarkdownSourceModel
from ppt_generator.models.slide_model import SlideModel


PRESENTATION_TABLE = "v7-presentations"
SLIDE_TABLE = "v7-slides"
GRAPH_TABLE = "v7-graphs"
TABLE_TABLE = "v7-graphs"
USER_PREFERENCES_TABLE = "user-preferences"
KEY_VALUE_TABLE = "key_value_temporary"
USER_TABLE = "users"


class SupabaseService:

    async def get_client(self):
        return await create_async_client(
            os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_KEY")
        )

    async def get_user(self, user_id: str):
        client = await self.get_client()
        response = await client.auth.admin.get_user_by_id(user_id)
        user = response.user
        return user

    async def create_presentation(self, presentation_data: dict) -> PresentationModel:
        client = await self.get_client()
        response = (
            await client.table(PRESENTATION_TABLE).insert(presentation_data).execute()
        )
        return PresentationModel(**response.data[0])

    async def upsert_presentation(self, presentation_data: dict) -> PresentationModel:
        client = await self.get_client()
        response = (
            await client.table(PRESENTATION_TABLE).upsert(presentation_data).execute()
        )
        return PresentationModel(**response.data[0])

    async def update_presentation(self, updates: dict) -> PresentationModel:
        client = await self.get_client()
        response = await (
            client.table(PRESENTATION_TABLE)
            .update(updates)
            .eq("id", updates["id"])
            .execute()
        )
        print(response)
        return PresentationModel(**response.data[0])

    async def create_slides(self, slides: List[dict]) -> List[SlideModel]:
        client = await self.get_client()
        response = await client.table(SLIDE_TABLE).insert(slides).execute()
        return [SlideModel.from_dict(each) for each in response.data]

    async def create_slide(self, slide_data: dict) -> SlideModel:
        slides = await self.create_slides([slide_data])
        return slides[0]

    async def upsert_slides(self, slides: List[dict]) -> List[SlideModel]:
        client = await self.get_client()
        response = await client.table(SLIDE_TABLE).upsert(slides).execute()
        return [SlideModel.from_dict(each) for each in response.data]

    async def upsert_slide(self, slide_data: dict) -> SlideModel:
        slides = await self.upsert_slides([slide_data])
        return slides[0]

    async def create_graphs(self, graphs_data: List[dict]) -> List[GraphModel]:
        client = await self.get_client()
        response = await client.table(GRAPH_TABLE).insert(graphs_data).execute()
        return [GraphModel.from_dict(each) for each in response.data]

    async def upsert_graphs(self, graphs: List[dict]) -> List[GraphModel]:
        client = await self.get_client()
        response = await client.table(GRAPH_TABLE).upsert(graphs).execute()
        return [GraphModel.from_dict(each) for each in response.data]

    async def upsert_graph(self, graph_data: dict) -> GraphModel:
        graphs = await self.upsert_graphs([graph_data])
        return graphs[0]

    async def create_tables(self, tables_data: List[dict]) -> List[TableMarkdownModel]:
        client = await self.get_client()
        response = await client.table(TABLE_TABLE).insert(tables_data).execute()
        return [TableMarkdownModel(**each) for each in response.data]

    async def upsert_tables(self, tables_data: List[dict]) -> List[TableMarkdownModel]:
        client = await self.get_client()
        response = await client.table(TABLE_TABLE).upsert(tables_data).execute()
        return [TableMarkdownModel(**each) for each in response.data]

    async def upsert_user_preferences(self, user_preferences: dict) -> UserPreferences:
        client = await self.get_client()
        response = (
            await client.table(USER_PREFERENCES_TABLE)
            .upsert(user_preferences)
            .execute()
        )
        return UserPreferences(**response.data[0])

    async def create_key_value(self, key: str, value: dict):
        client = await self.get_client()
        response = (
            await client.table(KEY_VALUE_TABLE)
            .insert({"key": key, "value": value})
            .execute()
        )
        return response.data[0]["value"]

    async def save_generate_presentation_data(
        self, session: str, data: PresentationGenerateRequest
    ) -> PresentationGenerateRequest:
        response = await self.create_key_value(session, data.model_dump(mode="json"))
        return PresentationGenerateRequest(**response)

    async def get_presentation(self, presentation_id: str) -> PresentationModel:
        client = await self.get_client()
        response = await (
            client.table(PRESENTATION_TABLE)
            .select("*")
            .eq("id", presentation_id)
            .execute()
        )
        print(response)
        return PresentationModel(**response.data[0])

    async def get_presentations_from_user_id(
        self, user_id: str
    ) -> List[PresentationModel]:
        client = await self.get_client()
        response = await (
            client.table(PRESENTATION_TABLE)
            .select("*")
            .eq("user_id", user_id)
            .not_.is_("theme", "null")
            .order("created_at", desc=True)
            .limit(100)
            .execute()
        )
        return [PresentationModel(**each) for each in response.data]

    async def get_slides(self, presentation_id: str) -> List[SlideModel]:
        client = await self.get_client()
        response = await (
            client.table(SLIDE_TABLE)
            .select("*")
            .eq("presentation", presentation_id)
            .order("index")
            .execute()
        )
        data = []
        for each in response.data:
            print(json.dumps(each, indent=2))
            data.append(SlideModel.from_dict(each))
        return data

    async def get_slide_at_index(
        self, presentation_id: str, index: int
    ) -> Optional[SlideModel]:
        client = await self.get_client()
        response = await (
            client.table(SLIDE_TABLE)
            .select("*")
            .eq("presentation", presentation_id)
            .eq("index", index)
            .order("index")
            .execute()
        )
        if not response.data:
            return None
        return SlideModel.from_dict(response.data[0])

    async def get_graphs(self, presentation_id: str) -> List[GraphModel]:
        client = await self.get_client()
        response = await (
            client.table(GRAPH_TABLE)
            .select("*")
            .eq("presentation", presentation_id)
            .execute()
        )
        return [GraphModel.from_dict(each) for each in response.data]

    async def get_graphs_from_source(self, source: str) -> List[GraphModel]:    
        client = await self.get_client()
        response = await (
            client.table(TABLE_TABLE)
            .select("*")
            .eq("source", source)
            .execute()
        )
        return [TableMarkdownSourceModel(**each) for each in response.data]

    async def get_key_value(self, key: str):
        client = await self.get_client()
        response = (
            await client.table(KEY_VALUE_TABLE).select("*").eq("key", key).execute()
        )
        if len(response.data):
            return response.data[0]["value"]
        else:
            return None

    async def get_presentation_generate_data(
        self, key: str
    ) -> Optional[PresentationGenerateRequest]:
        response = await self.get_key_value(key)
        if response:
            return PresentationGenerateRequest(**response)
        else:
            return None

    async def delete_presentation(self, presentation_id: str):
        client = await self.get_client()
        await client.table(PRESENTATION_TABLE).delete().eq(
            "id", presentation_id
        ).execute()

    async def delete_presentation_slides(self, presentation_id: str):
        client = await self.get_client()
        await client.table(SLIDE_TABLE).delete().eq(
            "presentation", presentation_id
        ).execute()

    async def delete_slide(self, slide_id: str):
        client = await self.get_client()
        await client.table(SLIDE_TABLE).delete().eq("id", slide_id).execute()

    async def upload_presentation_from_path(
        self, file_name: str, file_path: str, upsert: bool = False
    ):
        client = await self.get_client()
        file_options = {
            "content-type": "application/vnd.openxmlformats-officedocument.presentationml.presentation"
        }
        if upsert:
            file_options["upsert"] = "true"

        return await client.storage.from_("presentations").upload(
            path=file_name,
            file=file_path,
            file_options=file_options,
        )

    async def upload_image_from_bytes(
        self, file_name: str, file_content: bytes, upsert: bool = False
    ):
        client = await self.get_client()
        file_options = {"content-type": "image/jpeg"}
        if upsert:
            file_options["upsert"] = "true"

        return await client.storage.from_("images").upload(
            path=file_name,
            file=file_content,
            file_options=file_options,
        )

    async def upload_document_from_bytes(self, file_name: str, file_content: bytes):
        client = await self.get_client()

        return await client.storage.from_("documents").upload(
            path=file_name,
            file=file_content,
        )

    async def download_presentation(self, file_name: str) -> bytes:
        client = await self.get_client()
        return await client.storage.from_("presentations").download(file_name)

    async def create_signed_url(
        self, bucket_name: str, file_name: str, expires_in: int = 1800
    ) -> str:
        client = await self.get_client()
        response = await client.storage.from_(bucket_name).create_signed_url(
            file_name, expires_in
        )
        return response["signedURL"]

    async def get_public_url(self, bucket_name: str, file_name: str) -> str:
        client = await self.get_client()
        return f"{client.storage_url}/object/public/{bucket_name}/{file_name}"

    async def create_user(self, user_id: str, email: str, password: str = None, user_metadata: dict = None) -> dict:
        """
        Create a new user and initialize their data in related tables.
        
        Args:
            user_id: Unique identifier for the user
            email: User's email address
            password: Optional password (not needed for social login)
            user_metadata: Optional additional user metadata
        
        Returns:
            dict: Created user data
            
        Raises:
            ValueError: If user already exists
        """
        client = await self.get_client()
        
        # Check if user exists in customers table
        try:
            existing_user = await client.table('customers').select('*').eq('id', user_id).single().execute()
            return True
                
        except Exception as e:
            if "User already registered" in str(e):
                raise ValueError(f"User already exists")
            raise e

        # Initialize user data
        current_time = datetime.datetime.now(datetime.timezone.utc).isoformat()
        period_end = (datetime.datetime.now(datetime.timezone.utc) + 
                     datetime.timedelta(days=30)).isoformat()

        try:
            # Create all required records in a transaction
            async with client.postgrest.tx() as tx:
                # 1. Create customer record
                await tx.table('customers').insert({
                    'id': user_id,
                    'email': email,
                    'created_at': current_time,
                    'updated_at': current_time
                }).execute()

                # 2. Create free subscription
                await tx.table('subscriptions').insert({
                    'id': f'free_{user_id}',
                    'user_id': user_id,
                    'tier': 'free',
                    'status': 'trialing',
                    'cancel_at_period_end': False,
                    'current_period_start': current_time,
                    'current_period_end': period_end,
                    'created_at': current_time,
                    'updated_at': current_time
                }).execute()

                # 3. Initialize usage stats
                await tx.table('usage_stats').insert({
                    'user_id': user_id,
                    'exports_count': 0,
                    'ai_presentations_count': 0,
                    'avatar_video_duration': 0,
                    'period_start': current_time,
                    'period_end': period_end,
                    'created_at': current_time,
                    'updated_at': current_time
                }).execute()

                # 4. Create auth user if password is provided (email/password flow)
                if password:
                    create_user_data = {
                        'id': user_id,
                        'email': email,
                        'password': password,
                        'email_confirm': True
                    }
                    if user_metadata:
                        create_user_data['user_metadata'] = user_metadata
                    
                    auth_user = await client.auth.admin.create_user(create_user_data)
                    return auth_user.user

                return {'id': user_id, 'email': email}

        except Exception as e:
            # Rollback happens automatically on exception
            print(f"Error creating user: {e}")
            raise e
