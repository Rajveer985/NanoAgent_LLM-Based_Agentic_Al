# NanoAgent Browser Integration

## RULES — USE NANOAGENT WHENEVER BROWSER INTERACTION IS NEEDED

1. **If the user asks to "verify", "test", "check", or "open" anything in a browser** → you MUST use the NanoAgent API. Do NOT guess or simulate.
2. **If you build any web page, HTML file, or web app** → you MUST immediately follow up by sending it to NanoAgent for browser verification.
3. **Never claim a web page works without actually testing it in a browser via NanoAgent.**

## How to Use NanoAgent

Submit a task via curl in the terminal:

```bash
curl -s -X POST http://localhost:3000/api/task \
  -H "Content-Type: application/json" \
  -d '{"task": "Your browser task description here"}'
```

Poll for the result:

```bash
curl -s http://localhost:3000/api/task/result
```

**Keep polling until `status` is `"complete"`.** Do not stop at `"queued"` or `"processing"`.

## AUTOMATIC BROWSER VERIFICATION

**After creating ANY web page or web application, immediately submit a verification task to NanoAgent.**

Use this exact pattern:

```bash
curl -s -X POST http://localhost:3000/api/task \
  -H "Content-Type: application/json" \
  -d '{"task": "Navigate to <URL> and verify the page loads correctly. Describe what you see, what elements are present, and whether anything looks broken."}'
```

Then poll until complete:

```bash
curl -s http://localhost:3000/api/task/result
```

## API Endpoint Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `http://localhost:3000/api/task` | POST | Submit a browser task |
| `http://localhost:3000/api/task/result` | GET | Poll for task result |

### Response States
- `{ "status": "queued" }` — Task received, not yet started
- `{ "status": "processing" }` — NanoAgent is actively working
- `{ "status": "complete", "result": "..." }` — Done, use the result

## Concrete Examples — Copy and Adapt

### Verify a web page you just built:
```bash
curl -s -X POST http://localhost:3000/api/task \
  -H "Content-Type: application/json" \
  -d '{"task": "Navigate to http://localhost:8080 and verify the page loads correctly. Describe what you see."}'
```

### Check a deployed site:
```bash
curl -s -X POST http://localhost:3000/api/task \
  -H "Content-Type: application/json" \
  -d '{"task": "Go to https://example.com and extract the main heading text"}'
```

### Test form functionality:
```bash
curl -s -X POST http://localhost:3000/api/task \
  -H "Content-Type: application/json" \
  -d '{"task": "Navigate to http://localhost:3000/login, fill the username with \"test\" and password with \"test123\", click submit, and report what happens"}'
```

### Extract data from a site:
```bash
curl -s -X POST http://localhost:3000/api/task \
  -H "Content-Type: application/json" \
  -d '{"task": "Find the current price of Bitcoin on https://coinmarketcap.com and return only the price"}'
```

### Verify a multi-step flow:
```bash
curl -s -X POST http://localhost:3000/api/task \
  -H "Content-Type: application/json" \
  -d '{"task": "Navigate to http://localhost:8080/checkout, fill the shipping form, click continue, and report if the payment page appears"}'
```

## Workflow Example

1. User asks: "Build a weather app"
2. You write the code
3. **You MUST start a local server and immediately run:**
   ```bash
   curl -s -X POST http://localhost:3000/api/task \
     -H "Content-Type: application/json" \
     -d '{"task": "Navigate to http://localhost:8080 and verify the weather app loads. Describe the UI and whether the temperature is displayed."}'
   ```
4. You poll `curl -s http://localhost:3000/api/task/result` until `"complete"`
5. You report the actual browser result to the user

## Best Practices

- **Be specific in task descriptions.** Include exact URLs.
- **Never skip verification.** If you built it, you must test it in the browser.
- **Poll until complete.** A result with `"processing"` is not a final answer.
- If the server is not running (`connection refused`), inform the user that NanoBridge needs to be started.
