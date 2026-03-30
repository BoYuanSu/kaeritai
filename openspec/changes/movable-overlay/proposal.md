## Why

目前使用者無法在背景圖片上任意移動疊加 (overlay) 的圖片，這限制了影像編輯器的排版靈活度。新增自由拖曳或移動疊加圖片的功能，將可大幅提升使用者體驗與影像合成的自由度。

## What Changes

- 為疊加圖片 (overlay image) 新增拖拉 (drag-and-drop) 或位置調整的功能。
- 更新畫面 UI，可能會需要加入滑鼠游標的視覺提示 (例如 `cursor: move`)，讓使用者知道該圖片是可以拖曳的。
- 若未來將合成結果匯出，匯出功能必須能正確捕捉疊加圖片移動後的新座標。

## Capabilities

### New Capabilities
- `movable-overlay`: 涵蓋在背景圖片上自由移動疊加圖片的相關操作與狀態管理。

### Modified Capabilities

## Impact

- `ImageEditor` 元件的狀態管理（需新增疊加圖片的 `x` 和 `y` 座標狀態）。
- 滑鼠或觸控事件的處理邏輯 (MouseDown, MouseMove, MouseUp等)。
- 相關的 CSS 樣式更新（例如使用絕對定位來控制位置，或若使用 Canvas 則需更新繪製座標）。
