import { IStageMaskTaskSelection, IStageMaskTaskSelectionObj } from "@/types";
import StageMaskTaskBase from "@/modules/render/StageMaskTaskBase";

export default class StageMaskTaskSelection extends StageMaskTaskBase implements IStageMaskTaskSelection {

  get data() {
    return this.obj as  IStageMaskTaskSelectionObj;
  }
}