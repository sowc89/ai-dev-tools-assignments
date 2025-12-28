# FastMCP Demo Server

A demonstration of a Model Context Protocol (MCP) server built with `fastmcp`. It includes tools for web content retrieval and documentation search.

## Features

- **FastMCP**: Built using the `fastmcp` library for rapid development.
- **Search Tool**: Integrated `minsearch` to query local documentation.
- **Web Tool**: Fetch webpage content using Jina Reader API.

## Prerequisites

- **Python**: Version 3.10 or higher.
- **uv** (Recommended): A fast Python package installer and resolver.
  - Install via: `curl -LsSf https://astral.sh/uv/install.sh | sh` (or equivalent for your OS).

## detailed Setup

1.  **Clone/Navigate to the directory**:
    ```bash
    cd 03-MCP
    ```

2.  **Install Dependencies**:
    Using `uv` (recommended):
    ```bash
    uv sync
    ```
    
    Or using standard `pip`:
    ```bash
    python -m venv .venv
    source .venv/bin/activate  # On Windows: .\.venv\Scripts\activate
    pip install .
    ```

3.  **Prepare Search Index**:
    The search tool requires a pre-built index.
    ```bash
    # Ensure you are in the 03-MCP directory
    python search/build_index.py
    ```

## Running the Server

You can run the server in development mode:

```bash
uv run fastmcp dev main.py
# OR if using standard venv
fastmcp dev main.py
```

## Testing with MCP Inspector

The easiest way to test the tools is using the built-in MCP Inspector.

1.  Run the server in dev mode (command above).
2.  The output will show a local URL (typically `http://localhost:5173`).
3.  Open that URL in your browser.
4.  **Test `search_docs`**:
    - Select `search_docs` from the tool list.
    - Enter a query, e.g., "context".
    - Click "Run Tool".
5.  **Test `getWebpageContent`**:
    - Select the tool.
    - Enter a URL, e.g., "https://example.com".
    - Run it to see the fetched content.

## Project Structure

- `main.py`: The entry point for the MCP server.
- `search/`: Contains the search implementation.
  - `search.py`: Core search logic using `minsearch`.
  - `build_index.py`: Script to download key docs and build the index.
  - `data/`: Stores the `docs.json` index and raw data.
