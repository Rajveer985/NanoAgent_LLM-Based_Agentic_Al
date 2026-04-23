# NanoAgent Copilot Bridge

A VS Code extension that automatically watches for prompts from the NanoAgent Demo UI and forwards them to GitHub Copilot Agent Mode.

## Prerequisites

- GitHub Copilot Chat extension installed and authenticated
- VS Code 1.90.0 or later

## How It Works

1. **Demo UI** — The user interacts with the NanoAgent Demo UI and submits a prompt
2. **Webhook** — The NanoBridge server receives the prompt and writes it to a `.pending-prompt` file
3. **This Extension** — Monitors all workspace folders for `.pending-prompt` files
4. **Copilot Chat** — The prompt is forwarded to GitHub Copilot Chat, ready for Agent Mode execution

## Usage

- The bridge activates automatically when VS Code starts
- A status bar item shows the current state (ON/OFF)
- Click the status bar item to toggle enable/disable
- Or use the Command Palette:
  - `NanoAgent Bridge: Enable`
  - `NanoAgent Bridge: Disable`

## Commands

| Command | Title |
|---------|-------|
| `nanoCopilotBridge.enable` | NanoAgent Bridge: Enable |
| `nanoCopilotBridge.disable` | NanoAgent Bridge: Disable |

## Agent Mode Note

For fully autonomous behavior, make sure to select **"Agent"** mode in the Copilot Chat dropdown before starting the demo. This allows Copilot to execute commands, edit files, and perform actions on your behalf.
