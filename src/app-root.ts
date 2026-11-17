import { LitElement, html, css } from "lit";
import { customElement, state } from "lit/decorators.js";
import { Task } from "@lit/task";
import { DEFAULT_LIMIT, fetchItems } from "./api";

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

  private itemsTask = new Task(this, {
    task: ([offset], { signal }) => fetchItems(offset, DEFAULT_LIMIT, signal),
    args: () => [this.offset] as const,
  });

  private loadMore() {
    this.offset += DEFAULT_LIMIT;
  }

  render() {
    return html`
      <h1>無限スクロール</h1>
      ${this.itemsTask.render({
        pending: () => html`<p>loading</p>`,
        complete: (items) => html`
          <ul>
            ${items.map((item) => html`<li>${item.title}</li>`)}
          </ul>
        `,
        error: (e) => html`<p>エラー: ${e}</p>`,
      })}
      <button @click=${this.loadMore}>もっと</button>
    `;
  }
}
