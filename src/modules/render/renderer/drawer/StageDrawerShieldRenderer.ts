import { IStageDrawerShieldRenderer, IStageShield } from "@/types";
import StageDrawerBaseRenderer from "./StageDrawerBaseRenderer";

export default class StageDrawerShieldRenderer extends StageDrawerBaseRenderer<IStageShield> implements IStageDrawerShieldRenderer {
  async redraw(): Promise<void> {

  }
}