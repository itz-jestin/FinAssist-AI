import nltk
from nltk.tokenize import sent_tokenize
from pypdf import PdfReader

try:
    nltk.data.find("tokenizers/punkt")
except LookupError:
    nltk.download("punkt")    

try:
    nltk.data.find("tokenizers/punkt_tab")
except LookupError:
    nltk.download("punkt_tab")   


         

def split(text,sentences_per_chunk=3):
    sentences = sent_tokenize(text)
    chunks = []

    for i in range(0,len(sentences),sentences_per_chunk):
        chunk = " ".join(sentences[i:i+ sentences_per_chunk])
        chunks.append(chunk)
    return chunks




def extract_pdf_text(file_path):
    reader = PdfReader(file_path)

    text = ""

    for page in reader.pages:
        page_text = page.extract_text()

        if page_text:
            text+= page_text

    return text



