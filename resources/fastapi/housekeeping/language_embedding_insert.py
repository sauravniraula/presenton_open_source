

languages = [
  'English (English)',
  'Spanish (Español)',
  'French (Français)', 
  'German (Deutsch)',
  'Portuguese (Português)',
  'Italian (Italiano)',
  'Dutch (Nederlands)',
  'Russian (Русский)',
  'Chinese (Simplified & Traditional - 中文, 汉语/漢語)',
  'Japanese (日本語)',
  'Korean (한국어)',
  'Arabic (العربية)',
  'Hindi (हिन्दी)',
  'Bengali (বাংলা)',
  'Polish (Polski)',
  'Czech (Čeština)',
  'Slovak (Slovenčina)',
  'Hungarian (Magyar)',
  'Romanian (Română)',
  'Bulgarian (Български)',
  'Greek (Ελληνικά)',
  'Serbian (Српски)',
  'Croatian (Hrvatski)',
  'Bosnian (Bosanski)',
  'Slovenian (Slovenščina)',
  'Finnish (Suomi)',
  'Swedish (Svenska)',
  'Danish (Dansk)',
  'Norwegian (Norsk)',
  'Icelandic (Íslenska)',
  'Lithuanian (Lietuvių)',
  'Latvian (Latviešu)',
  'Estonian (Eesti)',
  'Maltese (Malti)',
  'Welsh (Cymraeg)',
  'Irish (Gaeilge)',
  'Scottish Gaelic (Gàidhlig)',
  'Hebrew (עברית)',
  'Persian/Farsi (فارسی)',
  'Turkish (Türkçe)',
  'Kurdish (Kurdî / کوردی)',
  'Pashto (پښتو)',
  'Dari (دری)',
  'Uzbek (Oʻzbek)',
  'Kazakh (Қазақша)',
  'Tajik (Тоҷикӣ)',
  'Turkmen (Türkmençe)',
  'Azerbaijani (Azərbaycan dili)',
  'Urdu (اردو)',
  'Tamil (தமிழ்)',
  'Telugu (తెలుగు)',
  'Marathi (मराठी)',
  'Punjabi (ਪੰਜਾਬੀ / پنجابی)',
  'Gujarati (ગુજરાતી)',
  'Malayalam (മലയാളം)',
  'Kannada (ಕನ್ನಡ)',
  'Odia (ଓଡ଼ିଆ)',
  'Sinhala (සිංහල)',
  'Nepali (नेपाली)',
  'Thai (ไทย)',
  'Vietnamese (Tiếng Việt)',
  'Lao (ລາວ)',
  'Khmer (ភាសាខ្មែរ)',
  'Burmese (မြန်မာစာ)',
  'Tagalog/Filipino (Tagalog/Filipino)',
  'Javanese (Basa Jawa)',
  'Sundanese (Basa Sunda)',
  'Malay (Bahasa Melayu)',
  'Mongolian (Монгол)',
  'Swahili (Kiswahili)',
  'Hausa (Hausa)',
  'Yoruba (Yoruba)',
  'Igbo (Igbo)',
  'Amharic (አማርኛ)',
  'Zulu (isiZulu)',
  'Xhosa (isiXhosa)',
  'Shona (ChiShona)',
  'Somali (Soomaaliga)',
  'Basque (Euskara)',
  'Catalan (Català)',
  'Galician (Galego)',
  'Quechua (Runasimi)',
  'Nahuatl (Nāhuatl)',
  'Hawaiian (ʻŌlelo Hawaiʻi)',
  'Maori (Te Reo Māori)',
  'Tahitian (Reo Tahiti)',
  'Samoan (Gagana Samoa)'
]



import os
from langchain_community.vectorstores.upstash import UpstashVectorStore
from langchain_openai import OpenAIEmbeddings
from langchain_core.documents import Document

# Create an embeddings instance
embeddings = OpenAIEmbeddings(model="text-embedding-3-small", )




# Create a vector store instance
vector_store = UpstashVectorStore(embedding=embeddings, index_url = os.getenv("UPSTASH_VECTOR_REST_URL_LANGUAGE"), index_token=os.getenv("UPSTASH_VECTOR_REST_TOKEN_LANGUAGE"))

# documents = [ Document(id= language, page_content=language) for language in languages]

# vector_store.add_documents(documents=documents)

results = vector_store.similarity_search(query="english (nepali)", k=5)
print(results)