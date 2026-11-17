import { LitElement, html, css } from "lit";
import { customElement } from "lit/decorators.js";

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
    return html`<h1>無限スクロール</h1>`;
  }
}
