import pytest
from unittest.mock import MagicMock, patch, AsyncMock
from app.services.ai_agent import FlashcardAgent
from app.models import CardCreate

class TestFlashcardAgent:
    @pytest.fixture
    def mock_genai(self):
        with patch("app.services.ai_agent.genai") as mock:
            yield mock

    def test_init_raises_error_without_api_key(self):
        with patch("os.getenv", return_value=None):
            with pytest.raises(ValueError, match="GOOGLE_API_KEY not configured"):
                FlashcardAgent()

    @pytest.mark.asyncio
    async def test_generate_from_pdf_success(self, mock_genai):
        with patch("os.getenv", return_value="fake_key"):
            with patch("app.services.ai_agent.stdio_client") as mock_stdio_client:
                with patch("app.services.ai_agent.ClientSession") as mock_client_session:
                    mock_stdio_client.return_value.__aenter__.return_value = (None, None)
                    session_instance = mock_client_session.return_value.__aenter__.return_value
                    session_instance.initialize = AsyncMock()
                    
                    mock_tool_result = MagicMock()
                    mock_content = MagicMock()
                    mock_content.text = "Extracted Text Content"
                    mock_tool_result.content = [mock_content]
                    session_instance.call_tool = AsyncMock(return_value=mock_tool_result)

                    # Mock Gemini Chat
                    mock_chat = MagicMock()
                    
                    # 1. First response: Function Call
                    mock_call = MagicMock()
                    mock_call.name = "extract_text_from_pdf"
                    mock_call.args = {"start_page": 1, "end_page": -1}
                    
                    mock_part_1 = MagicMock()
                    mock_part_1.function_call = mock_call
                    
                    mock_response_1 = MagicMock()
                    mock_response_1.candidates = [MagicMock(content=MagicMock(parts=[mock_part_1]))]
                    
                    # 2. Second response: Final Text
                    mock_response_2 = MagicMock()
                    mock_response_2.text = '[{"front": "Q1", "back": "A1"}]'
                    mock_response_2.candidates = [MagicMock(content=MagicMock(parts=[]))] # Break loop
                    
                    mock_chat.send_message.side_effect = [mock_response_1, mock_response_2]

                    # Mock the model that is created with tools
                    with patch("app.services.ai_agent.genai.GenerativeModel") as mock_model_class:
                        mock_model_instance = mock_model_class.return_value
                        mock_model_instance.start_chat.return_value = mock_chat
                        
                        agent = FlashcardAgent()
                        result, text = await agent.generate_from_pdf(b"fake pdf content")

                        assert len(result) == 1
                        assert result[0].front == "Q1"
                        assert text == "Extracted Text Content"

    @pytest.mark.asyncio
    async def test_generate_from_pdf_cleans_json_markdown(self, mock_genai):
        with patch("os.getenv", return_value="fake_key"):
            with patch("app.services.ai_agent.stdio_client") as mock_stdio_client:
                with patch("app.services.ai_agent.ClientSession") as mock_client_session:
                    mock_stdio_client.return_value.__aenter__.return_value = (None, None)
                    session_instance = mock_client_session.return_value.__aenter__.return_value
                    session_instance.initialize = AsyncMock()
                    session_instance.call_tool = AsyncMock(return_value=MagicMock(content=[MagicMock(text="text")]))

                    mock_chat = MagicMock()
                    mock_resp_final = MagicMock()
                    mock_resp_final.text = "```json\n" + '[{"front": "Q1", "back": "A1"}]' + "\n```"
                    mock_resp_final.candidates = [MagicMock(content=MagicMock(parts=[]))]
                    mock_chat.send_message.return_value = mock_resp_final

                    with patch("app.services.ai_agent.genai.GenerativeModel") as mock_model_class:
                        mock_model_instance = mock_model_class.return_value
                        mock_model_instance.start_chat.return_value = mock_chat
                        
                        agent = FlashcardAgent()
                        result, _ = await agent.generate_from_pdf(b"pdf")
                        assert len(result) == 1
                        assert result[0].front == "Q1"

    @pytest.mark.asyncio
    async def test_generate_from_pdf_handles_invalid_structure(self, mock_genai):
        with patch("os.getenv", return_value="fake_key"):
            with patch("app.services.ai_agent.stdio_client") as mock_stdio_client:
                with patch("app.services.ai_agent.ClientSession") as mock_client_session:
                    mock_stdio_client.return_value.__aenter__.return_value = (None, None)
                    session_instance = mock_client_session.return_value.__aenter__.return_value
                    session_instance.initialize = AsyncMock()
                    session_instance.call_tool = AsyncMock(return_value=MagicMock(content=[MagicMock(text="text")]))

                    mock_chat = MagicMock()
                    mock_resp_final = MagicMock()
                    mock_resp_final.text = '[{"front": "Q1", "back": "A1"}, {"front": "Q2"}]' # Missing 'back'
                    mock_resp_final.candidates = [MagicMock(content=MagicMock(parts=[]))]
                    mock_chat.send_message.return_value = mock_resp_final

                    with patch("app.services.ai_agent.genai.GenerativeModel") as mock_model_class:
                        mock_model_instance = mock_model_class.return_value
                        mock_model_instance.start_chat.return_value = mock_chat
                        
                        agent = FlashcardAgent()
                        result, _ = await agent.generate_from_pdf(b"pdf")
                        assert len(result) == 1
                        assert result[0].front == "Q1"

    @pytest.mark.asyncio
    async def test_generate_from_pdf_with_page_ranges(self, mock_genai):
        with patch("os.getenv", return_value="fake_key"):
            with patch("app.services.ai_agent.stdio_client") as mock_stdio_client:
                with patch("app.services.ai_agent.ClientSession") as mock_client_session:
                    mock_stdio_client.return_value.__aenter__.return_value = (None, None)
                    session_instance = mock_client_session.return_value.__aenter__.return_value
                    session_instance.initialize = AsyncMock()
                    
                    mock_tool_result = MagicMock()
                    mock_content = MagicMock()
                    mock_content.text = "Page content"
                    mock_tool_result.content = [mock_content]
                    session_instance.call_tool = AsyncMock(return_value=mock_tool_result)

                    # Mock the chat and its send_message
                    mock_chat = MagicMock()
                    # First send_message returns the tool call request
                    # Second send_message returns the final text
                    mock_response_1 = MagicMock()
                    mock_part_1 = MagicMock()
                    mock_part_1.function_call.name = "extract_text_from_pdf"
                    mock_part_1.function_call.args = {"start_page": 2, "end_page": 5}
                    mock_response_1.candidates = [MagicMock(content=MagicMock(parts=[mock_part_1]))]
                    
                    mock_response_2 = MagicMock()
                    mock_response_2.text = '[{"front": "Q", "back": "A"}]'
                    mock_response_2.candidates = [MagicMock(content=MagicMock(parts=[]))] # To break the loop

                    mock_chat.send_message.side_effect = [mock_response_1, mock_response_2]

                    with patch("app.services.ai_agent.genai.GenerativeModel") as mock_model_class:
                        mock_model_instance = mock_model_class.return_value
                        mock_model_instance.start_chat.return_value = mock_chat
                        
                        agent = FlashcardAgent()
                        await agent.generate_from_pdf(b"pdf", start_page=2, end_page=5)

                        # Verify initial prompt contained page range
                        call_args = mock_chat.send_message.call_args_list[0]
                        prompt = call_args[0][0]
                        assert "pages 2 to 5" in prompt

    @pytest.mark.asyncio
    async def test_refine_flashcards_success(self, mock_genai):
        with patch("os.getenv", return_value="fake_key"):
            agent = FlashcardAgent()
            
            mock_response = MagicMock()
            mock_response.text = '[{"front": "Refined Q", "back": "Refined A"}]'
            agent.model.generate_content.return_value = mock_response

            current_cards = [CardCreate(front="Old Q", back="Old A")]
            result = await agent.refine_flashcards(current_cards, "Source text", "Make it better")

            assert len(result) == 1
            assert result[0].front == "Refined Q"
            assert "Refined A" in result[0].back
            
            # Verify prompt content
            args = agent.model.generate_content.call_args[0][0]
            assert "Old Q" in args
            assert "Make it better" in args
            assert "Source text" in args
