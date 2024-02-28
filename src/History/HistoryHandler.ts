import { ChatHistoryItem, Message } from "Types/types";
import LLMPlugin from "main";

export class History {
	constructor(private plugin: LLMPlugin) {}

	push(message_context: ChatHistoryItem) {
		try {
			let history = this.plugin.settings.promptHistory;
			history.push(message_context);
			if (history.length > 10) {
				history.remove(history[0]);
			}
			this.plugin.settings.promptHistory = history;
			this.plugin.saveSettings();
			return true;
		} catch (exception: any) {
			return false;
		}
	}

	reset() {
		this.plugin.settings.promptHistory = [];
		this.plugin.saveSettings();
	}

    //take in an index from the selected chat history
    //overwrite history with new prompt/additional prompt
	overwriteHistory(messages: Message[], index: number) {
		const historyItem = this.plugin.settings.promptHistory[index]
		historyItem.messages = messages;
		this.plugin.settings.promptHistory[index] = historyItem
		this.plugin.saveSettings()
	}
}
