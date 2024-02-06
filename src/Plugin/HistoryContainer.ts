import { ChatHistoryItem } from "Types/types";
import LocalLLMPlugin from "main";

export class HistoryContainer {
	constructor(private plugin: LocalLLMPlugin) {}

	generateHistoryContainer(
		parentElement: HTMLElement,
		history: ChatHistoryItem[]
	) {
		history.map((historyItem: ChatHistoryItem) => {
			const item = parentElement.createDiv();
			item.className = "setting-item";
			item.innerHTML = historyItem.prompt;
		});
	}
}
