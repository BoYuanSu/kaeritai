## Context

目前 overlay masking 已支援 shape mask 與 gradient transparency，但 gradient 的實作偏向以中心向外的 radial fade，導致在 `rectangle` 遮罩下也呈現接近圓形的淡出邊界。此問題同時影響編輯預覽與匯出結果一致性，且會讓使用者在選擇 rectangle 時得到不符合預期的視覺結果。

## Goals / Non-Goals

**Goals:**
- 讓 gradient transparency 在 `rectangle` mask 下維持矩形幾何外觀。
- 定義 shape-aware gradient 規則，確保不同 shape 與漸層的組合行為可預測。
- 確保 canvas 預覽與匯出流程使用一致的 mask/alpha 計算邏輯。

**Non-Goals:**
- 不新增新的 shape mask 類型。
- 不改動 overlay 移動、縮放、裁切與不透明度控制邏輯。
- 不引入新的外部繪圖函式庫。

## Decisions

1. 採用 shape-aware gradient 策略。
- `circle`：維持 radial gradient（中心最不透明，邊界透明）。
- `rectangle`：改用符合矩形邊界的透明分佈（以水平/垂直距離或方形距離場近似），避免角落先被圓形化裁切。
- 理由：以 shape 為主導可讓遮罩語意穩定，符合使用者對幾何形狀的預期。

2. 將預覽與匯出共享同一套 alpha mask 生成邏輯。
- 理由：避免 preview/export 漂移，降低功能回歸風險。
- 替代方案：預覽與匯出各自實作；已放棄，因為容易造成不一致。

3. 保持設定介面不變（仍為 Gradient Transparency toggle）。
- 理由：需求是修正行為而非擴充 UI，降低學習成本與變更範圍。

## Risks / Trade-offs

- [Risk] 矩形漸層演算法選型不當，可能讓邊緣過硬或過軟。 → Mitigation: 以視覺驗收案例校準漸層曲線，並加入 rectangle/circle 對照測試。
- [Risk] 共用 alpha mask 函式改動影響既有 circle 表現。 → Mitigation: 為 circle 建立回歸測試，確認與現況一致。
- [Trade-off] shape-aware 演算法比單一 radial 複雜。 → Mitigation: 將邏輯封裝在單一函式，減少呼叫端複雜度。
