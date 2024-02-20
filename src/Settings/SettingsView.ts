import LocalLLMPlugin from "main";
import {
	App,
	ButtonComponent,
	PluginSettingTab,
	Setting
} from "obsidian";

export default class SettingsView extends PluginSettingTab {
	plugin: LocalLLMPlugin;

	constructor(app: App, plugin: LocalLLMPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("Reset Chat History")
			.setDesc("This will delete previous Prompts and Chat Contexts")
			.addButton((button: ButtonComponent) => {
				button.setButtonText("Reset History");
				button.onClick(() => {
					this.plugin.history.reset();
				});
			});

		const openAIAPIKey = new Setting(containerEl)
			.setName("OpenAI API Key")
			.setDesc("OpenAI models require an API key for authentication.")
			.addText((text) => {
				text.setValue(`${this.plugin.settings.openAIAPIKey}`);
				text.onChange((change) => {
					this.plugin.settings.openAIAPIKey = change;
					this.plugin.saveSettings();
				});
			})
			.addButton((button: ButtonComponent) => {
				button.setButtonText("Generate token");
				button.onClick((evt: MouseEvent) => {
					window.open("https://beta.openai.com/account/api-keys");
				});
			});
	}
}
