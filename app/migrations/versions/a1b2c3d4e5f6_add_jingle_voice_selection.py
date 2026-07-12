"""add jingle voice gender and voice name selection

Revision ID: a1b2c3d4e5f6
Revises: eed1f4ceb3d1
Create Date: 2026-07-11 07:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, None] = 'eed1f4ceb3d1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('jingles', sa.Column('voice_gender', sa.String(length=20), nullable=True))
    op.add_column('jingles', sa.Column('voice_name', sa.String(length=30), nullable=True))


def downgrade() -> None:
    op.drop_column('jingles', 'voice_name')
    op.drop_column('jingles', 'voice_gender')
