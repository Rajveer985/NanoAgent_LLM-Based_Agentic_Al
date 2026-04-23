const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

let isEnabled = true;
let fileWatcher = null;
let statusBarItem = null;
let outputChannel = null;
let debounceTimer = null;

function activate(context) {
    // Create output channel for logging
    outputChannel = vscode.window.createOutputChannel('NanoAgent Bridge');
    outputChannel.appendLine('NanoAgent Copilot Bridge activated');

    // Create status bar item
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    updateStatusBar();
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);

    // Register enable/disable commands
    context.subscriptions.push(
        vscode.commands.registerCommand('nanoCopilotBridge.enable', () => {
            isEnabled = true;
            updateStatusBar();
            outputChannel.appendLine('Bridge ENABLED');
            vscode.window.showInformationMessage('NanoAgent Copilot Bridge: Enabled');
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('nanoCopilotBridge.disable', () => {
            isEnabled = false;
            updateStatusBar();
            outputChannel.appendLine('Bridge DISABLED');
            vscode.window.showInformationMessage('NanoAgent Copilot Bridge: Disabled');
        })
    );

    // Create file system watcher for .pending-prompt
    // Watch across all workspace folders
    fileWatcher = vscode.workspace.createFileSystemWatcher('**/.pending-prompt');

    fileWatcher.onDidCreate((uri) => handlePromptFile(uri));
    fileWatcher.onDidChange((uri) => handlePromptFile(uri));

    context.subscriptions.push(fileWatcher);

    outputChannel.appendLine('File watcher active — monitoring for .pending-prompt');
}

async function handlePromptFile(uri) {
    if (!isEnabled) {
        outputChannel.appendLine('Bridge disabled, ignoring prompt file');
        return;
    }

    // Debounce: wait 500ms to avoid duplicate triggers
    if (debounceTimer) {
        clearTimeout(debounceTimer);
    }

    debounceTimer = setTimeout(async () => {
        try {
            const filePath = uri.fsPath;

            // Check file exists
            if (!fs.existsSync(filePath)) {
                return;
            }

            // Read and parse the JSON content
            const content = fs.readFileSync(filePath, 'utf8');
            const data = JSON.parse(content);

            if (!data.prompt) {
                outputChannel.appendLine('No prompt field found in .pending-prompt');
                return;
            }

            const prompt = data.prompt;
            outputChannel.appendLine(`Prompt received: "${prompt}"`);
            outputChannel.appendLine(`Chat ID: ${data.chat_id || 'N/A'}`);
            outputChannel.appendLine(`User: ${data.user || 'N/A'}`);

            // Ensure Copilot Chat extension is active
            const copilotExt = vscode.extensions.getExtension('GitHub.copilot-chat');
            if (!copilotExt) {
                const msg = 'GitHub Copilot Chat extension not found. Please install it.';
                outputChannel.appendLine('ERROR: ' + msg);
                vscode.window.showErrorMessage('NanoAgent Bridge: ' + msg);
                return;
            }

            if (!copilotExt.isActive) {
                outputChannel.appendLine('Activating Copilot Chat extension...');
                await copilotExt.activate();
            }

            // Try to send the prompt to Copilot
            let sent = false;

            // Method 1: Use workbench.action.chat.open (built-in VS Code command)
            try {
                await vscode.commands.executeCommand('workbench.action.chat.open', {
                    query: prompt,
                    isPartialQuery: false
                });
                outputChannel.appendLine('Prompt sent via workbench.action.chat.open');
                sent = true;
            } catch (err) {
                outputChannel.appendLine(`workbench.action.chat.open failed: ${err.message}`);
            }

            // Method 2: Fallback — try Copilot-specific command
            if (!sent) {
                try {
                    await vscode.commands.executeCommand('github.copilot.chat.sendMessage', prompt);
                    outputChannel.appendLine('Prompt sent via github.copilot.chat.sendMessage');
                    sent = true;
                } catch (err) {
                    outputChannel.appendLine(`github.copilot.chat.sendMessage failed: ${err.message}`);
                }
            }

            if (sent) {
                vscode.window.showInformationMessage(`NanoAgent Bridge: Prompt forwarded to Copilot — "${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}"`);

                // Delete the .pending-prompt file to prevent re-processing
                try {
                    fs.unlinkSync(filePath);
                    outputChannel.appendLine('.pending-prompt file deleted');
                } catch (e) {
                    outputChannel.appendLine(`Warning: Could not delete .pending-prompt: ${e.message}`);
                }
            } else {
                const msg = 'Failed to send prompt to Copilot via any method.';
                outputChannel.appendLine('ERROR: ' + msg);
                vscode.window.showErrorMessage('NanoAgent Bridge: ' + msg);
            }

        } catch (err) {
            outputChannel.appendLine(`Error processing prompt: ${err.message}`);
        }
    }, 500);
}

function updateStatusBar() {
    if (statusBarItem) {
        if (isEnabled) {
            statusBarItem.text = '$(zap) NanoAgent Bridge: ON';
            statusBarItem.tooltip = 'NanoAgent Copilot Bridge is active — watching for prompts';
            statusBarItem.color = '#4EC9B0';
            statusBarItem.command = 'nanoCopilotBridge.disable';
        } else {
            statusBarItem.text = '$(circle-slash) NanoAgent Bridge: OFF';
            statusBarItem.tooltip = 'NanoAgent Copilot Bridge is disabled';
            statusBarItem.color = '#808080';
            statusBarItem.command = 'nanoCopilotBridge.enable';
        }
    }
}

function deactivate() {
    if (debounceTimer) {
        clearTimeout(debounceTimer);
    }
    if (outputChannel) {
        outputChannel.appendLine('NanoAgent Copilot Bridge deactivated');
        outputChannel.dispose();
    }
}

module.exports = { activate, deactivate };
