import io

import httpx

base = "http://127.0.0.1:8000/api/v1"
results = []


def check(name, cond, detail=""):
    results.append((name, "PASS" if cond else "FAIL", detail))
    print(f"[{'PASS' if cond else 'FAIL'}] {name} {detail}")


with httpx.Client(timeout=20) as c:
    email = "e2etest.throwaway@example.com"
    pwd = "StrongP1!"

    r = c.post(f"{base}/auth/register", json={"name": "E2E Test", "email": email, "password": pwd, "confirm_password": pwd})
    check("register", r.status_code == 201, r.status_code)

    r = c.post(f"{base}/auth/register", json={"name": "E2E Test", "email": email, "password": pwd, "confirm_password": pwd})
    check("register duplicate -> 409", r.status_code == 409, r.status_code)

    r = c.post(f"{base}/auth/login", json={"email": email, "password": "WrongPass1!"})
    check("login wrong password -> 401", r.status_code == 401, r.status_code)

    r = c.post(f"{base}/auth/login", json={"email": email, "password": pwd})
    check("login correct", r.status_code == 200, r.status_code)
    tokens = r.json()
    access, refresh = tokens["access_token"], tokens["refresh_token"]
    headers = {"Authorization": f"Bearer {access}"}

    r = c.get(f"{base}/auth/me", headers=headers)
    check("me", r.status_code == 200 and r.json()["email"] == email, r.status_code)

    r = c.get(f"{base}/auth/me")
    check("me without token -> 401", r.status_code == 401, r.status_code)

    r = c.post(f"{base}/auth/refresh", json={"refresh_token": refresh})
    check("refresh", r.status_code == 200, r.status_code)
    new_tokens = r.json()
    new_access, new_refresh = new_tokens["access_token"], new_tokens["refresh_token"]

    r = c.post(f"{base}/auth/refresh", json={"refresh_token": refresh})
    check("reused old refresh token rejected", r.status_code == 401, r.status_code)

    headers = {"Authorization": f"Bearer {new_access}"}

    r = c.post(f"{base}/auth/forgot-password", json={"email": email})
    check("forgot-password", r.status_code == 200, r.status_code)

    r = c.post(f"{base}/auth/reset-password", json={"token": "bogus-token", "new_password": "NewStrongP1!", "confirm_password": "NewStrongP1!"})
    check("reset-password bad token -> 400/404", r.status_code in (400, 404), r.status_code)

    r = c.post(f"{base}/auth/logout", json={"refresh_token": new_refresh}, headers=headers)
    check("logout", r.status_code == 200, r.status_code)

    r = c.post(f"{base}/auth/login", json={"email": email, "password": pwd})
    tokens = r.json()
    headers = {"Authorization": f"Bearer {tokens['access_token']}"}

    r = c.post(f"{base}/jingles", json={"brand_name": "E2E Brand", "brand_tone": "epic"}, headers=headers)
    check("create draft", r.status_code == 201, r.status_code)
    jid = r.json()["id"]
    check("draft starts step1/draft", r.json()["current_step"] == 1 and r.json()["status"] == "draft")

    r = c.get(f"{base}/jingles", headers=headers)
    check("list jingles", r.status_code == 200 and r.json()["total"] >= 1, r.status_code)

    r = c.get(f"{base}/jingles/{jid}", headers=headers)
    check("get jingle", r.status_code == 200, r.status_code)

    r = c.patch(f"{base}/jingles/{jid}/audience", json={"target_audience": "gamers", "region": "EU", "language": "en", "industry": "tech"}, headers=headers)
    check("patch audience", r.status_code == 200 and r.json()["current_step"] == 2, r.status_code)

    r = c.patch(f"{base}/jingles/{jid}/platform", json={"platform": "twitch", "duration_seconds": 15, "music_style": "electronic", "voice_type": "none"}, headers=headers)
    check("patch platform", r.status_code == 200 and r.json()["current_step"] == 3, r.status_code)

    r = c.patch(f"{base}/jingles/{jid}/creative-direction", json={"sound_description": "epic synth drop", "voice_enabled": False}, headers=headers)
    check("patch creative-direction -> ready", r.status_code == 200 and r.json()["status"] == "ready", r.status_code)

    files = {"file": ("e2e.mp3", io.BytesIO(b"E2E_FAKE_AUDIO" * 100), "audio/mpeg")}
    r = c.post(f"{base}/jingles/{jid}/reference-audio", files=files, headers=headers)
    check("upload reference audio", r.status_code == 201, r.status_code)

    r = c.post(f"{base}/jingles/{jid}/reference-audio", files=files, headers=headers)
    check("upload twice -> 409 conflict", r.status_code == 409, r.status_code)

    r = c.get(f"{base}/jingles/{jid}/reference-audio", headers=headers)
    check("get reference audio", r.status_code == 200, r.status_code)

    files2 = {"file": ("e2e_v2.wav", io.BytesIO(b"E2E_FAKE_AUDIO_V2" * 100), "audio/wav")}
    r = c.put(f"{base}/jingles/{jid}/reference-audio", files=files2, headers=headers)
    check("replace reference audio", r.status_code == 200 and r.json()["original_filename"] == "e2e_v2.wav", r.status_code)

    r = c.delete(f"{base}/jingles/{jid}/reference-audio", headers=headers)
    check("delete reference audio", r.status_code == 204, r.status_code)

    r = c.delete(f"{base}/jingles/{jid}/reference-audio", headers=headers)
    check("delete reference audio again -> 404", r.status_code == 404, r.status_code)

    r = c.get(f"{base}/jingles/{jid}/reference-audio", headers=headers)
    check("get reference audio after delete -> 404", r.status_code == 404, r.status_code)

    r = c.patch(f"{base}/jingles/{jid}", json={"brand_name": "E2E Brand Renamed"}, headers=headers)
    check("generic patch jingle", r.status_code == 200 and r.json()["brand_name"] == "E2E Brand Renamed", r.status_code)

    r = c.post(f"{base}/jingles/{jid}/duplicate", headers=headers)
    check("duplicate jingle", r.status_code == 201, r.status_code)
    dup_id = r.json()["id"]

    r = c.post(f"{base}/jingles/{jid}/favorite", headers=headers)
    check("toggle favorite on", r.status_code == 200 and r.json()["is_favorite"] is True, r.status_code)

    r = c.post(f"{base}/jingles/{jid}/favorite", headers=headers)
    check("toggle favorite off", r.status_code == 200 and r.json()["is_favorite"] is False, r.status_code)

    r = c.post(f"{base}/jingles/{jid}/archive", headers=headers)
    check("toggle archive on", r.status_code == 200 and r.json()["is_archived"] is True, r.status_code)

    r = c.post(f"{base}/jingles/{jid}/generate", headers=headers)
    check("generate (no AI provider -> failed status, 200)", r.status_code == 200 and r.json()["status"] == "failed", r.status_code)

    r = c.get(f"{base}/jingles/{jid}/generations", headers=headers)
    check("list generations for jingle", r.status_code == 200 and len(r.json()) >= 1, r.status_code)

    r = c.get(f"{base}/history/generations", headers=headers)
    check("history generations", r.status_code == 200, r.status_code)

    r = c.get(f"{base}/history/recent-activity", headers=headers)
    check("history recent-activity", r.status_code == 200, r.status_code)

    r = c.get(f"{base}/history/favorites", headers=headers)
    check("history favorites", r.status_code == 200, r.status_code)

    r = c.get(f"{base}/history/archived", headers=headers)
    check("history archived (should include our archived jingle)", r.status_code == 200 and any(i["id"] == jid for i in r.json()), r.status_code)

    r = c.get(f"{base}/dashboard/summary", headers=headers)
    check("dashboard summary", r.status_code == 200, r.status_code)

    r = c.get(f"{base}/dashboard/summary")
    check("dashboard summary no auth -> 401", r.status_code == 401, r.status_code)

    r = c.get(f"{base}/jingles/00000000-0000-0000-0000-000000000000", headers=headers)
    check("get unknown jingle -> 404", r.status_code == 404, r.status_code)

    r = c.delete(f"{base}/jingles/{jid}", headers=headers)
    check("delete jingle", r.status_code == 204, r.status_code)

    r = c.get(f"{base}/jingles/{jid}", headers=headers)
    check("get deleted jingle -> 404", r.status_code == 404, r.status_code)

    r = c.delete(f"{base}/jingles/{dup_id}", headers=headers)
    check("cleanup: delete duplicate jingle", r.status_code == 204, r.status_code)

    r = c.post(f"{base}/auth/login", json={"email": "alice.seed@example.com", "password": pwd})
    alice_headers = {"Authorization": f"Bearer {r.json()['access_token']}"}
    r = c.get(f"{base}/jingles/daad2f98-d49f-42bb-8bb6-2ee667d4c0af", headers=alice_headers)
    check("alice can access own jingle", r.status_code == 200, r.status_code)

    r = c.post(f"{base}/auth/login", json={"email": "bob.seed@example.com", "password": pwd})
    bob_headers = {"Authorization": f"Bearer {r.json()['access_token']}"}
    r = c.get(f"{base}/jingles/daad2f98-d49f-42bb-8bb6-2ee667d4c0af", headers=bob_headers)
    check("bob cannot access alice's jingle -> 404", r.status_code == 404, r.status_code)

print("\n\n=== SUMMARY ===")
passed = sum(1 for _, s, _ in results if s == "PASS")
failed = [n for n, s, _ in results if s == "FAIL"]
print(f"{passed}/{len(results)} passed")
if failed:
    print("FAILED:", failed)
