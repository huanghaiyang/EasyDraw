import { ArbitraryCommandTypes, ArbitraryOperations, IArbitraryCommandPayload, ICommandArbitraryObject } from "@/types/ICommand";
import ElementBaseCommand from "@/modules/command/ElementBaseCommand";
import { IElementArbitrary } from "@/types/IElement";

export default class ArbitraryEditorUpdatedCommand extends ElementBaseCommand<IArbitraryCommandPayload> {
  /**
   * 恢复元素数据
   *
   * @param type 命令类型
   * @param data 命令数据
   * @param operation 操作类型
   */
  private async _restoreElementData(type: ArbitraryCommandTypes, data: ICommandArbitraryObject, operation: ArbitraryOperations): Promise<void> {
    switch (type) {
      case ArbitraryCommandTypes.CoordsUpdated: {
        const { coords, tailCoordIndex, boxCoords, size: { width, height }, position: { x, y } } = data;
        Object.assign(this.element.model, { coords, tailCoordIndex, boxCoords, width, height, x, y });
        if (operation === ArbitraryOperations.coord_create) {
          (this.element as IElementArbitrary).tailCoordIndex = tailCoordIndex;
        }
        this.element.refresh();
        break;
      }
    }
  }

  /**
   * 撤销
   */
  async undo(): Promise<void> {
    const { uData, type, operation } = this.payload;
    if (!uData) {
      return;
    }
    await this._restoreElementData(type, uData, operation);
  }

  /**
   * 重做
   */
  async redo(): Promise<void> {
    const { rData, type } = this.payload;
    if (!rData) {
      return;
    }
    await this._restoreElementData(type, rData, this.payload.operation);
  }
}
