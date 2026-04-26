from pydantic import BaseModel, Field

class NLPParseRequest(BaseModel):
    text: str = Field(..., description="Kullanıcının serbest metin olarak girdiği rota isteği", example="Öğleden sonra 3 saat vaktim var, Kadıköy'de tarihi bir yer görmek ve ardından kahve içmek istiyorum, toplam bütçem 500 TL")

class NLPParseResult(BaseModel):
    location: str | None = Field(None, description="Etkinliğin yapılacağı şehir veya semt adı (örn: Kadıköy)")
    max_duration_mins: int | None = Field(None, description="Maksimum ayrılan süre (dakika cinsinden, örn: 3 saat = 180)")
    max_budget: float | None = Field(None, description="Toplam maksimum bütçe (TL)")
    categories: list[str] = Field(default_factory=list, description="Kullanıcının ilgilendiği mekan kategorileri (örn: ['Tarihi', 'Cafe', 'Müze'])")

class NLPParseResponse(BaseModel):
    parsed_data: NLPParseResult
    raw_text: str
