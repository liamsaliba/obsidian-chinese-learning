import pinyin from "chinese-to-pinyin";
import { ItemView, WorkspaceLeaf } from "obsidian";
import { queryDictionary } from "./dict";
import { getHSK2Level, getHSK3Level } from "./hsk";

export const VIEW_TYPE_CDICT = "chinese-dictionary-view";

export class ChineseDictionaryView extends ItemView {
  query: string;

  constructor(leaf: WorkspaceLeaf, query: string) {
    super(leaf);
    this.query = query;
  }

  getIcon(): string {
    return 'learn';
  }

  getViewType() {
    return VIEW_TYPE_CDICT;
  }

  getDisplayText() {
    return "Chinese Dictionary";
  }

  async onOpen() {
    this.contentEl.empty();
    let root = this.contentEl.createEl("div", { cls: 'chinese-pane' });
    root.createEl("p", {text: "Select text to appear in this pane",
      cls: "chinese-hint"});
    // this.update();
  }

  addEntry(query: string, root: Element, isPrefixEntry: boolean = false) {
    let definitions = queryDictionary(query);
    if (isPrefixEntry) {
      if (definitions === undefined) return;
      root.createEl("hr");
    }

    let entry = root.createDiv({cls: "cn-dictionary-entry"});
    query = query.trim();
    let styledHanzi = query.split(/(\p{Script=Han})/ug)
      .filter(s => s !== "")
      .map((substr) => {
      if (substr.match(/(\p{Script=Han})/ug)) {
        return createSpan({text: substr, cls: "cn"});
      } else {
        return createSpan({text: substr})
      }
    });
    let hanzi = entry.createSpan({cls: "cn-hanzi"});
    hanzi.setChildrenInPlace(styledHanzi);

    
    // const hsk3Level = getHSK3Level(query);
    // if (hsk3Level !== null) {
    //   entry.createSpan({ text: `^${hsk3Level}`, cls: `chinese-hsk-3 chinese-hsk-3${hsk3Level}` });
    // }
    
    const hsk2Level = getHSK2Level(query);
    if (hsk2Level !== null) {
      entry.createSpan({ text: `HSK ${hsk2Level}`, cls: `chinese-hsk chinese-hsk${hsk2Level}` });
    }
    if (definitions !== undefined) {
      for (const [pinyin, translations] of Object.entries(definitions)) {
        let div = entry.createDiv()
        div.createEl("span", {text: pinyin, cls: "chinese-hint pinyin"});

        const glosses = translations.join(" | ");
        div.createEl("span", {text: glosses});
        // for (const gloss of translations) {
          // entry.createEl("li", { text: gloss, cls: `chinese-english` });
        // }
      }
    } else {
      entry.createSpan({ text: pinyin(query), cls: "chinese-hint" });
    }

  }

  update() {
    let query = this.query.trim();
    let root = this.contentEl.children[0];
    root.empty();

    this.addEntry(query, root);
    for (let l = query.length - 1; l > 0; l--) {
      for (let i = 0; i <= query.length - l; i++) {
        this.addEntry(query.slice(i, i+l), root, true);
      }
    }
    
  }

  setQuery(query: string) {
    if (query == this.query || query == pinyin(query)) return;
    this.query = query;
    this.update();
  }

  async onClose() {
    // Nothing to clean up.

    this.query = "";
  }
}