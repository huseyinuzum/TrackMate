from fastapi import APIRouter, Depends
from app.schemas.nlp import NLPParseRequest, NLPParseResponse
from app.services.nlp_service import parse_user_intent
from app.models.user import User
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/api/v1/nlp", tags=["NLP"])

@router.post("/parse", response_model=NLPParseResponse)
async def parse_text(request: NLPParseRequest, current_user: User = Depends(get_current_user)):
    """
    Kullanıcının serbest metnini (rota isteğini) yapay zeka ile analiz edip,
    zaman, bütçe, konum ve kategoriler olarak yapılandırılmış JSON döner.
    Giriş yapan kullanıcılar (Auth) erişebilir.
    """
    parsed_data = await parse_user_intent(request.text)
    return NLPParseResponse(parsed_data=parsed_data, raw_text=request.text)
