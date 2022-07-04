import pinyin from "chinese-to-pinyin";
import { ItemView, WorkspaceLeaf } from "obsidian";
import { queryDictionary } from "./dict";
import hsk from "./hsk";

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

    let styledHanzi = query.split(/(\p{Script=Han})/ug).map((substr) => {
      if (substr.match(/(\p{Script=Han})/ug)) {
        return createSpan({text: substr, cls: "cn"});
      } else {
        return createSpan({text: substr})
      }
    });
    let top = entry.createDiv();
    top.setChildrenInPlace(styledHanzi);

    if (definitions !== undefined) {
      top.createSpan({ text: Object.keys(definitions).join(', '), cls: "chinese-hint" });
      
      for (const [pinyin, translations] of Object.entries(definitions)) {
        const glosses = translations.join(" | ");
        entry.createEl("div", {text: glosses});
        // for (const gloss of translations) {
          // entry.createEl("li", { text: gloss, cls: `chinese-english` });
        // }
      }
    } else {
      top.createSpan({ text: pinyin(query), cls: "chinese-hint" });
    }

    const hskLevel = hsk(query);
    if (hskLevel !== null) {
      top.createSpan({ text: `HSK ${hskLevel}`, cls: `chinese-hsk chinese-hsk${hskLevel}` });
    }
  }

  update() {
    let query = this.query;
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