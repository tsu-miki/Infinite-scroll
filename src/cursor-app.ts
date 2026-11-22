import { LitElement, html, css, type PropertyValues } from "lit";
import { customElement, query, state } from "lit/decorators.js";
import { Task, TaskStatus } from "@lit/task";
import { WindowVirtualizerController } from "@tanstack/lit-virtual";
import {
  fetchItemsByCursor,
  postItem,
  type CursorRequest,
  type Item,
} from "./api";
import { ScrollMarginController } from "./scroll-margin-controller";
import { ScrollRestorationController } from "./scroll-restoration-controller";

const ITEM_HEIGHT = 52;

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
function getInitialRequest(): CursorRequest {
  const until = getUrlUntil();
  return until === null ? { type: "first" } : { type: "until", cursor: until };
}

@customElement("cursor-app")
export class CursorApp extends LitElement {
  static styles = css`
    :host {
      display: block;
      max-width: 480px;
      margin: 0 auto;
      padding: 16px;
      font-family: sans-serif;
    }
    ul {
      position: relative;
      margin: 0;
      padding: 0;
      list-style: none;
    }
    li {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: ${ITEM_HEIGHT}px;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      border-bottom: 1px solid #ddd;
    }
  `;

  @state() private request = getInitialRequest();
  @state() private items: Item[] = [];
  @state() private nextCursor: number | null = null;

  @query("h1") private heading!: HTMLHeadingElement;
  @query("ul") private list!: HTMLUListElement;

  private scrollRestoration = new ScrollRestorationController(this);

  private virtualizerController = new WindowVirtualizerController<HTMLLIElement>(this, {
    count: 0,
    estimateSize: () => ITEM_HEIGHT,
    overscan: 5,
  });

  private scrollMarginController = new ScrollMarginController(this, {
    getHeading: () => this.heading,
    getList: () => this.list,
    onChange: (scrollMargin) => {
      this.virtualizerController.setOptions({ scrollMargin });
    },
  });

  private itemsTask = new Task(this, {
    task: ([request], { signal }) => fetchItemsByCursor(request, signal),
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

  render() {
    const isLoading = this.itemsTask.status === TaskStatus.PENDING;
    const hasMore = this.nextCursor !== null;
    const virtualizer = this.virtualizerController.getVirtualizer();
    const { scrollMargin } = virtualizer.options;

    return html`
      <h1>無限スクロール（カーソル方式）</h1>
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
    `;
  }
}
