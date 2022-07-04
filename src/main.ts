import {
  addIcon,
  App,
  Editor,
  MarkdownView,
  Modal,
  Notice,
  Plugin,
  PluginSettingTab,
  Setting,
} from "obsidian";
import pinyin from "chinese-to-pinyin";
import { ChineseDictionaryView, VIEW_TYPE_CDICT } from "./view";
import hsk from "./hsk";
import dict from "./dict";
import tippy from "tippy.js";
import { EditorView } from "@codemirror/view";


// Remember to rename these classes and interfaces!

interface ChinesePluginSettings {
  mySetting: string;
}

const DEFAULT_SETTINGS: ChinesePluginSettings = {
  mySetting: "default",
};

const getSomething = (editor: Editor) => {
  if (editor.somethingSelected()) {
    const selection = editor.getSelection();
    return selection;
  } else {
    const cursor = editor.getCursor();
    const line = editor.getLine(cursor.line);
    return line;
  }
};

const hanziIcon = (character: string, size: number = 5) =>
  `<text x="10" y="75" font-size="${size}rem" fill="currentColor">${character}</text>`;

export default class ChinesePlugin extends Plugin {
  settings: ChinesePluginSettings;
  selection: string = "";


  getEditor() {
    return this.app.workspace.getActiveViewOfType(MarkdownView)?.editor;
  }

  getSelection() {
    return this.getEditor()?.getSelection() ?? "";
  }

  async onload() {
    console.log("loading liam's chinese learning plugin")
    await this.loadSettings();

    addIcon("learn", hanziIcon("学"));
    addIcon("hanzi", hanziIcon("字"));
    addIcon("cidian", hanziIcon("词"))
    addIcon("pinyin", hanziIcon("拼"));
    addIcon("yingwen", hanziIcon("英"));
    addIcon("hsk", hanziIcon("HSK", 3));
    addIcon("meaning", hanziIcon("意"));

    this.registerView(
      VIEW_TYPE_CDICT,
      (leaf) => new ChineseDictionaryView(leaf, this.getSelection())
    );

    // for debug purposes
    this.activateView();

    // This creates an icon in the left ribbon.
    const ribbonIconEl = this.addRibbonIcon(
      "learn",
      "Learn Chinese",
      (evt: MouseEvent) => {
        this.activateView();
      }
    );

    this.addCommand({
			id: "open-chinese-dictionary-view",
			name: "Open Chinese Dictionary View",
			callback: () => {
				this.activateView();
			},
		});
    // // This adds a simple command that can be triggered anywhere
    // this.addCommand({
    //   id: "open-sample-modal-simple",
    //   name: "Open sample modal (simple)",
    //   callback: () => {
    //     new SampleModal(this.app).open();
    //   },
    // });
    // // This adds an editor command that can perform some operation on the current editor instance
    // this.addCommand({
    //   id: "sample-editor-command",
    //   name: "Sample editor command",
    //   editorCallback: (editor: Editor, view: MarkdownView) => {
    //     console.log(editor);
    //     editor.replaceSelection("Sample Editor Command");
    //   },
    // });
    // // This adds a complex command that can check whether the current state of the app allows execution of the command
    // this.addCommand({
    //   id: "open-sample-modal-complex",
    //   name: "Open sample modal (complex)",
    //   checkCallback: (checking: boolean) => {
    //     // Conditions to check
    //     const markdownView =
    //       this.app.workspace.getActiveViewOfType(MarkdownView);
    //     if (markdownView) {
    //       // If checking is true, we're simply "checking" if the command can be run.
    //       // If checking is false, then we want to actually perform the operation.
    //       if (!checking) {
    //         new SampleModal(this.app).open();
    //       }

    //       // This command will only show up in Command Palette when the check function returns true
    //       return true;
    //     }
    //   },
    // });

    // This adds a settings tab so the user can configure various aspects of the plugin
    this.addSettingTab(new SampleSettingTab(this.app, this));

    this.registerEditorExtension(EditorView.updateListener.of(v => {
      if (v.selectionSet) {
        console.log("selection set!")
        if (this.selection !== this.getSelection()) {
          this.selection = this.getSelection();
          this.onChange();
        }
      }
    }));

    this.registerEvent(
      this.app.workspace.on("editor-menu", (menu) => {
        const selection = this.getEditor()!.getSelection();
        const pinyinSelection = pinyin(selection, {keepRest: true});
        
        if (selection.trim() == "") return;
        if (selection == pinyinSelection) return;

        menu.addSeparator();

        menu.addItem((item) => {
          item.setTitle(selection)
            .setIcon("hanzi")
            .onClick(() =>
              navigator.clipboard.writeText(selection)
            );
        });

        menu.addItem((item) => {
          item.setTitle(pinyinSelection)
            .setIcon("pinyin")
            .onClick(() =>
              navigator.clipboard.writeText(pinyinSelection)
            );
        });

        let definitions = dict[selection];
        if (definitions !== undefined) {
          let english = Object.values(definitions)[0].join(" | ");
          menu.addItem((item) => {
            item.setTitle(english)
              .setIcon("yingwen")
              .onClick(() =>
                navigator.clipboard.writeText(english)
              );
          });
        }
        
        
        const hskLevel = hsk(selection);
        if (hskLevel !== null) {
          menu.addItem((item) => {
            item.setTitle(hskLevel.toString())
              .setIcon("hsk");
          });
        }

        const definition = `${selection}  ${pinyinSelection}`;
      })
    );
      


    // this.registerMarkdownPostProcessor((element, context) => {
    //   const lines = element.querySelectorAll("p");

    //   for (let index = 0; index < lines.length; index++) {
    //     const line = lines.item(index);
    //     const text = line.innerText.trim();
    //     tippy(line, {
    //       content: pinyin(text, {keepRest: true}),
    //     })

    //     // if (isEmoji) {
    //       // context.addChild(new Word(line, text));
    //     // }
    //   }
    //   // We only want to add tooltips to:
    //   //  1. external links
    //   //  2. links which don't already show the href
    //   // const targetLinks = Array.from(element.getElementsByTagName("a")).filter(
    //   //   (link) =>
    //   //     link.classList.contains("external-link") &&
    //   //     link.href !== link.innerHTML
    //   // );

    // });

    // If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
    // Using this function will automatically remove the event listener when this plugin is disabled.
    // this.registerDomEvent(document, "click", (evt: MouseEvent) => {
    //   console.log("click", evt);
    // });

    // // When registering intervals, this function will automatically clear the interval when the plugin is disabled.
    // this.registerInterval(
    //   window.setInterval(() => console.log("setInterval"), 5 * 60 * 1000)
    // );
  }

