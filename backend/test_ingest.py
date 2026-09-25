import os
import asyncio
from dotenv import load_dotenv
load_dotenv()

from fastapi import UploadFile
from app.rag.ingestion import process_pdf
from fpdf import FPDF
import traceback

async def main():
    try:
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font('Arial', 'B', 16)
        pdf.cell(40, 10, 'Hello World!')
        tmp_path = 'test.pdf'
        pdf.output(tmp_path)
        
        with open(tmp_path, 'rb') as f:
            upload_file = UploadFile(filename='test.pdf', file=f)
            result = await process_pdf(upload_file)
            print('Result:', result)
    except Exception as e:
        print("Error during main:")
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
