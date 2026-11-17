import { LitElement, html, css } from "lit";
import { customElement } from "lit/decorators.js";

// アプリのルート要素。Step 0 では表示だけ。
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
  `;

  render() {
    return html`<h1>無限スクロール with Lit</h1>`;
  }
}
