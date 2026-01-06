from fastmcp import FastMCP
import pypdf
import io

import base64

# Initialize FastMCP server
mcp = FastMCP("PDF Extractor")

def extract_text_logic(pdf_base64: str, start_page: int = 1, end_page: int = -1) -> str:
    try:
        pdf_content = base64.b64decode(pdf_base64)
        reader = pypdf.PdfReader(io.BytesIO(pdf_content))
        total_pages = len(reader.pages)
        
        # Adjust 1-based indexing to 0-based
        start_idx = max(0, start_page - 1)
        
        if end_page == -1 or end_page > total_pages:
            end_idx = total_pages
        else:
            end_idx = end_page
        
        extracted_text = []
        for i in range(start_idx, end_idx):
            if i < total_pages:
                text = reader.pages[i].extract_text()
                if text:
                    extracted_text.append(f"--- Page {i+1} ---\n{text}")
        
        return "\n\n".join(extracted_text)
    except Exception as e:
        return f"Error extracting PDF text: {str(e)}"

@mcp.tool()
def extract_text_from_pdf(pdf_base64: str, start_page: int = 1, end_page: int = -1) -> str:
    """
    Extracts text from a PDF file within a specified page range.
    
    Args:
        pdf_base64: The Base64 encoded string of the PDF file.
        start_page: The starting page number (1-indexed). Defaults to 1.
        end_page: The ending page number (1-indexed). Defaults to -1 (last page).
                  If end_page is -1 or greater than the total pages, it extracts until the end.
    
    Returns:
        The extracted text from the specified pages joined by newlines.
    """
    return extract_text_logic(pdf_base64, start_page, end_page)

if __name__ == "__main__":
    mcp.run(show_banner=False)
