from fastapi import FastAPI
from pydantic import BaseModel
from rag import process_query

app = FastAPI()

class QueryRequest(BaseModel):
    query: str

@app.post("/ask")
def ask(req: QueryRequest):
    answer = process_query(req.query)
    return {"answer": answer}