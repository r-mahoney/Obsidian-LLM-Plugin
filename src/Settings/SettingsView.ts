import LocalLLMPlugin, { DEFAULT_SETTINGS } from "main";
import {
	App,
	ButtonComponent,
	DropdownComponent,
	Notice,
	PluginSettingTab,
	Setting,
	TextAreaComponent,
	TextComponent,
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
				button.setButtonText("Reset History")
				button.onClick(() => {
					this.plugin.history.reset()
				})
			})
	}
}
