"""전체 엔드포인트 수동 테스트 스크립트"""
import httpx

BASE = "http://localhost:8080"
EMAIL = "filetest@example.com"
PASSWORD = "test1234"

def run():
    with httpx.Client(base_url=BASE, timeout=30) as c:
        # 1. 로그인
        r = c.post("/auth/login", json={"email": EMAIL, "password": PASSWORD})
        assert r.status_code == 200, f"Login failed: {r.text}"
        token = r.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        print("✓ [1] 로그인")

        # 2. 게시글 작성
        r = c.post("/posts", json={"title": "test post", "content": "hello"}, headers=headers)
        assert r.status_code == 201, f"Post create failed: {r.text}"
        post_id = r.json()["id"]
        print(f"✓ [2] 게시글 작성: {post_id}")

        # 3. 파일 업로드
        r = c.post(
            f"/posts/{post_id}/files",
            headers=headers,
            files={"file": ("test.txt", b"hello file", "text/plain")},
        )
        assert r.status_code == 201, f"File upload failed: {r.text}"
        file_id = r.json()["id"]
        file_url = r.json()["file_url"]
        print(f"✓ [3] 파일 업로드: {file_url[:60]}...")

        # 4. 게시글 조회 (파일 포함)
        r = c.get(f"/posts/{post_id}")
        assert r.status_code == 200
        assert len(r.json()["files"]) == 1
        print("✓ [4] 게시글 조회 (파일 포함)")

        # 5. 파일 삭제
        r = c.delete(f"/posts/{post_id}/files/{file_id}", headers=headers)
        assert r.status_code == 204, f"File delete failed: {r.text}"
        print("✓ [5] 파일 삭제")

        # 6. 아바타 업로드
        png_1x1 = (
            b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01"
            b"\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\x0cIDATx\x9cc\xf8\x0f\x00"
            b"\x00\x01\x01\x00\x05\x18\xd8N\x00\x00\x00\x00IEND\xaeB`\x82"
        )
        r = c.post(
            "/users/me/avatar",
            headers=headers,
            files={"file": ("avatar.png", png_1x1, "image/png")},
        )
        assert r.status_code == 200, f"Avatar upload failed: {r.text}"
        print(f"✓ [6] 아바타 업로드: {r.json()['avatar_url'][:60]}...")

        # 7. 댓글 작성
        r = c.post(f"/posts/{post_id}/comments", json={"content": "test comment"}, headers=headers)
        assert r.status_code == 201, f"Comment failed: {r.text}"
        comment_id = r.json()["id"]
        print("✓ [7] 댓글 작성")

        # 8. 댓글 수정
        r = c.patch(f"/posts/{post_id}/comments/{comment_id}", json={"content": "updated"}, headers=headers)
        assert r.status_code == 200
        print("✓ [8] 댓글 수정")

        # 9. 댓글 삭제
        r = c.delete(f"/posts/{post_id}/comments/{comment_id}", headers=headers)
        assert r.status_code == 204
        print("✓ [9] 댓글 삭제")

        # 10. 게시글 삭제
        r = c.delete(f"/posts/{post_id}", headers=headers)
        assert r.status_code == 204
        print("✓ [10] 게시글 삭제")

        print("\n전체 테스트 완료!")

if __name__ == "__main__":
    run()
