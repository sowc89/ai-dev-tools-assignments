import os
import json
import re
import tempfile
import google.generativeai as genai
from typing import List, Tuple
from app.models import CardCreate
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

import base64

def extract_json_from_response(text: str) -> str:
    """Extract JSON from markdown code blocks or raw JSON."""
    # Try to extract from markdown code blocks
    json_match = re.search(r'```(?:json)?\s*(\[.*?\])\s*```', text, re.DOTALL)
    if json_match:
        return json_match.group(1)
    
    # Try to find raw JSON array
    json_match = re.search(r'(\[.*?\])', text, re.DOTALL)
    if json_match:
        return json_match.group(1)
    
    return text.strip()

class FlashcardAgent:
    def __init__(self):
        self.api_key = os.getenv("GOOGLE_API_KEY")
        if not self.api_key:
            raise ValueError("GOOGLE_API_KEY not configured")
        
        genai.configure(api_key=self.api_key)
        # Reverting to 'gemini-flash-latest' as 'gemini-1.5-flash' caused 404
        self.model_name = os.getenv("GEMINI_MODEL", "gemini-flash-latest")
        self.model = genai.GenerativeModel(self.model_name)

    async def generate_from_pdf(self, pdf_content: bytes, start_page: int = 1, end_page: int = -1) -> Tuple[List[CardCreate], str]:
        # MCP Server parameters for the backend extraction tool
        # Calculate absolute path to mcp_server.py which is in the same directory as the backend root
        backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        mcp_server_path = os.path.join(backend_dir, "mcp_server.py")
        
        server_params = StdioServerParameters(
            command="python", 
            args=[mcp_server_path], 
            env=None
        )
        
        # Save PDF to a temporary file for the MCP server to read
        # Using a temporary file is more efficient than passing large base64 strings
        temp_pdf_path = None  # Initialize to None for safer cleanup
        try:
            temp_pdf = tempfile.NamedTemporaryFile(suffix=".pdf", delete=False)
            temp_pdf.write(pdf_content)
            temp_pdf.flush()  # Ensure write completes
            temp_pdf_path = temp_pdf.name
            temp_pdf.close()
        except Exception as e:
            print(f"DEBUG: Failed to create temp file: {e}")
            raise
        
        extracted_text = ""
        
        try:
            # 1. Start MCP Session
            async with stdio_client(server_params) as (read, write):
                async with ClientSession(read, write) as session:
                    await session.initialize()
                    
                    # Fetch available tools from MCP server to inform Gemini
                    # For simplicity in this implementation, we define the tool interface manually
                    # but it maps directly to the mcp_server.py 'extract_text_from_pdf' tool.
                    
                    # Note: We define this local function to provide Gemini with the tool signature.
                    # The actual implementation is handled in the execution loop below.
                    def extract_text_from_pdf(start_page: int, end_page: int) -> str:
                        """
                        Extracts text from the uploaded PDF for the given page range.
                        
                        Args:
                            start_page: The starting page number (1-indexed).
                            end_page: The ending page number (1-indexed). Use -1 for the end of the document.
                        """
                        return f"Extracting text from pages {start_page} to {end_page}..."

                    # Temporarily update model with tools for this session
                    model_with_tools = genai.GenerativeModel(
                        model_name=self.model_name,
                        tools=[extract_text_from_pdf]
                    )
                    
                    chat = model_with_tools.start_chat(enable_automatic_function_calling=False)
                    
                    prompt = f"""
                    I have uploaded a PDF document. 
                    Please create flashcards from it. 
                    The user requested pages {start_page} to {end_page if end_page != -1 else 'the end'}.
                    
                    Use the `extract_text_from_pdf` tool to get the content. 
                    You MUST pass the correct page range: start_page={start_page}, end_page={end_page}.
                    
                    After you get the text, generate a JSON list of flashcards with 'front' and 'back' keys.
                    Return ONLY the JSON array.
                    """
                    
                    response = chat.send_message(prompt)
                    
                    # Tool Execution Loop
                    while True:
                        # Check if response has parts and if the first part is a function call
                        # Add bounds checking to prevent IndexError
                        if (not response.candidates or 
                            not response.candidates[0].content.parts):
                            break
                        
                        part = response.candidates[0].content.parts[0]
                        # In Gemini SDK, text parts might not have function_call attribute or it's None
                        if not getattr(part, "function_call", None):
                            break
                            
                        call = part.function_call
                        if call.name == "extract_text_from_pdf":
                            print(f"DEBUG: LLM requested tool call: {call.name} with args {call.args}")
                            
                            # Safely convert args to dict
                            try:
                                tool_args = {k: v for k, v in call.args.items()}
                            except AttributeError:
                                # Fallback if items() is not available
                                tool_args = dict(call.args)
                                
                            tool_args["pdf_path"] = temp_pdf_path
                            
                            mcp_result = await session.call_tool("extract_text_from_pdf", arguments=tool_args)
                            
                            if mcp_result.content and hasattr(mcp_result.content[0], "text"):
                                extracted_text = mcp_result.content[0].text
                            else:
                                extracted_text = str(mcp_result.content)
                                
                            print(f"DEBUG: Tool execution complete. Extracted text length: {len(extracted_text)}")
                            
                            # Feed the result back to Gemini
                            response = chat.send_message(
                                {
                                    "parts": [
                                        {
                                            "function_response": {
                                                "name": call.name,
                                                "response": {"result": extracted_text}
                                            }
                                        }
                                    ]
                                }
                            )
                        else:
                            print(f"DEBUG: LLM requested unknown tool: {call.name}")
                            break
                    
                    # Final response handling - use robust JSON extraction
                    cleaned_response = extract_json_from_response(response.text)
                        
                    try:
                        cards_data = json.loads(cleaned_response)
                        valid_cards = []
                        for item in cards_data:
                            if 'front' in item and 'back' in item:
                                valid_cards.append(CardCreate(front=str(item['front']), back=str(item['back'])))
                        return valid_cards, extracted_text
                    except Exception as e:
                        print(f"DEBUG: Failed to parse LLM response: {cleaned_response}")
                        import traceback
                        traceback.print_exc()
                        raise e
                
        except Exception as e:
            print(f"DEBUG: AI Error: {e}")
            import traceback
            traceback.print_exc()
            raise e
        finally:
            # Clean up the temporary file - improved cleanup logic
            if temp_pdf_path is not None:
                try:
                    if os.path.exists(temp_pdf_path):
                        os.remove(temp_pdf_path)
                        print(f"DEBUG: Cleaned up temporary PDF file: {temp_pdf_path}")
                except Exception as cleanup_err:
                    print(f"DEBUG: Failed to cleanup temp file: {cleanup_err}")

    async def refine_flashcards(self, current_cards: List[CardCreate], source_text: str, feedback: str) -> List[CardCreate]:
        # Serialize current cards to JSON for the prompt
        cards_json = json.dumps([c.model_dump() for c in current_cards])
        
        system_instruction = f"""
        You are a helpful assistant assisting a student with flashcards.
        The user has provided some flashcards generated from a text, and feedback on how to improve them.
        Please generate a NEW list of flashcards based on the source text and the user's feedback.
        You can allow modifications to existing cards or replace them entirely.
        
        SOURCE TEXT:
        {source_text}

        CURRENT CARDS:
        {cards_json}

        USER FEEDBACK:
        {feedback}

        Return the output ONLY as a valid JSON array of objects with 'front' and 'back' keys.
        Do not include any markdown formatting like ```json ... ```.
        """
        
        try:
            response = self.model.generate_content(system_instruction)
            
            # Use robust JSON extraction
            cleaned_response = extract_json_from_response(response.text)
                
            cards_data = json.loads(cleaned_response)
            
            valid_cards = []
            for item in cards_data:
                if 'front' in item and 'back' in item:
                    valid_cards.append(CardCreate(front=str(item['front']), back=str(item['back'])))
                    
            return valid_cards
            
        except Exception as e:
            print(f"DEBUG: AI Refine Error: {e}")
            raise e
