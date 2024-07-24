import LLMPlugin from "main";
import { Assistant } from "openai/resources/beta/assistants";
import { AIAssistant } from "Types/types";

export class Assistants {
	constructor(private plugin: LLMPlugin) {}

	push(assistant: AIAssistant) {
		try {
			let assistants = this.plugin.settings.assistants;
			assistants.push(assistant);
			this.plugin.settings.assistants = assistants;
			this.plugin.saveSettings();
			return true;
		} catch (exception: any) {
			return false;
		}
	}

	reset() {
		this.plugin.settings.assistants = [];
		this.plugin.saveSettings();
	}
}
