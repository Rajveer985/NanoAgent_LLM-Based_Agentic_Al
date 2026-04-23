# NanoAgent Browser Integration

When you need to interact with a website, test a webpage, or extract browser data, use the NanoAgent API:

## API Endpoint
- **Base URL**: `http://localhost:3000`
- **Task Submission**: `POST /api/task`
- **Result Polling**: `GET /api/task/result`

## Usage

### Submit a browser task:
```bash
curl -X POST http://localhost:3000/api/task \
  -H "Content-Type: application/json" \
  -d '{"task": "Find the current price of Bitcoin on CoinMarketCap"}'
```

### Poll for result:
```bash
curl http://localhost:3000/api/task/result
```

### Response format:
- `{ "status": "queued" }` — Task sent to NanoAgent
- `{ "status": "processing" }` — NanoAgent is working on it
- `{ "status": "complete", "result": "..." }` — Task completed with result

## When to Use NanoAgent

Use NanoAgent when you need to:
- Visit a website and extract information
- Test a web page you just built
- Fill forms or click buttons on a live site
- Scrape data from web pages
- Verify that a deployed application works
- Navigate through multi-step web workflows
- Interact with web applications that require JavaScript

## Workflow Example

1. User asks: "Build a weather app that shows current temperature"
2. Copilot builds the app code
3. Copilot uses NanoAgent to test the deployed app:
   - Task: "Open http://localhost:8080 and extract the temperature displayed"
4. Copilot receives the result and confirms the app works
5. Copilot reports completion to user

## Advanced Usage: Waiting for Task Completion

When submitting a task, you should poll the result endpoint until completion:

```bash
# Submit task
curl -X POST http://localhost:3000/api/task \
  -H "Content-Type: application/json" \
  -d '{"task": "Go to example.com and extract the heading"}'

# Poll until complete (repeat every 2-3 seconds)
curl http://localhost:3000/api/task/result

# Once status is "complete", use the result in your response
```

## Error Handling

- If the NanoBridge server is not running, the API call will fail with connection refused
- Always check the response status before proceeding
- If a task fails, NanoAgent will return an error message in the result field

## Best Practices

1. **Be specific in task descriptions**: "Find the price of Bitcoin on CoinMarketCap" is better than "Check Bitcoin price"
2. **Include URLs when possible**: "Go to https://example.com and extract the main heading"
3. **Specify extraction format**: "Extract all product prices in a list format"
4. **Test incrementally**: For complex workflows, break them into smaller tasks
