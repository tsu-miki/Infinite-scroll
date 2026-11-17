import { LitElement, html, css } from "lit";
import { customElement, state } from "lit/decorators.js";
import { Task, TaskStatus } from "@lit/task";
import { DEFAULT_LIMIT, fetchItems, type Item } from "./api";

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

  @state() private offset = 0;
  @state() private items: Item[] = [];

  private itemsTask = new Task(this, {
    task: ([offset], { signal }) => fetchItems(offset, DEFAULT_LIMIT, signal),
    args: () => [this.offset] as const,
    onComplete: (newItems) => {
      this.items = [...this.items, ...newItems];
    },
  });

  private loadMore() {
    this.offset += DEFAULT_LIMIT;
  }

  render() {
    // 取得中に押されると前のリクエストが中止され、そのページが抜け落ちるため押せなくする
    const isLoading = this.itemsTask.status === TaskStatus.PENDING;

    return html`
      <h1>無限スクロール</h1>
      <ul>
        ${this.items.map((item) => html`<li>${item.title}</li>`)}
      </ul>
      ${this.itemsTask.render({
        pending: () => html`<p>loading</p>`,
        error: (e) => html`<p>エラー: ${e}</p>`,
      })}
      <button ?disabled=${isLoading} @click=${this.loadMore}>もっと</button>
    `;
  }
}
