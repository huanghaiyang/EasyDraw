import { defaults } from "@/types/constants";

export default class StageSlide implements IStageSlide {
  size: ISize = {
    width: defaults.state.slide.width,
    height: defaults.state.slide.height
  };
  position: IPoint;
  scale: number = defaults.state.slide.scale;

  public getSize(): ISize {
    return this.size;
  }

  public getPosition(): IPoint {
    return this.position;
  }

  public getScale(): number {
    return this.scale;
  }

  public setScale(scale: number): void {
    this.scale = scale;
  }

  public getScreenWidth(): number {
    return this.size.width * this.scale;
  }

  public getScreenHeight(): number {
    return this.size.height * this.scale;
  }

  public getScreenSize(): ISize {
    return {
      width: this.getScreenWidth(),
      height: this.getScreenHeight()
    };
  }

  public async init(): Promise<void> {

  }

}