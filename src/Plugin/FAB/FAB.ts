import LLMPlugin from "main";
import { ButtonComponent } from "obsidian";

const ROOT_WORKSPACE_CLASS = "app-container"

export class FAB {
    plugin: LLMPlugin
	constructor(plugin: LLMPlugin) {
        this.plugin = plugin
    }

	hideContainer(container: HTMLElement) {
		container.setAttr("style", "display: none");
	}
	showContainer(container: HTMLElement) {
		container.setAttr("style", "display: flex");
	}

	async onOpen() {
        const topWidget = createDiv()
		topWidget.setAttribute("class", `div-scrollToTop`);
		topWidget.setAttribute("id", '__C_scrollToTop');
		// document.body.style.setProperty("--size-ratio", this.settings.resizeButton.toString());

		let button = new ButtonComponent(topWidget);
		button.setIcon("arrow-up").setClass("buttonItem").onClick(() => {});

		document.body
			.querySelector(ROOT_WORKSPACE_CLASS)
			?.insertAdjacentElement("afterbegin", topWidget);

	}

	async onClose() {}
}
