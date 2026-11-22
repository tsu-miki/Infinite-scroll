import { css } from "lit";

export const ITEM_HEIGHT = 52;

export const listStyles = css`
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
