"""empty message

Revision ID: 77a9571b16f0
Revises: 2b73cdd031c7
Create Date: 2026-04-26 12:26:22.045842+00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '77a9571b16f0'
down_revision: Union[str, None] = '2b73cdd031c7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
