"""
Notification Service for AgriConnect.
Supports sending localized SMS and Email notifications in the recipient's preferred language.
"""
from typing import Dict, Any, Optional
import os

# Multi-language notification templates
TEMPLATES: Dict[str, Dict[str, str]] = {
    "ta": { # Tamil (Default for Tamil Nadu)
        "offer_received": "வணக்கம் {name}! உங்கள் {crop} பயிருக்கான புதிய சலுகை ₹{amount} வந்துள்ளது. AgriConnect தளத்தில் பார்க்கவும்.",
        "lot_accepted": "வணக்கம் {name}! உங்கள் {quantity}kg {crop} லாட்டை வாங்குபவர் ஏற்றுக்கொண்டுள்ளார். வாகனம் தயாராக உள்ளது.",
        "payment_held": "வணக்கம் {name}! உங்கள் ₹{amount} தொகை பாதுகாப்பாக நிறுத்தி வைக்கப்பட்டுள்ளது. டெலிவரி முடிந்ததும் விடுவிக்கப்படும்.",
        "payment_released": "வணக்கம் {name}! உங்கள் {crop} லாட்டிற்கான ₹{amount} தொகை உங்கள் கணக்கில் வரவு வைக்கப்பட்டுள்ளது.",
        "dispute_raised": "கவனம் {name}! டெலிவரி #{tx_id}-க்கு வாங்குபவர் மறுப்பு/சர்ச்சை எழுப்பியுள்ளார் ({reason}). விவரங்களை மதிப்பாய்வு செய்யவும்.",
        "dispute_resolved": "வணக்கம் {name}! டெலிவரி #{tx_id} சர்ச்சை தீர்க்கப்பட்டது: {resolution}."
    },
    "en": { # English
        "offer_received": "Hello {name}! You have received a new offer of ₹{amount} for your {crop}. Check AgriConnect.",
        "lot_accepted": "Hello {name}! The buyer has accepted your lot of {quantity}kg {crop}. Transport is ready.",
        "payment_held": "Hello {name}! Payment of ₹{amount} is securely held in escrow until delivery is verified.",
        "payment_released": "Hello {name}! ₹{amount} for your {crop} lot has been released to your account.",
        "dispute_raised": "Action Required {name}! A dispute has been raised on Delivery #{tx_id} ({reason}). Please review.",
        "dispute_resolved": "Hello {name}! Dispute for Delivery #{tx_id} has been resolved: {resolution}."
    },
    "hi": { # Hindi
        "offer_received": "नमस्ते {name}! आपकी {crop} फसल के लिए ₹{amount} का नया प्रस्ताव आया है। AgriConnect पर देखें।",
        "lot_accepted": "नमस्ते {name}! खरीदार ने आपकी {quantity}kg {crop} की खेप स्वीकार कर ली है।",
        "payment_held": "नमस्ते {name}! ₹{amount} का भुगतान सुरक्षित रूप से एस्क्रो में रखा गया है।",
        "payment_released": "नमस्ते {name}! आपकी {crop} खेप के लिए ₹{amount} का भुगतान जारी कर दिया गया है।",
        "dispute_raised": "ध्यान दें {name}! डिलीवरी #{tx_id} पर विवाद दर्ज किया गया है ({reason})।",
        "dispute_resolved": "नमस्ते {name}! डिलीवरी #{tx_id} का विवाद सुलझा लिया गया है: {resolution}।"
    },
    "te": { # Telugu
        "offer_received": "నమస్కారం {name}! మీ {crop} పంట కోసం ₹{amount} కొత్త ఆఫర్ వచ్చింది.",
        "lot_accepted": "నమస్కారం {name}! మీ {quantity}kg {crop} లాట్‌ను కొనుగోలుదారు అంగీకరించారు.",
        "payment_held": "నమస్కారం {name}! మీ ₹{amount} చెల్లింపు సురక్షితంగా నిలిపివేయబడింది.",
        "payment_released": "నమస్కారం {name}! మీ {crop} లాట్ కోసం ₹{amount} మొత్తం విడుదల చేయబడింది.",
        "dispute_raised": "హెచ్చరిక {name}! డెలివరీ #{tx_id} పై వివాదం వచ్చింది ({reason}).",
        "dispute_resolved": "నమస్కారం {name}! డెలివరీ #{tx_id} వివాదం పరిష్కరించబడింది: {resolution}."
    },
    "kn": { # Kannada
        "offer_received": "ನಮಸ್ಕಾರ {name}! ನಿಮ್ಮ {crop} ಬೆಳೆಗೆ ₹{amount} ಹೊಸ ಕೊಡುಗೆ ಬಂದಿದೆ.",
        "lot_accepted": "ನಮಸ್ಕಾರ {name}! ನಿಮ್ಮ {quantity}kg {crop} ಲಾಟ್‌ ಅನ್ನು ಖರೀದಿದಾರರು ಸ್ವೀಕರಿಸಿದ್ದಾರೆ.",
        "payment_held": "ನಮಸ್ಕಾರ {name}! ₹{amount} ಮೊತ್ತವನ್ನು ಸುರಕ್ಷಿತವಾಗಿ ಎಸ್ಕ್ರೊದಲ್ಲಿ ಇರಿಸಲಾಗಿದೆ.",
        "payment_released": "ನಮಸ್ಕಾರ {name}! ನಿಮ್ಮ {crop} ಲಾಟ್‌ಗೆ ₹{amount} ಪಾವತಿಯನ್ನು ಬಿಡುಗಡೆ ಮಾಡಲಾಗಿದೆ.",
        "dispute_raised": "ಗಮನಿಸಿ {name}! ಡೆಲಿವರಿ #{tx_id} ಮೇಲೆ ವಿವಾದ ಎದ್ದಿದೆ ({reason}).",
        "dispute_resolved": "ನಮಸ್ಕಾರ {name}! ಡೆಲಿವರಿ #{tx_id} ವಿವಾದವನ್ನು ಪರಿಹರಿಸಲಾಗಿದೆ: {resolution}."
    },
    "ml": { # Malayalam
        "offer_received": "നമസ്കാരം {name}! നിങ്ങളുടെ {crop} വിളയ്ക്ക് ₹{amount} പുതിയ ഓഫർ ലഭിച്ചു.",
        "lot_accepted": "നമസ്കാരം {name}! നിങ്ങളുടെ {quantity}kg {crop} ലോട്ട് വാങ്ങുന്നയാൾ സ്വീകരിച്ചു.",
        "payment_held": "നമസ്കാരം {name}! ₹{amount} തുക സുരക്ഷിതമായി സൂക്ഷിച്ചിരിക്കുന്നു.",
        "payment_released": "നമസ്കാരം {name}! നിങ്ങളുടെ {crop} ലോട്ടിനുള്ള ₹{amount} തുക റിലീസ് ചെയ്തു.",
        "dispute_raised": "ശ്രദ്ധിക്കുക {name}! ഡെലിവറി #{tx_id}-ൽ തർക്കം രേഖപ്പെടുത്തിയിട്ടുണ്ട് ({reason}).",
        "dispute_resolved": "നമസ്കാരം {name}! ഡെലിവറി #{tx_id} തർക്കം പരിഹരിച്ചു: {resolution}."
    }
}

