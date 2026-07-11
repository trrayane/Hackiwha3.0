from httpx import AsyncClient

from tests.conftest import complete_creative_direction, complete_wizard, create_draft


async def test_create_draft_starts_at_step1_and_draft_status(client: AsyncClient, auth_headers: dict):
    draft = await create_draft(client, auth_headers)
    assert draft["current_step"] == 1
    assert draft["status"] == "draft"


async def test_step2_and_step3_bump_current_step(client: AsyncClient, auth_headers: dict):
    draft = await create_draft(client, auth_headers)

    audience_response = await client.patch(
        f"/api/v1/jingles/{draft['id']}/audience",
        json={"target_age_range": "25-40", "mood_context": "focus time"},
        headers=auth_headers,
    )
    assert audience_response.json()["current_step"] == 2
    assert audience_response.json()["status"] == "draft"

    platform_response = await client.patch(
        f"/api/v1/jingles/{draft['id']}/platform",
        json={"platform": "instagram_reels"},
        headers=auth_headers,
    )
    assert platform_response.json()["current_step"] == 3
    assert platform_response.json()["status"] == "draft"


async def test_creative_direction_bumps_step_but_stays_draft_until_generated(
    client: AsyncClient, auth_headers: dict
):
    draft = await create_draft(client, auth_headers)
    await complete_wizard(client, auth_headers, draft["id"])

    response = await client.patch(
        f"/api/v1/jingles/{draft['id']}/creative-direction",
        json={"sound_description": "warm acoustic intro", "voice_enabled": False},
        headers=auth_headers,
    )
    assert response.status_code == 200
    body = response.json()
    assert body["current_step"] == 4
    assert body["status"] == "draft"
    assert body["sound_description"] == "warm acoustic intro"
    assert body["voice_enabled"] is False


async def test_generate_moves_status_to_in_review(client: AsyncClient, auth_headers: dict):
    draft = await create_draft(client, auth_headers)
    await complete_wizard(client, auth_headers, draft["id"])
    await complete_creative_direction(client, auth_headers, draft["id"])

    response = await client.post(f"/api/v1/jingles/{draft['id']}/generate", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["status"] == "completed"

    jingle_response = await client.get(f"/api/v1/jingles/{draft['id']}", headers=auth_headers)
    assert jingle_response.json()["status"] == "in_review"


async def test_approve_requires_in_review_status(client: AsyncClient, auth_headers: dict):
    draft = await create_draft(client, auth_headers)

    response = await client.post(f"/api/v1/jingles/{draft['id']}/approve", headers=auth_headers)
    assert response.status_code == 409


async def test_approve_moves_status_to_approved(client: AsyncClient, auth_headers: dict):
    draft = await create_draft(client, auth_headers)
    await complete_wizard(client, auth_headers, draft["id"])
    await complete_creative_direction(client, auth_headers, draft["id"])
    await client.post(f"/api/v1/jingles/{draft['id']}/generate", headers=auth_headers)

    response = await client.post(f"/api/v1/jingles/{draft['id']}/approve", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["status"] == "approved"


async def test_current_step_does_not_regress_when_editing_earlier_step(
    client: AsyncClient, auth_headers: dict
):
    draft = await create_draft(client, auth_headers)
    await complete_wizard(client, auth_headers, draft["id"])
    await complete_creative_direction(client, auth_headers, draft["id"])

    # Re-editing step 2 after finishing the wizard should not roll current_step back.
    response = await client.patch(
        f"/api/v1/jingles/{draft['id']}/audience",
        json={"target_age_range": "41+", "mood_context": "wind down"},
        headers=auth_headers,
    )
    assert response.json()["current_step"] == 4


async def test_resume_draft_via_get_returns_saved_progress(client: AsyncClient, auth_headers: dict):
    draft = await create_draft(client, auth_headers, brand_name="ResumeMe")
    await client.patch(
        f"/api/v1/jingles/{draft['id']}/audience",
        json={"target_age_range": "25-40", "mood_context": "focus time"},
        headers=auth_headers,
    )

    response = await client.get(f"/api/v1/jingles/{draft['id']}", headers=auth_headers)
    assert response.status_code == 200
    body = response.json()
    assert body["brand_name"] == "ResumeMe"
    assert body["current_step"] == 2
    assert body["target_age_range"] == "25-40"
    assert body["mood_context"] == "focus time"


async def test_list_filters_by_status(client: AsyncClient, auth_headers: dict):
    draft_only = await create_draft(client, auth_headers, brand_name="StillDraft")
    in_review_one = await create_draft(client, auth_headers, brand_name="AllDone")
    await complete_wizard(client, auth_headers, in_review_one["id"])
    await complete_creative_direction(client, auth_headers, in_review_one["id"])
    await client.post(f"/api/v1/jingles/{in_review_one['id']}/generate", headers=auth_headers)

    draft_response = await client.get("/api/v1/jingles?status=draft", headers=auth_headers)
    draft_names = [item["brand_name"] for item in draft_response.json()["items"]]
    assert "StillDraft" in draft_names
    assert "AllDone" not in draft_names

    in_review_response = await client.get("/api/v1/jingles?status=in_review", headers=auth_headers)
    in_review_names = [item["brand_name"] for item in in_review_response.json()["items"]]
    assert "AllDone" in in_review_names
    assert "StillDraft" not in in_review_names

    assert draft_only["status"] == "draft"


async def test_jingle_quota_enforced(client: AsyncClient, auth_headers: dict):
    for i in range(5):
        response = await client.post(
            "/api/v1/jingles",
            json={"brand_name": f"QuotaBrand{i}", "brand_tone": "calm"},
            headers=auth_headers,
        )
        assert response.status_code == 201

    response = await client.post(
        "/api/v1/jingles",
        json={"brand_name": "OneTooMany", "brand_tone": "calm"},
        headers=auth_headers,
    )
    assert response.status_code == 409


async def test_generic_patch_can_edit_creative_direction_fields(client: AsyncClient, auth_headers: dict):
    draft = await create_draft(client, auth_headers)
    response = await client.patch(
        f"/api/v1/jingles/{draft['id']}",
        json={"sound_description": "edited via generic patch"},
        headers=auth_headers,
    )
    assert response.status_code == 200
    assert response.json()["sound_description"] == "edited via generic patch"
