import { addIcon, MarkdownView, Plugin } from "obsidian";
import pinyin from "chinese-to-pinyin";
import { ChineseDictionaryView, VIEW_TYPE_CDICT } from "./view";
import {getHSK2Level, getHSK3Level} from "./hsk";
import dict from "./dict";
import { EditorView } from "@codemirror/view";

const hanziIcon = (character: string, size: number = 5) =>
	`<text x="10" y="75" font-size="${size}rem" fill="currentColor">${character}</text>`;

export default class ChinesePlugin extends Plugin {
	selection: string = "";

	getEditor() {
		return this.app.workspace.getActiveViewOfType(MarkdownView)?.editor;
	}

	getSelection() {
		return this.getEditor()?.getSelection() ?? "";
	}

	async onload() {
		console.log("loading liam's chinese learning plugin");

		addIcon("learn", hanziIcon("学"));
		addIcon("hanzi", hanziIcon("字"));
		addIcon("cidian", hanziIcon("词"));
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

		this.addRibbonIcon("learn", "Learn Chinese", (evt: MouseEvent) => {
			this.activateView();
		});

		this.addCommand({
			id: "open-chinese-dictionary-view",
			name: "Open Chinese Dictionary View",
			callback: () => {
				this.activateView();
			},
		});

		this.registerEditorExtension(
			EditorView.updateListener.of((v) => {
				if (v.selectionSet) {
					if (this.selection !== this.getSelection()) {
						this.selection = this.getSelection();
						this.onChange();
					}
				}
			})
		);

		this.registerEvent(
			this.app.workspace.on("editor-menu", (menu) => {
				const selection = this.getEditor()!.getSelection();
				const pinyinSelection = pinyin(selection, { keepRest: true });

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

				// let definitions = dict[selection];
				// if (definitions !== undefined) {
				// 	let english = Object.values(definitions)[0].join(" | ");
				// 	menu.addItem((item) => {
				// 		item.setTitle(english)
				// 			.setIcon("yingwen")
				// 			.onClick(() =>
				// 				navigator.clipboard.writeText(english)
				// 			);
				// 	});
				// }

				const hskLevel = getHSK2Level(selection);
				if (hskLevel !== null) {
					menu.addItem((item) => {
						item.setTitle(hskLevel.toString()).setIcon("hsk");
					});
				}
			})
		);
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
}
