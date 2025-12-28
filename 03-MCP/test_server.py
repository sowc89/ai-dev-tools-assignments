
import pytest
import asyncio
from main import getWebpageContent


def _unwrap_tool_result(result):
    if hasattr(result, "structured_content"):
        return result.structured_content
    return result


def test_get_webpage_content_success():
    url = "https://example.com"
    result = asyncio.run(getWebpageContent.run((url,)))
    structured = _unwrap_tool_result(result)
    assert isinstance(structured, dict)
    print(f"Content length for {url}: {structured['length']}")
    assert structured["url"] == url
    assert "Example Domain" in structured["response"]


def test_get_webpage_content_invalid_url():
    url = "http://not_a_real_url"
    result = asyncio.run(getWebpageContent.run((url,)))
    structured = _unwrap_tool_result(result)
    print(f"Result for {url}: {structured}")
    assert isinstance(structured, dict)
    assert structured.get("error") is True
    assert "Error fetching content" in (structured.get("message") or "")
