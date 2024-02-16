import { ChatContainer } from "Plugin/ChatContainer";
import LocalLLMPlugin from "main";
import { ItemView, WorkspaceLeaf } from "obsidian";

export const VIEW_TYPE = "example-view";

export class WidgetView extends ItemView {
    plugin: LocalLLMPlugin
	constructor(leaf: WorkspaceLeaf, plugin: LocalLLMPlugin) {
		super(leaf);
        this.plugin = plugin
	}

	getViewType(): string {
		return VIEW_TYPE;
	}

	getDisplayText(): string {
		return "Example View";
	}

	async onOpen() {
		const container = this.containerEl.children[1];
		container.empty();
		container.createEl("h4", { text: "Example View" });
        const chat = new ChatContainer(this.plugin)
        chat.generateChatContainer(container)
	}

	async onClose() {}
}