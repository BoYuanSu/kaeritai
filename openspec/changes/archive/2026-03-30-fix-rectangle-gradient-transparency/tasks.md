## 1. Gradient Mask Logic

- [x] 1.1 定位 overlay gradient transparency 的現有計算流程，確認 circle 與 rectangle 共用路徑
- [x] 1.2 實作 shape-aware gradient alpha 生成：保留 circle 的 radial fade，新增 rectangle-preserving fade
- [x] 1.3 將 alpha mask 計算封裝為可重用函式，供預覽與匯出共同使用

## 2. Preview and Export Consistency

- [x] 2.1 更新 editor canvas 套用流程，讓 rectangle + gradient 呈現矩形外觀
- [x] 2.2 更新匯出合成流程，確保匯出與預覽使用相同 mask/alpha 計算
- [x] 2.3 手動驗證 circle 與 rectangle 在 gradient 開關下的預覽/匯出一致性

## 3. Regression and Acceptance Checks

- [x] 3.1 新增或調整測試案例，覆蓋 rectangle + gradient 不應出現圓形化外觀
- [x] 3.2 新增或調整回歸案例，確認 circle + gradient 行為與既有預期一致
- [x] 3.3 依規格情境完成驗收清單並記錄結果
