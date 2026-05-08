import os
import mysql.connector
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document
from langchain_openai import ChatOpenAI

# ------------------ CONFIG ------------------

DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "aveekSql123",  # change later to env
    "database": "ems"
}

llm = ChatOpenAI(model="gpt-4.1-mini")

embedding_model = HuggingFaceEmbeddings(
    model_name="all-MiniLM-L6-v2"
)

# 🔥 MEMORY (simple)
last_result = None

# ------------------ DB CONNECTION ------------------

def get_connection():
    conn = mysql.connector.connect(**DB_CONFIG)
    return conn, conn.cursor()

# ------------------ LOAD DOCUMENTS ------------------

def load_documents():
    conn, cursor = get_connection()
    documents = []

    cursor.execute('SELECT id,name,email,DOB,Dept,Dept_lead FROM employees')
    for row in cursor.fetchall():
        documents.append(
            f"EMPLOYEE | Name: {row[1]} (ID: {row[0]}), Dept: {row[4]}, Lead: {row[5]}"
        )

    cursor.execute('SELECT dept_id,dept_name,description FROM departments')
    for row in cursor.fetchall():
        documents.append(
            f"DEPARTMENT | {row[1]} (ID: {row[0]}), Desc: {row[2]}"
        )

    cursor.execute('SELECT sick_total,casual_total,earned_total FROM leave_policy')
    for row in cursor.fetchall():
        documents.append(
            f"LEAVE POLICY | Sick: {row[0]}, Casual: {row[1]}, Earned: {row[2]}"
        )

    # 🔥 REMOVED LIMIT
    cursor.execute('SELECT employee_id,leave_type,start_date,end_date,total_days,reason,status FROM leaves')
    for row in cursor.fetchall():
        documents.append(
            f"LEAVE | EmpID: {row[0]}, Type: {row[1]}, From {row[2]} to {row[3]}, Days: {row[4]}, Status: {row[6]}"
        )

    cursor.close()
    conn.close()

    return [Document(page_content=d) for d in documents]

# ------------------ VECTOR DB ------------------

def create_or_load_vector_db():
    if os.path.exists("faiss_index"):
        return FAISS.load_local(
            "faiss_index",
            embedding_model,
            allow_dangerous_deserialization=True
        )

    docs = load_documents()

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=100
    )

    chunks = splitter.split_documents(docs)

    db = FAISS.from_documents(chunks, embedding_model)
    db.save_local("faiss_index")

    return db

db = create_or_load_vector_db()

# ------------------ ROUTER ------------------

def route_query(query):
    prompt = f"""
You are a strict classifier.

Classify into ONE:

SQL → if query involves:
- count, number, total
- filtering (under, with, by)
- names (employee, lead)
- latest, most recent

RAG → only for explanation or description

ONLY return SQL or RAG.

Query: {query}
"""
    response = llm.invoke(prompt)
    answer = response.content.strip().lower()

    return "sql" if answer == "sql" else "rag"

# ------------------ SQL GENERATION ------------------

def generate_sql(query):
    prompt = f"""
You are a STRICT MySQL query generator.

Rules:
- ALWAYS return SELECT query
- NEVER explain
- Handle names properly
- Case insensitive using LOWER()

Special rules:
- "under <name>" → Dept_lead = '<name>'
- "most recent" → ORDER BY start_date DESC LIMIT 1

Schema:
employees(id, name, email, DOB, Dept, Dept_lead)
departments(dept_id, dept_name, description)
leave_policy(sick_total, casual_total, earned_total)
leaves(employee_id, leave_type, start_date, end_date, total_days, reason, status)

Examples:

Q: how many employees under aveek
A: SELECT COUNT(*) FROM employees WHERE LOWER(Dept_lead) = 'aveek';

Q: how many employees
A: SELECT COUNT(*) FROM employees;

Q: most recent approved leave
A: SELECT * FROM leaves WHERE status='Approved' ORDER BY start_date DESC LIMIT 1;

Now:

Q: {query}
A:
"""

    response = llm.invoke(prompt)

    sql = response.content.strip()
    sql = sql.replace("```sql", "").replace("```", "").strip()

    return sql

# ------------------ SQL EXECUTION ------------------

def run_sql(sql_query):
    try:
        conn, cursor = get_connection()
        cursor.execute(sql_query)
        result = cursor.fetchall()

        cursor.close()
        conn.close()

        return result if result else None

    except Exception as e:
        return f"SQL Error: {e}"

# ------------------ FINAL ANSWER ------------------

def generate_final_answer(query, data):
    prompt = f"""
Answer clearly using the data.

If partial info exists, answer it.

Avoid saying "I don't have enough information" unless absolutely necessary.

Question:
{query}

Data:
{data}
"""
    response = llm.invoke(prompt)
    return response.content.strip()

# ------------------ MAIN FUNCTION ------------------

def process_query(query):
    global last_result

    # 🔥 MEMORY CHECK
    if any(word in query.lower() for word in ["its", "that", "this", "those"]):
        if last_result:
            return generate_final_answer(query, last_result)

    route = route_query(query)

    if route == "sql":
        sql_query = generate_sql(query)

        if not sql_query.lower().startswith("select"):
            return "Invalid SQL generated."

        result = run_sql(sql_query)

        if result is None:
            return "No relevant data found."

        last_result = result  # 🔥 store memory

        return generate_final_answer(query, result)

    else:
        results = db.similarity_search(query, k=3)

        if not results:
            return "No relevant info found."

        context = "\n".join([r.page_content for r in results])

        if len(context.strip()) < 20:
            return "No relevant info found."

        last_result = context  # 🔥 store memory

        return generate_final_answer(query, context)