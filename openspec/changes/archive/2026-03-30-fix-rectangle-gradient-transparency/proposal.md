## Why

目前在使用者選擇 `rectangle` Shape Mask 並啟用 Gradient Transparency 時，overlay 的視覺結果會接近圓形淡出，與矩形遮罩預期不一致。這會造成編輯預覽與使用者心智模型落差，也降低該功能在實務設計流程中的可預測性。

## What Changes

- 調整 Gradient Transparency 的行為，使其在 `rectangle` Shape Mask 下維持矩形外觀，而非產生圓形邊界感。
- 明確定義 Shape Mask 與 Gradient Transparency 的組合規則，確保不同遮罩形狀下的漸層方向與邊界一致。
- 確保 editor 預覽與匯出結果在遮罩與漸層透明效果上保持一致。

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `overlay-masking`: 更新 gradient transparency 需求，要求在 `rectangle` mask 下套用符合矩形幾何的透明漸層，避免圓形化視覺結果。

## Impact

- 規格：`openspec/specs/overlay-masking/spec.md` 需新增/調整 delta requirements。
- 前端實作：可能影響 overlay 遮罩與 alpha mask 的計算流程（例如 canvas gradient/mask 組合邏輯）。
- 匯出流程：需驗證匯出影像與預覽在矩形漸層效果一致。
