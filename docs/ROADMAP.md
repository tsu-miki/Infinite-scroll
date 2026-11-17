# 学習ロードマップ

元記事: 「無限スクロールを実装したくない」(blog.ojisan.io/i-hate-infinite-scroll)

記事は Next.js / React で書かれているので、Lit（素の Web Components + History API）に置き換えて一歩ずつ進める。
各ステップは 1 コミット。コードを読んで納得してから次へ進む。

| Step | 内容 | 記事の対応箇所 |
|---|---|---|
| 0 | 土台：Vite + Lit + モック API | バックエンドの API 定義 |
| 1 | 愚直な実装：「もっと」ボタンで offset を進める（わざと穴あり） | 一般的な実装方法 |
| 2 | 表示済みデータと取得中の状態を分離する | 追加コンテンツに対するローディングの状態管理 |
| 3 | offset を URL に載せ、リロードで復帰（0〜offset を全量取得） | 更新されると状態が初期状態に戻る / offset 以前のデータが表示されない |
| 4 | スクロール位置：URL 更新時・ブラウザバック時の復元 | スクロール位置の管理 |
| 5 | 大量 DOM 問題とバーチャルスクロール（@lit-labs/virtualizer） | 大量のコンテンツがメモリに載る |
| 6 | key の重複：Lit の `repeat` ディレクティブ | key が重複し、編集事故が起きうる |
| 7 | 発展：IntersectionObserver で自動読み込み | まとめ（もっとハードなもの） |

## React → Lit の対応メモ

| React / Next.js | Lit / ブラウザ標準 |
|---|---|
| `useState` | `@state()` プロパティ（変更で再描画） |
| `useEffect` | `updated()` / `connectedCallback()` などのライフサイクル |
| `router.push` | `history.pushState` / `history.replaceState` |
| `router.push(..., { scroll: false })` | pushState はそもそもスクロールしない |
| `scrollRestoration` | `history.scrollRestoration` + `history.state` |
| `key` | `repeat(items, (i) => i.id, ...)` |
| react-window 等 | `@lit-labs/virtualizer` |

## 起動

```sh
npm install
npm run dev
```
