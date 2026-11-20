import { LitElement, html, css } from "lit";
import { customElement, state } from "lit/decorators.js";
import { Task, TaskStatus } from "@lit/task";
import { DEFAULT_LIMIT, fetchItems, type Item } from "./api";
import { ScrollRestorationController } from "./scroll-restoration-controller";

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
    li {
      padding: 16px 0;
      border-bottom: 1px solid #ddd;
    }
  `;

  @state() private offset = getUrlOffset();
  @state() private items: Item[] = [];

  private scrollRestoration = new ScrollRestorationController(this);

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
      this.items = [...this.items, ...newItems];
      if (isFirstLoad) {
        this.scrollRestoration.restore();
      }
    },
  });

  private loadMore() {
    this.offset += DEFAULT_LIMIT;
    setUrlOffset(this.offset);
  }

  render() {
    // 取得中に押されると前のリクエストが中止され、そのページが抜け落ちるため押せなくする
    const isLoading = this.itemsTask.status === TaskStatus.PENDING;

    return html`
      <h1>無限スクロール</h1>
      <ul>
        ${this.items.map(
          (item) =>
            html`<li><a href="/detail.html?id=${item.id}">${item.title}</a></li>`,
        )}
      </ul>
      ${this.itemsTask.render({
        pending: () => html`<p>loading</p>`,
        error: (e) => html`<p>エラー: ${e}</p>`,
      })}
      <button ?disabled=${isLoading} @click=${this.loadMore}>もっと</button>
    `;
  }
}
