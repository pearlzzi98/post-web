import uuid

from supabase import create_client

from app.config import settings

_client = None


def get_storage_client():
    global _client
    if _client is None:
        _client = create_client(settings.supabase_url, settings.supabase_service_role_key)
    return _client


def upload_file(file_bytes: bytes, file_name: str, content_type: str) -> str:
    """파일을 Supabase Storage에 업로드하고 공개 URL을 반환합니다."""
    client = get_storage_client()
    path = f"{uuid.uuid4()}/{file_name}"
    client.storage.from_(settings.supabase_bucket).upload(
        path, file_bytes, {"content-type": content_type}
    )
    result = client.storage.from_(settings.supabase_bucket).get_public_url(path)
    return result


def delete_file(file_url: str) -> None:
    """Supabase Storage에서 파일을 삭제합니다."""
    client = get_storage_client()
    # URL에서 bucket 이후의 경로 추출
    bucket_prefix = f"/storage/v1/object/public/{settings.supabase_bucket}/"
    if bucket_prefix in file_url:
        path = file_url.split(bucket_prefix)[-1]
        client.storage.from_(settings.supabase_bucket).remove([path])
