import os 
import chromadb
from chromadb.config import Settings
from services.chunking_service import extract_pdf_text, split, split_qa_pairs


CHROMA_PATH = "./chroma_db"
file_path = "E:\\FinAssistAI\\files\\FinAssist_Customer_Policies_and_FAQ_Demo.pdf"

client = chromadb.PersistentClient(
    path=CHROMA_PATH,
    settings=Settings(anonymized_telemetry=False)
)

def get_collection():
    return client.get_or_create_collection(
        name="pdf_chunks"
    )


def store_chunks(chunks,pdf_name):
    collection = get_collection()
    existing_ids = collection.get()["ids"]
    if existing_ids:
        collection.delete(ids=existing_ids)
    
    ids = [str(i) for i in range(len(chunks))]
    metadatas = [{"source":pdf_name} for _ in chunks]

    collection.add(
        ids = ids,
        documents=chunks,
        metadatas=metadatas,
    )

    print("Added to chroma")
    
    return collection


def search_chunks(query,n_results = 5):
    collection = get_collection()

    results = collection.query(
        query_texts=[query],
        n_results=n_results
    )
    return results


print(search_chunks("what is the company policy?",n_results = 5))

def ingest_document(file_path, pdf_name):
    pdf_text = extract_pdf_text(file_path)
    chunks = split(pdf_text, 5)
    store_chunks(chunks, pdf_name)

if __name__ == "__main__":
    ingest_document(file_path, "FinAssist_Customer_Policies_and_FAQ_Demo.pdf")

