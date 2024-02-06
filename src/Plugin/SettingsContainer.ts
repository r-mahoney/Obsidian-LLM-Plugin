import LocalLLMPlugin from "main";
import { DropdownComponent, Setting } from "obsidian";
import { DEFAULT_DIRECTORY } from "utils/utils";
const fs = require('fs')

export class SettingsContainer {
	downloadedModels: Record<string, string>;
    constructor(private plugin: LocalLLMPlugin){}

    generateSettingsContainer(parentContainer: HTMLElement, models: Record<string, string>){
        this.downloadedModels = {};
        const modelOptions = new Setting(parentContainer)
			.setName("Models")
			.setDesc("The model you want to use to generate a chat response.")
			.addDropdown((dropdown: DropdownComponent) => {
				let keys = Object.keys(models);
				for (let model of keys) {
					fs.exists(
						//@ts-ignore
						`${DEFAULT_DIRECTORY}/${models[model]}`,
						(exists: boolean) => {
							if (exists) {
								dropdown.addOption(
									this.downloadedModels[model],
									model
								);
							}
						}
					);
				}
				dropdown.onChange((change) => {
					this.plugin.settings.model = change;
					this.plugin.saveSettings();
					console.log(this.plugin.settings.model);
				});
				dropdown.setValue(this.plugin.settings.model);
			});

		const tempSetting = new Setting(parentContainer)
			.setName("Temperature")
			.setDesc(
				"Higher temperatures (eg., 1.2) increase randomness, resulting in more imaginative and diverse text. Lower temperatures (eg., 0.5) make the output more focused, predictable, and conservative. A safe range would be around 0.6 - 0.85"
			)
			.addText((text) => {
				text.setValue(`${this.plugin.settings.temperature}`);
				text.inputEl.type = "number";
				text.onChange((change) => {
					this.plugin.settings.temperature = parseFloat(change);
					this.plugin.saveSettings();
				});
			});

		const tokenSetting = new Setting(parentContainer)
			.setName("Tokens")
			.setDesc("The number of tokens used in the completion.")
			.addText((text) => {
				text.setValue(`${this.plugin.settings.tokens}`);
				text.inputEl.type = "number";
				text.onChange((change) => {
					this.plugin.settings.tokens = parseInt(change);
					this.plugin.saveSettings();
				});
			});
    }
}