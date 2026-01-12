### Project workflow using the AI tools

The project was developed using the Google Antigravity editor and its AI coding assistant. To demonstrate the MCP capabilities, I found a multimodel code reviewer tool (https://lobehub.com/mcp/igor-safonov-git-code-review-mcp?activeTab=deployment) which is a fastmcp server that can be ran locally. ( Faced few issues and fixed those using the AI coding assistant). I ran this tool and configured it as an MCP server in the Antigravity editor. Configuration file looks like this: 

```json
{
    "mcpServers": {
        "code-review-mcp": {
            "command": "python",
            "args": [
                "-m",
                "code_review_mcp.server"
            ]
        }
    },
    "inputs": []
}
```
Now that this is configured, we can use the MCP server as a tool in the AI coding assistant.

### How the Project Progressed and AI assistant prompts

I used the following initial prompt to start the project and refine it with more usecases and tests along the way.

```Initial Prompt: I am planning to build a flashcards app. The app will allow the users to create their own flashcards, categorise them or use an AI Agent to create the custom flashcards by uploading the text as pdf. Then they can view the flashcards. Flashcards can have two sides: questions on one side and answer on the other. My front end technology can be ReactJS and Backend based on Python.. We can use sqllite db for now, but it should be extendable to other databases like postgres later. Also we need to add OpenAPI specs for the backend APIs. Let us create a plan to initialize a project based on these requirements.. ```

Later on, I used the AI coding assistant to generate the AI agent code for the flashcard generation from PDFs. I used the following prompt to generate the AI agent code.

```Prompt: I want to create an AI agent that can generate flashcards from PDFs. The AI agent should be able to extract text from the PDF and generate flashcards based on the text. The flashcards should have two sides: questions on one side and answer on the other. The AI agent should be able to generate flashcards from the PDF and return the flashcards as a list of objects with 'front' and 'back' keys.```

After the agent code was generated, I used the AI coding assistant to generate the MCP server code for the flashcard generation from PDFs. I used the following prompt to generate the MCP server code.

```Prompt: I would like to explore the possibility of the flashcard agent using an mcp server as tool to extract data from pdf and generate flashcards, which in turn can reduce the load on the AI agent.```

The above prompt created the mcp server using FastMCP and also enabled the AI agent to use the mcp server as a tool to extract data from pdf and generate flashcards.Then I got an idea to integrate a feedback loop, where the user can let the AI Agent know if they are satisfied with the card deck generated. So I used the below prompt to generate the feedback loop code.

```Prompt: In the Generate using AI functionality, can we add a user input option like chapter or the pages for which the user wants the flashcards generated and a feedback loop where the Agent waits for the user to give a thumbs up or share a feedback for improved flashcards```

Had some back and forth to make the LLM call the mcp server as a tool to extract data from pdf and generate flashcards. Finally, to implement CI/CD workflow, I used the following prompt:

```prompt: I am planning to setup CI/CD for this flashcards project.. what are the different ways we can do this? I might be deploying this app to Render or some free tier cloud deployment.```

This generated ci.yml and render.yaml files. Then I asked the application to be dockerised using the multistage dockerfile. Once the app deployment succeeded, the user login implementation got added using the prompt: 


```prompt: We have to add a functionality to enable user login/signup with a username/email and password```

Once the user login got implemented, I asked the AI coding assistant to add the user isolation feature to the application. I used the following prompt to add the user isolation feature to the application.

```prompt: We have to add a functionality to save the decks created by the user in their own account and not in the global account.```

I wanted to make sure the deployment happened after the CI in github actions succeeded.So I prompted the AI assistant to modify the github actions workflow to deploy only when the CI tests pass.

```prompt: I want to make sure the deployment happens after the CI in github actions succeeds.```

After that, I went on to add coverage metrics and displaying the coverage metrics in the Github Actions. 

```prompt: I want to add coverage metrics and displaying the coverage metrics in the Github Actions.```

Once that succeeded,I proceeded to add some more functionality improvements. I wanted to categorise the cards inside a deck based on the user's study progress. I used the following prompt to add the categorisation feature to the application.

```prompt: Lets add a new functionality. Categories to group the cards. Revise, All Done, New.. The user should be able to add cards to these categories and also move cards between categories. Show the cards grouped by category in the view cards page as well.```

Once that was done, I asked the AI coding assistant to add the deck tagging feature to the application. I used the following prompt to add the deck tagging feature to the application.

```prompt: Now, lets add an abiltiy to add tags to the Card Decks and an ability to filter by tags. Make sure to add edit tags capability as well.```

Post that, used the below prompt for some mobile improvements. 

```prompt: In the card deck, the icons have to be displayed on hover, or some kind of usability improvement so the mobile user can find the study session, delete, edit icons easily ```

While doing all these, I made sure to prompt the AI assistant to include tests for all the new features as well. 

Finally, I asked the AI coding assistant to use the MCP multi modal code reviewer tool to review the code and provide feedback. I used the following prompt: 

```prompt:Use the MCP multi modal code reviewer tool to review the code and provide feedback.```

This generated a report that can be found in the code_review_report.md file. The report contains the code review findings flagged as high severity, medium severity and low severity. Now, I asked the coding assistant to fix the high severity issues first. 

```prompt: Fix the high severity issues first.```

Of course there were some back and forths to achieve the expected results. When the conversation with the coding assistant got longer, it took a longer time to clearly fix the issues. I had to open a new context winndow and start with a new prompt. Other than that, the development of the application was super fast and seamless.


