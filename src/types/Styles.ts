export enum StrokeTypes {
  inside = 0,
  middle = 1,
  outside = 2
}

// 画板元素样式定义
export type CreatorStyles = {
  strokeStyle?: string;
  strokeType?: StrokeTypes;
  lineWidth?: number;
  fillStyle?: string;
  font?: string;
  textAlign?: CanvasTextAlign;
  textBaseline?: CanvasTextBaseline;
}