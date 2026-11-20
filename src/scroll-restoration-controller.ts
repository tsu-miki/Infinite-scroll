import type { ReactiveController, ReactiveControllerHost } from "lit";

function getHistoryScrollY(): number {
  return history.state?.scrollY ?? 0;
}

function setHistoryScrollY(scrollY: number) {
  history.replaceState({ ...history.state, scrollY }, "");
}

export class ScrollRestorationController implements ReactiveController {
  private timeoutId?: number;

  constructor(private host: ReactiveControllerHost) {
    host.addController(this);
  }

  hostConnected() {
    // ブラウザ任せだと、データが届く前にスクロール位置を戻そうとして失敗するため自前で戻す
    history.scrollRestoration = "manual";
    window.addEventListener("scroll", this.handleScroll);
  }

  hostDisconnected() {
    window.removeEventListener("scroll", this.handleScroll);
    clearTimeout(this.timeoutId);
  }

  async restore() {
    await this.host.updateComplete;
    window.scrollTo(0, getHistoryScrollY());
  }

  // replaceState は短時間に何度も呼ぶとブラウザに制限されるため、スクロールが止まってから保存する
  private handleScroll = () => {
    clearTimeout(this.timeoutId);
    this.timeoutId = window.setTimeout(() => {
      setHistoryScrollY(window.scrollY);
    }, 200);
  };
}
