import json
from openai import AsyncOpenAI
from fastapi import HTTPException
from app.config import get_settings
from app.schemas.nlp import NLPParseResult

settings = get_settings()

# Eğer API key varsa client'ı oluştur
client = AsyncOpenAI(api_key=settings.openai_api_key) if settings.openai_api_key else None

async def parse_user_intent(text: str) -> NLPParseResult:
    if not client:
        raise HTTPException(status_code=500, detail="OpenAI API anahtarı yapılandırılmamış.")

    prompt = f"""
    Sen akıllı bir rota planlama asistanısın. Kullanıcının girdiği serbest metni analiz edip, JSON formatında yapılandırılmış veriye dönüştürmelisin.
    
    Kullanıcı Metni: "{text}"
    
    Çıkarman gereken bilgiler (JSON formatında tam olarak bu anahtarları kullan):
    - "location": Şehir veya semt adı (yoksa null)
    - "max_duration_mins": Dakika cinsinden toplam süre (yoksa null, örn 3 saat = 180)
    - "max_budget": Sayısal olarak toplam bütçe TL cinsinden (yoksa null)
    - "categories": Mekan kategorileri (liste halinde, Türkçe anahtar kelimeler)
    """

    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            response_format={ "type": "json_object" },
            messages=[
                {"role": "system", "content": "You are a helpful assistant designed to output JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1
        )
        
        result_json = json.loads(response.choices[0].message.content)
        return NLPParseResult(**result_json)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"NLP analizi sırasında hata oluştu: {str(e)}")
