import pinyin from "chinese-to-pinyin";
import { ItemView, WorkspaceLeaf } from "obsidian";
import dict from "./dict";
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
    this.update();
  }

  update() {
    let query = this.query;
    let root = this.contentEl.children[0];
    root.empty();

    let styledHanzi = query.split(/(\p{Script=Han})/ug).map((substr) => {
      if (substr.match(/(\p{Script=Han})/ug)) {
        return createSpan({text: substr, cls: "cn"});
      } else {
        return createSpan({text: substr})
      }
    });
    root.createDiv().setChildrenInPlace(styledHanzi);

    let definitions = dict[query];
    if (definitions !== undefined) {
      for (const [pinyin, translations] of Object.entries(definitions)) {
        root.createEl("p", { text: pinyin, cls: "chinese-hint" });

        for (const gloss of translations) {
          root.createEl("li", { text: gloss, cls: `chinese-english` });
        }
      }
    } else {
      root.createEl("p", { text: pinyin(query), cls: "chinese-hint" });
    }

    const hskLevel = hsk(query);
    if (hskLevel !== null) {
      root.createSpan({ text: `HSK ${hskLevel}`, cls: `chinese-hsk chinese-hsk${hskLevel}` });
    }
  }

  setQuery(query: string) {
    if (query == this.query || query == pinyin(query)) return;
    this.query = query;
    this.update();
  }

  async onClose() {
    // Nothing to clean up.
  }
}