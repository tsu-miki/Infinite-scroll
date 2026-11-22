import { LitElement, html, css, type PropertyValues } from "lit";
import { customElement, query, state } from "lit/decorators.js";
import { Task, TaskStatus } from "@lit/task";
import { WindowVirtualizerController } from "@tanstack/lit-virtual";
import { DEFAULT_LIMIT, fetchItems, postItem, type Item } from "./api";
import { AutoLoadController } from "./auto-load-controller";
import { ScrollMarginController } from "./scroll-margin-controller";
import { ScrollRestorationController } from "./scroll-restoration-controller";

const ITEM_HEIGHT = 52;

function getUrlOffset(): number {
  const offset = Number(new URL(location.href).searchParams.get("offset"));
  return Number.isInteger(offset) && offset >= 0 ? offset : 0;
}

function setUrlOffset(offset: number) {
  const url = new URL(location.href);
  url.searchParams.set("offset", String(offset));
  history.replaceState(history.state, "", url);
}

@customElement("app-root")
export class AppRoot extends LitElement {
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

  @state() private offset = getUrlOffset();
  @state() private items: Item[] = [];

  @query("h1") private heading!: HTMLHeadingElement;
  @query("ul") private list!: HTMLUListElement;
  @query(".load-more") private loadMoreButton!: HTMLButtonElement;

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

  private autoLoadController = new AutoLoadController(this, {
    getTarget: () => this.loadMoreButton,
    onVisible: () => this.loadMore(),
  });

  private itemsTask = new Task(this, {
    // リロード直後は表示済みが 0 件なので、先頭から offset のページの末尾までをまとめて取得する
    task: ([offset], { signal }) => {
      const from = this.items.length;
      const to = offset + DEFAULT_LIMIT;
      const limit = to - from;
      return fetchItems(from, limit, signal);
    },
    args: () => [this.offset] as const,
    onComplete: (newItems) => {
      const isFirstLoad = this.items.length === 0;
      // 取得の合間に先頭へ追加されると、表示済みの項目がもう一度返ってくるため取り除く
      const uniqueIds = new Set(this.items.map((item) => item.id));
      const nonDuplicateItems = newItems.filter(
        (item) => !uniqueIds.has(item.id),
      );
      this.items = [...this.items, ...nonDuplicateItems];
      setUrlOffset(this.offset);
      if (isFirstLoad) {
        this.scrollRestoration.restore();
      }
      this.autoLoadController.recheck();
    },
  });

  // 取得中に offset を進めると前のリクエストが中止され、そのページが抜け落ちるため何もしない
  private loadMore() {
    if (this.itemsTask.status === TaskStatus.PENDING) {
      return;
    }
    this.offset += DEFAULT_LIMIT;
  }

  protected willUpdate(changed: PropertyValues) {
    if (changed.has("items")) {
      this.virtualizerController.setOptions({ count: this.items.length });
    }
  }

  render() {
    const isLoading = this.itemsTask.status === TaskStatus.PENDING;
    const virtualizer = this.virtualizerController.getVirtualizer();
    const { scrollMargin } = virtualizer.options;

    return html`
      <h1>無限スクロール</h1>
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
        error: (e) => html`<p>エラー: ${e}</p>`,
      })}
      <button
        class="load-more"
        ?disabled=${isLoading}
        @click=${this.loadMore}
      >
        もっと
      </button>
      <button @click=${postItem}>新着を追加</button>
    `;
  }
}
