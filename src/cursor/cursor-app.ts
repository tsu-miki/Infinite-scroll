import { LitElement, html, type PropertyValues } from "lit";
import { customElement, query, state } from "lit/decorators.js";
import { Task, TaskStatus } from "@lit/task";
import { WindowVirtualizerController } from "@tanstack/lit-virtual";
import { deleteFirstItem, postItem, type Item } from "../shared/item";
import { ITEM_HEIGHT, listStyles } from "../shared/list-styles";
import { ScrollRestorationController } from "../shared/scroll-restoration-controller";
import { fetchItems, type ItemsRequest } from "./api";

function getUrlUntil(): number | null {
  const value = new URL(location.href).searchParams.get("until");
  const until = Number(value);
  return value !== null && Number.isInteger(until) ? until : null;
}

function setUrlUntil(until: number) {
  const url = new URL(location.href);
  url.searchParams.set("until", String(until));
  history.replaceState(history.state, "", url);
}

// URL に「どの項目まで表示していたか」があれば、リロード直後は先頭からその項目までをまとめて取得する
function getInitialRequest(): ItemsRequest {
  const until = getUrlUntil();
  return until === null ? { type: "first" } : { type: "until", cursor: until };
}

@customElement("cursor-app")
export class CursorApp extends LitElement {
  static styles = listStyles;

  @state() private request = getInitialRequest();
  @state() private items: Item[] = [];
  @state() private nextCursor: number | null = null;

  @query("ul") private list!: HTMLUListElement;

  private scrollRestoration = new ScrollRestorationController(this);

  private virtualizerController = new WindowVirtualizerController<HTMLLIElement>(this, {
    count: 0,
    estimateSize: () => ITEM_HEIGHT,
    overscan: 5,
  });

  private itemsTask = new Task(this, {
    task: ([request], { signal }) => fetchItems(request, signal),
    args: () => [this.request] as const,
    onComplete: ({ items, nextCursor }) => {
      const isFirstLoad = this.items.length === 0;
      this.items = [...this.items, ...items];
      this.nextCursor = nextCursor;
      const lastItem = this.items.at(-1);
      if (lastItem) {
        setUrlUntil(lastItem.id);
      }
      if (isFirstLoad) {
        this.scrollRestoration.restore();
      }
    },
  });

  private loadMore() {
    if (this.nextCursor !== null) {
      this.request = { type: "after", cursor: this.nextCursor };
    }
  }

  protected willUpdate(changed: PropertyValues) {
    if (changed.has("items")) {
      this.virtualizerController.setOptions({ count: this.items.length });
    }
  }

  // 仮想スクロールはページ先頭からの位置で計算するため、一覧より上にある見出しの分を伝える
  protected firstUpdated() {
    const scrollMargin = this.list.getBoundingClientRect().top + window.scrollY;
    this.virtualizerController.setOptions({ scrollMargin });
  }

  render() {
    const isLoading = this.itemsTask.status === TaskStatus.PENDING;
    const hasMore = this.nextCursor !== null;
    const virtualizer = this.virtualizerController.getVirtualizer();
    const { scrollMargin } = virtualizer.options;

    return html`
      <h1>カーソル方式</h1>
      <ul style="height: ${virtualizer.getTotalSize()}px">
        ${virtualizer.getVirtualItems().map((virtualItem) => {
          const item = this.items[virtualItem.index];
          const y = virtualItem.start - scrollMargin;
          return html`
            <li style="transform: translateY(${y}px)">
              <a href="/detail.html?id=${item.id}">${item.title}</a>
            </li>
          `;
        })}
      </ul>
      ${this.itemsTask.render({
        pending: () => html`<p>loading</p>`,
        complete: () => (hasMore ? null : html`<p>これで全部です</p>`),
        error: (e) => html`<p>エラー: ${e}</p>`,
      })}
      <button ?disabled=${isLoading || !hasMore} @click=${this.loadMore}>
        もっと
      </button>
      <button @click=${postItem}>新着を追加</button>
      <button @click=${deleteFirstItem}>先頭を削除</button>
    `;
  }
}
