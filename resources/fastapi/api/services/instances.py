from api.services.s3 import S3Service
from api.services.supabase import SupabaseService
from api.services.temp_file import TempFileService


temp_file_service = TempFileService()
s3_service = S3Service()
supabase_service = SupabaseService()