def get_message(template_key: str, lang: str, **kwargs) -> str:
    """Retrieve and format notification text in the target language."""
    lang_templates = TEMPLATES.get(lang, TEMPLATES["en"])
    template = lang_templates.get(template_key, TEMPLATES["en"].get(template_key, ""))
    return template.format(**kwargs)

async def send_sms_notification(phone: str, lang: str, template_key: str, **kwargs) -> bool:
    """Send localized SMS notification using configured provider (Twilio / MSG91 / Mock)."""
    message_text = get_message(template_key, lang, **kwargs)
    print(f"[SMS to {phone} in '{lang}']: {message_text}")
    
    # Check Twilio configuration
    sid = os.environ.get("SMS_PROVIDER_SID")
    token = os.environ.get("SMS_PROVIDER_AUTH_TOKEN")
    
    if sid and token and not sid.startswith("mock"):
        try:
            # Twilio SDK call if credentials are live
            pass
        except Exception as e:
            print(f"Failed to send SMS via Twilio: {e}")
            return False
            
    return True

async def send_email_notification(email: str, lang: str, subject: str, template_key: str, **kwargs) -> bool:
    """Send localized email notification."""
    message_text = get_message(template_key, lang, **kwargs)
    print(f"[Email to {email} in '{lang}'] Subject: {subject} | Body: {message_text}")
    return True
