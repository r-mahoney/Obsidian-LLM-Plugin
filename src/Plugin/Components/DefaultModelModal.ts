import { App, Modal, Notice } from "obsidian";
import LLMPlugin from "main";
import { changeDefaultModel } from "utils/utils";

export default class DefaultModelModal extends Modal {
	plugin: LLMPlugin;
	private defaultModel: string;

	constructor(app: App, defaultModel: string, plugin: LLMPlugin) {
		super(app);
		this.defaultModel = defaultModel;
		this.plugin = plugin
	}

	handleChangeDefaultModel() {
		changeDefaultModel(this.defaultModel, this.plugin);
		const defaultModelSelector = document.querySelector('.default-model-selector > .setting-item-control > .dropdown') as HTMLSelectElement;
		defaultModelSelector.value = this.defaultModel
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty(); // Clear existing content if needed

		// Create the modal content
		contentEl.createEl('h2', { text: 'Set model as default' });
		contentEl.createEl('p', { text: 'Would you like to set this model as your default model?' });

		// Create the interactive button
		const yesButton = contentEl.createEl('button', { text: 'Yes' });
		yesButton.onclick = () => {
			this.handleChangeDefaultModel()
			new Notice('Model set as default!');
			this.close(); // Close the modal after the action
		};

		// User elects to not save the model as default
		const noButton = contentEl.createEl('button', { text: 'No' });
		noButton.style.marginLeft = '16px';
		noButton.onclick = () => {
			new Notice('API key saved');
			this.close(); // Close the modal after the action
		};
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty(); // Clear content when the modal is closed
	}
}