import json
import google.generativeai as genai
from fastapi import HTTPException
from app.config import get_settings
from app.schemas.nlp import NLPParseResult

settings = get_settings()

if settings.gemini_api_key:
    genai.configure(api_key=settings.gemini_api_key)

async def parse_user_intent(text: str) -> NLPParseResult:
    if not settings.gemini_api_key:
        raise HTTPException(status_code=500, detail="Gemini API anahtarı yapılandırılmamış.")

    prompt = f"""
    Sen akıllı bir rota planlama asistanısın. Kullanıcının girdiği serbest metni analiz edip, SADECE JSON formatında yapılandırılmış veriye dönüştürmelisin.
    JSON formatı dışında hiçbir kelime, açıklama veya markdown bloğu kullanma.
    
    Kullanıcı Metni: "{text}"
    
    Çıkarman gereken bilgiler (JSON formatında tam olarak bu anahtarları kullan):
    - "location": Şehir veya semt adı (yoksa null)
    - "max_duration_mins": Dakika cinsinden toplam süre (yoksa null, örn 3 saat = 180)
    - "max_budget": Sayısal olarak toplam bütçe TL cinsinden (yoksa null)
    - "categories": Mekan kategorileri (liste halinde, Türkçe anahtar kelimeler)
    """

    try:
        model = genai.GenerativeModel(
            'gemini-2.5-flash', 
            generation_config={"response_mime_type": "application/json"}
        )
        response = await model.generate_content_async(prompt)
        
        result_json = json.loads(response.text)
        return NLPParseResult(**result_json)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"NLP analizi sırasında hata oluştu: {str(e)}")

async def generate_ai_response(prompt_text: str, places_names: list[str], max_budget: float | None = None, expanded_search: bool = False) -> str:
    if not settings.gemini_api_key:
        return "Harika bir rota hazırladım!"
        
    budget_text = ""
    if max_budget is not None:
        budget_text = f"Kullanıcının belirttiği bütçe: {max_budget} TL. Lütfen seçilen mekanların genel fiyat algısını göz önünde bulundurarak bu bütçeye uygunluğunu kısaca değerlendir ve tavsiyende bundan bahset."
        
    expanded_text = ""
    if expanded_search:
        expanded_text = "Önemli Not: Kullanıcının işaretlediği konumun 5 km yakınında uygun mekan bulunamadığı için arama alanı 15 km'ye genişletildi. Kullanıcıya bunu uygun, kibar ve olumlu bir dille mutlaka belirt."
        
    prompt = f"""
    Sen enerjik, arkadaş canlısı ve gezi rehberi tarzında bir akıllı asistansın.
    Kullanıcı senden şu rotayı istedi: "{prompt_text}"
    Sen de ona şu mekanları içeren bir rota oluşturdun: {', '.join(places_names)}
    
    {budget_text}
    {expanded_text}
    
    Kullanıcıya bu rotayı kısaca özetleyen, heyecan verici ve samimi 3-4 cümlelik bir mesaj yaz.
    Sadece kullanıcının okuyacağı metni dön. Herhangi bir ekstra açıklama ekleme.
    """
    
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = await model.generate_content_async(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"AI Response üretilirken hata: {e}")
        return "İşte senin için özenle hazırladığım rota! Umarım keyifli vakit geçirirsin."
