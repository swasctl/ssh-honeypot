from fastapi import APIRouter
from db.queries import get_stats

router = APIRouter(prefix="/stats", tags=["stats"])

@router.get("/")
def stats():
    return get_stats()