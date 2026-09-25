import os
import concurrent.futures
from typing import List, Dict
from langchain_core.tools import tool
from app.rag.ingestion import get_vector_store

@tool
def vector_search(query: str) -> str:
    """
    Useful for searching the vector database for relevant document chunks across all uploaded files based on a query.
    Takes a string query and returns a formatted string of relevant document excerpts with file source and page metadata.
    Always use this tool if you need context from the uploaded documents to answer questions, generate summaries, compare files, or generate test papers.
    """
    def _search():
        vectorstore = get_vector_store()
        # Retrieve candidate chunks across vector store memory
        docs = vectorstore.similarity_search(query, k=12)
        
        if not docs:
            return "No relevant information found in the documents for this query."
            
        query_lower = query.lower()
        
        # Selective filtering if a specific file name is mentioned in the prompt
        targeted_docs = []
        for doc in docs:
            fname = doc.metadata.get('file_name', doc.metadata.get('source', '')).lower()
            fname_base = os.path.basename(fname).lower()
            if fname and (fname in query_lower or fname_base in query_lower):
                targeted_docs.append(doc)
                
        # If user explicitly asked about a specific file present in retrieval results
        if targeted_docs:
            selected_docs = targeted_docs[:12]
        else:
            # Multi-document balanced retrieval: group chunks by document to ensure all batch files are included
            doc_groups: Dict[str, List] = {}
            for doc in docs:
                fname = doc.metadata.get('file_name', doc.metadata.get('source', 'Uploaded Document'))
                doc_groups.setdefault(fname, []).append(doc)
            
            selected_docs = []
            max_rounds = max(len(v) for v in doc_groups.values()) if doc_groups else 0
            for r in range(max_rounds):
                for fname, group in doc_groups.items():
                    if r < len(group) and len(selected_docs) < 12:
                        selected_docs.append(group[r])
                        
        formatted_results = []
        for i, doc in enumerate(selected_docs):
            filename = doc.metadata.get('file_name', doc.metadata.get('source', 'Uploaded Document'))
            page_num = doc.metadata.get('page', 1)
            file_type = doc.metadata.get('file_type', '')
            formatted_results.append(
                f"--- Result {i+1} [Source: {filename}, Page/Section: {page_num}, Type: {file_type}] ---\n{doc.page_content}\n"
            )
            
        return "\n".join(formatted_results)

    try:
        # Strict 1.5s execution cap for sub-2s answer streaming on 1st attempt
        with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
            future = executor.submit(_search)
            return future.result(timeout=1.5)
    except concurrent.futures.TimeoutError:
        print(f"Vector search execution cap reached (1.5s) for query: {query}")
        return "Vector search capped at 1.5s limit. Proceeding with best-effort response context."
    except Exception as e:
        return f"Error executing vector search: {str(e)}"


