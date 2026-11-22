import type { ReactiveController, ReactiveControllerHost } from "lit";

type Options = {
  getTarget: () => Element;
  onVisible: () => void;
};

// 目印（「もっと」ボタン）が画面に入ったら、続きを読み込むように知らせる
export class AutoLoadController implements ReactiveController {
  private observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        this.options.onVisible();
      }
    },
    // 目印が画面の下端に届く少し手前から読み込み始める
    { rootMargin: "0px 0px 200px 0px" },
  );
  private isObserving = false;

  constructor(
    private host: ReactiveControllerHost,
    private options: Options,
  ) {
    host.addController(this);
  }

  // 目印は最初の描画で作られるので、描画のあとに監視を始める
  hostUpdated() {
    if (!this.isObserving) {
      this.observer.observe(this.options.getTarget());
      this.isObserving = true;
    }
  }

  hostDisconnected() {
    this.observer.disconnect();
    this.isObserving = false;
  }

  // 読み込み後も目印が画面内に残っていると、「入った」という変化が起きず通知が来ない。
  // 監視し直すと今の状態が改めて通知されるので、読み込みが終わるたびに呼ぶ
  async recheck() {
    await this.host.updateComplete;
    const target = this.options.getTarget();
    this.observer.unobserve(target);
    this.observer.observe(target);
  }
}
