
// Background script for NanoGPT Agent
// This script listens for messages from the side panel and executes commands in the context of the active tab.

chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });