import { LitElement, html, css } from "lit";
import { customElement, state } from "lit/decorators.js";
import { Task, TaskStatus } from "@lit/task";
import { DEFAULT_LIMIT, fetchItems, type Item } from "./api";

function getUrlOffset(): number {
  const offset = Number(new URL(location.href).searchParams.get("offset"));
  return Number.isInteger(offset) && offset >= 0 ? offset : 0;
}

function setUrlOffset(offset: number) {
  const url = new URL(location.href);
  url.searchParams.set("offset", String(offset));
  history.replaceState(history.state, "", url);
}

function getHistoryScrollY(): number {
  return history.state?.scrollY ?? 0;
}

function setHistoryScrollY(scrollY: number) {
  history.replaceState({ ...history.state, scrollY }, "");
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
        this.restoreScroll();
      }
    },
  });

  connectedCallback() {
    super.connectedCallback();
    // ブラウザ任せだと、データが届く前にスクロール位置を戻そうとして失敗するため自前で戻す
    history.scrollRestoration = "manual";
    window.addEventListener("scroll", this.handleScroll);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener("scroll", this.handleScroll);
  }

  private saveScrollTimer?: number;

  // replaceState は短時間に何度も呼ぶとブラウザに制限されるため、スクロールが止まってから保存する
  private handleScroll = () => {
    clearTimeout(this.saveScrollTimer);
    this.saveScrollTimer = window.setTimeout(() => {
      setHistoryScrollY(window.scrollY);
    }, 200);
  };

  private async restoreScroll() {
    await this.updateComplete;
    window.scrollTo(0, getHistoryScrollY());
  }

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
