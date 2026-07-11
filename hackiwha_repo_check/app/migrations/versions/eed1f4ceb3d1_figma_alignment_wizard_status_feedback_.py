"""figma_alignment_wizard_status_feedback_quota

Revision ID: eed1f4ceb3d1
Revises: 2e5d05e15908
Create Date: 2026-07-10 19:40:34.246111

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = 'eed1f4ceb3d1'
down_revision: Union[str, None] = '2e5d05e15908'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

target_age_range_enum = postgresql.ENUM('TEENS', 'ADULTS', 'SENIORS', name='target_age_range')
platform_enum = postgresql.ENUM(
    'TIKTOK', 'INSTAGRAM_REELS', 'SPOTIFY_ADS', 'YOUTUBE', 'CLASSIC_RADIO', 'IN_STORE', name='platform'
)
jingle_status_new_enum = postgresql.ENUM(
    'DRAFT', 'IN_REVIEW', 'APPROVED', name='jingle_status_new'
)


def upgrade() -> None:
    # --- feedback: collapse 4 dimensions into a single 1-5 rating ---
    op.add_column('feedback', sa.Column('rating', sa.Integer(), nullable=False, server_default='3'))
    op.alter_column('feedback', 'rating', server_default=None)
    op.drop_column('feedback', 'memorability')
    op.drop_column('feedback', 'energy')
    op.drop_column('feedback', 'tone')
    op.drop_column('feedback', 'brand_fit')

    # --- generation_requests: progress tracking for the UI's live progress bar ---
    op.add_column(
        'generation_requests',
        sa.Column('progress_percent', sa.Integer(), nullable=False, server_default='0'),
    )
    op.alter_column('generation_requests', 'progress_percent', server_default=None)
    op.add_column('generation_requests', sa.Column('stage_message', sa.String(length=200), nullable=True))

    # --- users: simple plan quota (matches "3 of 5 jingles" usage widget in Figma) ---
    op.add_column('users', sa.Column('jingle_quota', sa.Integer(), nullable=False, server_default='5'))
    op.alter_column('users', 'jingle_quota', server_default=None)

    # --- jingles: brand_description (new step 1 field) ---
    op.add_column('jingles', sa.Column('brand_description', sa.String(length=500), nullable=True))

    # --- jingles: step 2 changes from free-text audience fields to age-range + mood ---
    target_age_range_enum.create(op.get_bind(), checkfirst=True)
    op.add_column(
        'jingles',
        sa.Column(
            'target_age_range',
            postgresql.ENUM('TEENS', 'ADULTS', 'SENIORS', name='target_age_range', create_type=False),
            nullable=True,
        ),
    )
    op.add_column('jingles', sa.Column('mood_context', sa.String(length=150), nullable=True))
    op.drop_column('jingles', 'target_audience')
    op.drop_column('jingles', 'region')
    op.drop_column('jingles', 'language')
    op.drop_column('jingles', 'industry')

    # --- jingles: step 3 platform becomes a fixed enum; old free-text values are
    # best-effort mapped, anything unrecognized is cleared to NULL rather than
    # guessed, since silently mis-tagging a user's platform would be worse. ---
    platform_enum.create(op.get_bind(), checkfirst=True)
    op.add_column(
        'jingles',
        sa.Column(
            'platform_new',
            postgresql.ENUM(
                'TIKTOK', 'INSTAGRAM_REELS', 'SPOTIFY_ADS', 'YOUTUBE', 'CLASSIC_RADIO', 'IN_STORE',
                name='platform', create_type=False,
            ),
            nullable=True,
        ),
    )
    op.execute(
        """
        UPDATE jingles SET platform_new = CASE lower(platform)
            WHEN 'tiktok' THEN 'TIKTOK'
            WHEN 'instagram' THEN 'INSTAGRAM_REELS'
            WHEN 'instagram_reels' THEN 'INSTAGRAM_REELS'
            WHEN 'instagram reels' THEN 'INSTAGRAM_REELS'
            WHEN 'spotify' THEN 'SPOTIFY_ADS'
            WHEN 'spotify_ads' THEN 'SPOTIFY_ADS'
            WHEN 'youtube' THEN 'YOUTUBE'
            WHEN 'radio' THEN 'CLASSIC_RADIO'
            WHEN 'classic radio' THEN 'CLASSIC_RADIO'
            WHEN 'classic_radio' THEN 'CLASSIC_RADIO'
            WHEN 'in store' THEN 'IN_STORE'
            WHEN 'in-store' THEN 'IN_STORE'
            WHEN 'in_store' THEN 'IN_STORE'
            ELSE NULL
        END::platform
        """
    )
    op.drop_column('jingles', 'platform')
    op.alter_column('jingles', 'platform_new', new_column_name='platform')

    # jingles: drop step-3 fields not present in the Figma design (fixed per-platform
    # duration hint only; no longer user-selected duration/music_style/voice_type)
    op.drop_column('jingles', 'duration_seconds')
    op.drop_column('jingles', 'music_style')
    op.drop_column('jingles', 'voice_type')

    # --- jingles: status enum gains in_review/approved, drops ready. Postgres can't
    # remove enum labels in place, so build the new type, backfill, then swap. ---
    jingle_status_new_enum.create(op.get_bind(), checkfirst=True)
    op.add_column(
        'jingles',
        sa.Column(
            'status_new',
            postgresql.ENUM('DRAFT', 'IN_REVIEW', 'APPROVED', name='jingle_status_new', create_type=False),
            nullable=True,
        ),
    )
    op.execute(
        """
        UPDATE jingles SET status_new = CASE status::text
            WHEN 'READY' THEN 'IN_REVIEW'
            ELSE 'DRAFT'
        END::jingle_status_new
        """
    )
    op.drop_index(op.f('ix_jingles_status'), table_name='jingles')
    op.drop_column('jingles', 'status')
    op.execute("DROP TYPE jingle_status")
    op.execute("ALTER TYPE jingle_status_new RENAME TO jingle_status")
    op.alter_column('jingles', 'status_new', new_column_name='status', nullable=False)
    op.create_index(op.f('ix_jingles_status'), 'jingles', ['status'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_jingles_status'), table_name='jingles')
    op.alter_column('jingles', 'status', new_column_name='status_old')
    op.execute("ALTER TYPE jingle_status RENAME TO jingle_status_new")
    op.execute("CREATE TYPE jingle_status AS ENUM ('DRAFT', 'READY')")
    op.add_column(
        'jingles',
        sa.Column(
            'status',
            postgresql.ENUM('DRAFT', 'READY', name='jingle_status', create_type=False),
            nullable=True,
        ),
    )
    op.execute(
        """
        UPDATE jingles SET status = CASE status_old::text
            WHEN 'IN_REVIEW' THEN 'READY'
            WHEN 'APPROVED' THEN 'READY'
            ELSE 'DRAFT'
        END::jingle_status
        """
    )
    op.alter_column('jingles', 'status', nullable=False)
    op.drop_column('jingles', 'status_old')
    op.execute("DROP TYPE jingle_status_new")
    op.create_index(op.f('ix_jingles_status'), 'jingles', ['status'], unique=False)

    op.add_column('jingles', sa.Column('voice_type', sa.VARCHAR(length=50), nullable=True))
    op.add_column('jingles', sa.Column('music_style', sa.VARCHAR(length=50), nullable=True))
    op.add_column('jingles', sa.Column('duration_seconds', sa.INTEGER(), nullable=True))

    op.add_column('jingles', sa.Column('platform_old', sa.VARCHAR(length=50), nullable=True))
    op.execute("UPDATE jingles SET platform_old = lower(platform::text)")
    op.drop_column('jingles', 'platform')
    op.alter_column('jingles', 'platform_old', new_column_name='platform')
    platform_enum.drop(op.get_bind(), checkfirst=True)

    op.add_column('jingles', sa.Column('industry', sa.VARCHAR(length=100), nullable=True))
    op.add_column('jingles', sa.Column('language', sa.VARCHAR(length=50), nullable=True))
    op.add_column('jingles', sa.Column('region', sa.VARCHAR(length=100), nullable=True))
    op.add_column('jingles', sa.Column('target_audience', sa.VARCHAR(length=150), nullable=True))
    op.drop_column('jingles', 'mood_context')
    op.drop_column('jingles', 'target_age_range')
    target_age_range_enum.drop(op.get_bind(), checkfirst=True)

    op.drop_column('jingles', 'brand_description')

    op.drop_column('users', 'jingle_quota')

    op.drop_column('generation_requests', 'stage_message')
    op.drop_column('generation_requests', 'progress_percent')

    op.add_column('feedback', sa.Column('brand_fit', sa.INTEGER(), nullable=False, server_default='3'))
    op.add_column('feedback', sa.Column('tone', sa.INTEGER(), nullable=False, server_default='3'))
    op.add_column('feedback', sa.Column('energy', sa.INTEGER(), nullable=False, server_default='3'))
    op.add_column('feedback', sa.Column('memorability', sa.INTEGER(), nullable=False, server_default='3'))
    op.alter_column('feedback', 'brand_fit', server_default=None)
    op.alter_column('feedback', 'tone', server_default=None)
    op.alter_column('feedback', 'energy', server_default=None)
    op.alter_column('feedback', 'memorability', server_default=None)
    op.drop_column('feedback', 'rating')
