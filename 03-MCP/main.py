# server.py

from fastmcp import FastMCP
import requests
from search.search import search

mcp = FastMCP("Demo 🚀")

@mcp.tool
def getWebpageContent(url: str) -> dict:
    """MCP tool to read a webpage and return its main content using the Jina Reader API (https://r.jina.ai/).

    Returns: 
        A dictionary containing the length of the content, the URL, and the response text.
    """
    api_url = f"https://r.jina.ai/{url}"
    try:
        resp = requests.get(api_url, timeout=15)
        resp.raise_for_status()

        tool_response = {
            "length": len(resp.text),
            "url": url,
            "response": resp.text
        }
        return tool_response
    except Exception as e:
        return {
            "length": 0,
            "url": url,
            "response": "",
            "error": True,
            "message": f"[Error fetching content: {e}]",
        }

@mcp.tool
def add(a: int, b: int) -> int:
    """Add two numbers"""
    return a + b

@mcp.tool
def search_docs(query: str) -> list[dict]:
    """Search the documentation using minsearch"""
    return search(query)

if __name__ == "__main__":
    mcp.run()