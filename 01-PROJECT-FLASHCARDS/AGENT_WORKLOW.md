##Project workflow using the AI tools

The project was developed using the Google Antigravity editor and its AI coding assistant. I used the following init prompt to start the project and refine it with more usecases and tests along the way.

```Init Prompt: I am planning to build a flashcards app. The app will allow the users to create their own flashcards, categorise them or use an AI Agent to create the custom flashcards by uploading the text as pdf. Then they can view the flashcards. Flashcards can have two sides: questions on one side and answer on the other. My front end technology can be ReactJS and Backend based on Python.. We can use sqllite db for now, but it should be extendable to other databases like postgres later. Also we need to add OpenAPI specs for the backend APIs. Let us create a plan to initialize a project based on these requirements.. ```

Later on, I used the AI coding assistant to generate the AI agent code for the flashcard generation from PDFs. I used the following prompt to generate the AI agent code.

```Prompt: I want to create an AI agent that can generate flashcards from PDFs. The AI agent should be able to extract text from the PDF and generate flashcards based on the text. The flashcards should have two sides: questions on one side and answer on the other. The AI agent should be able to generate flashcards from the PDF and return the flashcards as a list of objects with 'front' and 'back' keys.```

After the agent code was generated, I used the AI coding assistant to generate the MCP server code for the flashcard generation from PDFs. I used the following prompt to generate the MCP server code.

```Prompt: I would like to explore the possibility of the flashcard agent using an mcp server as tool to extract data from pdf and generate flashcards, which in turn can reduce the load on the AI agent.```

The above prompt created the mcp server using FastMCP and also enabled the AI agent to use the mcp server as a tool to extract data from pdf and generate flashcards.Then I got an idea to integrate a feedback loop, where the user can let the AI Agent know if they are satisfied with the card deck generated. So I used the below prompt to generate the feedback loop code.

```Prompt: In the Generate using AI functionality, can we add a user input option like chapter or the pages for which the user wants the flashcards generated and a feedback loop where the Agent waits for the user to give a thumbs up or share a feedback for improved flashcards```

Had some back and forth to make the LLM call the mcp server as a tool to extract data from pdf and generate flashcards. Finally, to implement CI/CD workflow, I used the following prompt:

```prompt: I am planning to setup CI/CD for this flashcards project.. what are the different ways we can do this? I might be deploying this app to Render or some free tier cloud deployment.```

This generated ci.yml and render.yaml files. Then I asked the application to be dockerised using the multistage dockerfile. 