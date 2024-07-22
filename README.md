<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://github.com/r-mahoney/Obsidian-LLM-Plugin/assets/46250921/bda9f3e8-c4c8-4087-838c-f467c1f30910">
  <source media="(prefers-color-scheme: light)" srcset="https://github.com/r-mahoney/Obsidian-LLM-Plugin/assets/46250921/27317c62-3026-4e45-9ef1-f433cbd58442">
  <img alt="Shows project promo image in light and dark mode" src="https://user-images.githubusercontent.com/25423296/163456779-a8556205-d0a5-45e2-ac17-42d089e3c3f8.png">
</picture>

# A Plugin for accessing LLMs through Obsidian

This plugin allows Obsidian users to access local and web LLMs. Local LLMs are available via GPT4All. Currently, OpenAI models are the only web-based LLMs available for use in the plugin. We are working on adding additional support for Google Gemini in the near future.

# Installation

This plugin in Beta and still under development so installation can be done either through the use of another Obsidian Plugin, Beta Reviewers Auto-update Tester ([BRAT](https://github.com/TfTHacker/obsidian42-brat)) - [Quick guide for using BRAT](https://tfthacker.com/Obsidian+Plugins+by+TfTHacker/BRAT+-+Beta+Reviewer's+Auto-update+Tool/Quick+guide+for+using+BRAT) (**Recommended**)
- Search for "Obsidian42 - BRAT" in the Obsidian Community plugins.
- Open the command palette and run the command `BRAT: Add a beta plugin for testing` 
- Paste "https://github.com/r-mahoney/Obsidian-LLM-Plugin".
- Click on "Add Plugin".
- After BRAT confirms the installation, in Settings go to the Community plugins tab.
- Refresh the list of plugins.
- Find the Obsidian LLM Plugin and enable it.

or by cloning the repo:
- Clone this repo.
- Make sure your NodeJS is at least v16 (`node --version`).
- `npm i` or `yarn` to install dependencies.
- Once the dependencies have been installed, run `npm run build` to build the plugin.
- Once the plugin has been built, it should be ready to activate.

# Requirements
**GPT4All**

In order to use the GPT4All LLMs you must have the desktop client from [NomicAI](https://www.nomic.ai/gpt4all) downloaded to your local computer and have at least one GPT4All LLM downloaded. 

 - No GPT4All models will be displayed in the Widget, FAB, or Modal settings unless you have them downloaded locally
 - In order for the plugin to  have access to the GPT4All client, you must have the API Server enabled from the GPT4All settings

We currenlty have local doc functionality working for GPT4All models which allows users to add their Obsidian Vault to the GPT4All client and allow 

**OpenAI**

The OpenAI models we currently support come pre-loaded in the plugin. They include the chat models and image generation models. We are working on epxanding access to most if not all of the OpenAI endpoints. 

In order to access these models, you will need to have an OpenAI account with a generated API Key and credits allowing you to make API calls. You can either generate an API Key in the LLM Plugin settings using the "Generate Token" button, or just add your API Key to the input bar. Once your API Key is input, you should have full access to the OpenAI models that we support.

# Features

Users are able to access LLMs through a variety of ways: a modal, a floating action button(FAB), and a sidebar widget. The FAB can be toggled on and off through the plugin settings or through the command pallate. The widget can be used in the sidebar or in the place of a note tab. 

- Note: The modal is being deprecated upon public release since the widget provides the same use cases.

In each of the views, you have access to Model Settings, Chat History, and New Chat options
<p align="center">
  <img src="README_images/fabchat.png" alt="profiles_example">
</p>
<p align="center">
  <img src="README_images/modalsettings.png" alt="profiles_example">
</p>
<p align="center">
  <img src="README_images/widgethistory.png" alt="profiles_example">
</p>

Clicking the settings, or history button switches to that tab in the plugin view, to get back to the prompt tab, simply click on the highlighted button again.

  - Note: If you haven't submitted any prompts then the chat history tab will appear as an empty page that users may confuse with a broken plugin. We are working on adding an empty state to make it more apparent which tab you are on

  ## Local Docs for GPT4All

  GPT4All makes creating a context out of all your valuts notes and bringing the information you have from files on-device into your LLM chats simple with just a few installation [steps](https://docs.gpt4all.io/gpt4all_desktop/localdocs.html#create-localdocs).
  1. Click + Add Collection.
  2. Name your collection and link it to a folder
     * I have found that the best way to do this is by creating a "Context" folder in my Obsidian Vault and adding any notes I want in my Local Docs to the context folder and then linking to the context folder
     * Doing this ensures that all of the other files in the vault, i.e: the .obsidian folder, are not included in the Local Docs. Otherwise GPT4All will take a long time indexing the files.
  3. Click Create Collection. Progress for the collection is displayed on the LocalDocs page.
     * You will see a green Ready indicator when the entire collection is ready. 
  4. In the GPT4All Chat Client, open LocalDocs with button in top-right corner to give your LLM context from those files.