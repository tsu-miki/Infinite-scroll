import type { ReactiveController, ReactiveControllerHost } from "lit";

type Options = {
  getHeading: () => Element;
  getList: () => Element;
  onChange: (scrollMargin: number) => void;
};

// 仮想スクロールはページ先頭からの位置で計算するため、一覧より上にある見出しの分（scrollMargin）を伝える。
// 見出しの高さはフォントの読み込みや画面幅で変わるので、大きさを監視して測り直す
export class ScrollMarginController implements ReactiveController {
  private observer = new ResizeObserver(() => this.measure());
  private isObserving = false;

  constructor(
    host: ReactiveControllerHost,
    private options: Options,
  ) {
    host.addController(this);
  }

  // 見出しは最初の描画で作られるので、描画のあとに監視を始める
  hostUpdated() {
    if (!this.isObserving) {
      this.observer.observe(this.options.getHeading());
      this.isObserving = true;
    }
  }

  hostDisconnected() {
    this.observer.disconnect();
    this.isObserving = false;
  }

  private measure() {
    const listTop = this.options.getList().getBoundingClientRect().top;
    this.options.onChange(listTop + window.scrollY);
  }
}