  async onunload() { 
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_CDICT);
  }

  onChange() {
    this.app.workspace.getLeavesOfType(VIEW_TYPE_CDICT).forEach((leaf) => {
      if (leaf.view instanceof ChineseDictionaryView) {
        leaf.view.setQuery(this.selection);
      }
    });
  }

  async activateView() {
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_CDICT);

    await this.app.workspace.getRightLeaf(false).setViewState({
      type: VIEW_TYPE_CDICT,
      active: true,
    });

    this.app.workspace.revealLeaf(
      this.app.workspace.getLeavesOfType(VIEW_TYPE_CDICT)[0]
    );
  }

  async loadSettings() {
    this.settings = Object.assign(
      {},
      DEFAULT_SETTINGS,
      await this.loadData()
    );
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}

class SampleModal extends Modal {
  constructor(app: App) {
    super(app);
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.setText("Woah!");
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}

class SampleSettingTab extends PluginSettingTab {
  plugin: ChinesePlugin;

  constructor(app: App, plugin: ChinesePlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    containerEl.createEl("h2", { text: "Settings for my awesome plugin." });

    new Setting(containerEl)
      .setName("Setting #1")
      .setDesc("It's a secret")
      .addText((text) =>
        text
          .setPlaceholder("Enter your secret")
          .setValue(this.plugin.settings.mySetting)
          .onChange(async (value) => {
            console.log("Secret: " + value);
            this.plugin.settings.mySetting = value;
            await this.plugin.saveSettings();
          })
      );
  }
}
