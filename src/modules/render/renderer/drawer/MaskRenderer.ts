import { DrawerMaskModelTypes, ElementStatus, IPoint } from "@/types";
import RenderTaskCargo from "@/modules/render/RenderTaskCargo";
import MaskTaskPath from "@/modules/render/mask/task/MaskTaskPath";
import MaskTaskClear from "@/modules/render/mask/task/MaskTaskClear";
import MaskTaskTransformer from "@/modules/render/mask/task/MaskTaskTransformer";
import BaseRenderer from "@/modules/render/renderer/drawer/BaseRenderer";
import MaskTaskRotate from "@/modules/render/mask/task/MaskTaskRotate";
import CommonUtils from "@/utils/CommonUtils";
import MathUtils from "@/utils/MathUtils";
import MaskTaskIndicator from "@/modules/render/mask/task/MaskTaskIndicator";
import IElement from "@/types/IElement";
import { IDrawerMask } from "@/types/IStageDrawer";
import { IMaskRenderer } from "@/types/IStageRenderer";
import { IMaskModel, IRotationModel } from "@/types/IModel";
import { IRenderTask } from "@/types/IRenderTask";
import {
  DefaultControllerRadius,
  SelectionIndicatorMargin,
} from "@/styles/MaskStyles";
import MaskTaskCursorPosition from "@/modules/render/mask/task/MaskTaskCursorPosition";
import ElementUtils from "@/modules/elements/utils/ElementUtils";
import { CreatorCategories, CreatorTypes } from "@/types/Creator";
import MaskTaskCircleTransformer from "@/modules/render/mask/task/MaskTaskCircleTransformer";
import { TransformerTypes } from "@/types/ITransformer";
import ElementRotation from "@/modules/elements/rotation/ElementRotation";
import VerticesTransformer from "@/modules/handler/transformer/VerticesTransformer";
import BorderTransformer from "@/modules/handler/transformer/BorderTransformer";
import { IPointController } from "@/types/IController";
import IElementRotation from "@/types/IElementRotation";

/**
 * 蒙版渲染器
 */
export default class MaskRenderer
  extends BaseRenderer<IDrawerMask>
  implements IMaskRenderer
{
  /**
   * 最后光标渲染状态 - 用于检测是否需要清理残留
   */
  private _lastCursorRendered = false;
  /**
   * 最后选区渲染状态 - 用于检测是否需要清理残留
   */
  private _lastSelectionRendered = false;

  /**
   * 执行蒙版渲染的主流程
   * 1. 创建渲染任务队列
   * 2. 按顺序处理选区/控制器/光标等元素的绘制
   * 3. 管理渲染状态缓存(_lastCursorRendered等)
   * 4. 处理边缘情况（如光标移出舞台时的残留）
   * @async
   */
  async redraw(): Promise<void> {
    // 初始化渲染任务容器
    let cargo = new RenderTaskCargo([]);
    let cursorRendered = false;

    // 选区绘制阶段 ================
    const selectionTasks = this.createMaskSelectionTasks();
    selectionTasks.forEach(task => {
      cargo.add(task);
    });
    if (selectionTasks.length) {
      this._lastSelectionRendered = true; // 标记选区已渲染
    }

    // 形变控制器绘制阶段 ===========
    const transformerTasks = this.createMaskTransformerTasks();
    if (transformerTasks.length) {
      cargo.addAll(transformerTasks);
    }

    // 普通控制器绘制阶段 ============
    const controllerTasks = this.createControllerTasks();
    if (controllerTasks.length) {
      cargo.addAll(controllerTasks);
    }

    // 特殊元素处理（单个无父元素）===
    const noParentElements = this.drawer.shield.store.noParentElements;
    if (noParentElements.length === 1) {
      const element = noParentElements[0];
      // 添加旋转图标（当元素允许旋转且处于完成状态）
      if (
        this.drawer.shield.configure.rotationIconEnable &&
        element.rotationEnable &&
        element.status === ElementStatus.finished
      ) {
        cargo.add(this.createMaskRotateTask(element.rotation));
      }
      // 添加指示器
      cargo.add(this.createMaskIndicatorTask(element));
    } else if (noParentElements.length > 1) {
      // 多选时添加范围元素的旋转任务
      cargo.add(
        this.createMaskRotateTask(
          this.drawer.shield.selection.rangeElement.rotation,
        ),
      );
    }

    // 光标绘制阶段 ================
    const task = this.drawer.shield.cursor.getTask();
    if (task) {
      cargo.add(task);
      this._lastCursorRendered = true;
      cursorRendered = true; // 标记本次循环已渲染光标
    }

    // 激活状态下的附加绘制任务 ====
    if (this.drawer.shield.isDrawerActive) {
      cargo.add(this.createMaskCursorPositionTask()); // 坐标显示
      cargo.add(this.createMaskArbitraryCursorTask()); // 自定义光标
    }

    // 任务执行与状态清理 ==========
    if (!cargo.isEmpty()) {
      // 添加前置清除任务确保画布干净
      cargo.prepend(this.createMaskClearTask());
      await this.renderCargo(cargo);
    } else {
      // 处理光标/选区移出舞台的残留
      if (
        (this._lastCursorRendered || this._lastSelectionRendered) &&
        !selectionTasks.length &&
        !cursorRendered
      ) {
        cargo.add(new MaskTaskClear(null, this.renderParams));
        await this.renderCargo(cargo);
        // 重置状态缓存
        this._lastCursorRendered = false;
        this._lastSelectionRendered = false;
      } else {
        cargo = null; // 无任务需要执行
      }
    }
  }

  /**
   * 创建光标位置坐标显示任务
   * 在光标右下方20像素处显示当前世界坐标系中的坐标值
   * @returns {IRenderTask | undefined} 返回渲染任务对象，当光标不存在时返回undefined
   */
  private createMaskCursorPositionTask(): IRenderTask {
    // 获取当前光标位置（舞台坐标系）
    const point = this.drawer.shield.cursor.value;
    if (!point) return;

    // 将舞台坐标转换为世界坐标
    const coord = ElementUtils.calcWorldPoint(
      point,
      this.drawer.shield.stageCalcParams,
    );

    // 构建坐标显示模型
    const model: IMaskModel = {
      point: {
        // 在光标右下方20像素处显示（考虑舞台缩放比例）
        x: point.x + 20 / this.drawer.shield.stageScale,
        y: point.y + 20 / this.drawer.shield.stageScale,
      },
      type: DrawerMaskModelTypes.cursorPosition,
      text: `${coord.x},${coord.y}`, // 格式化坐标值
    };

    // 创建并返回渲染任务
    const task = new MaskTaskCursorPosition(model, this.renderParams);
    return task;
  }

  /**
   * 创建选区路径绘制任务
   * 1. 获取选区模型集合（包含主选区和子选区）
   * 2. 为每个有效路径模型创建路径渲染任务
   * 3. 自动适配当前舞台缩放比例
   * @returns {IRenderTask[]} 选区路径渲染任务数组
   */
  private createMaskSelectionTasks(): IRenderTask[] {
    const selection = this.drawer.shield.selection;
    const tasks: IRenderTask[] = [];
    // 合并主选区和子选区模型
    const models: IMaskModel[] = [
      ...selection.getModels(),
      selection.selectionModel,
    ];

    models.forEach(model => {
      if (model && model.points.length > 0) {
        // 创建缩放适配的路径任务
        const task = new MaskTaskPath(
          {
            ...model,
            scale: 1 / this.drawer.shield.stageScale, // 根据舞台缩放调整路径尺寸
          },
          this.renderParams,
        );
        tasks.push(task);
      }
    });
    return tasks;
  }

  /**
   * 创建一个清空mask的任务
   *
   * @returns
   */
  private createMaskClearTask(): IRenderTask {
    const task = new MaskTaskClear(null, this.renderParams);
    return task;
  }

  /**
   * 创建形变控制器任务
   * 根据元素类型分发不同的形变处理器：
   * - 圆形元素：MaskTaskCircleTransformer
   * - 矩形元素：MaskTaskTransformer
   * @returns {IRenderTask[]} 形变控制器任务数组
   */
  private createMaskTransformerTasks(): IRenderTask[] {
    const models: IMaskModel[] = this.drawer.shield.selection.transformerModels;
    return models.map(model => {
      switch (model.element.transformerType) {
        case TransformerTypes.circle:
          return new MaskTaskCircleTransformer(model, this.renderParams);
        case TransformerTypes.rect:
          return new MaskTaskTransformer(model, this.renderParams);
      }
    });
  }

  /**
   * 创建控制器任务
   *
   * @returns
   */
  private createControllerTasks(): IRenderTask[] {
    const element =
      this.drawer.shield.store.primarySelectedElement ||
      this.drawer.shield.selection.rangeElement;
    if (element) {
      const { controllers = [] } = element;
      return controllers
        .map(controller => {
          if (
            !(controller instanceof ElementRotation) &&
            !(controller instanceof VerticesTransformer) &&
            !(controller instanceof BorderTransformer)
          ) {
            const model: IMaskModel = {
              point: {
                x: (controller as IPointController).x,
                y: (controller as IPointController).y,
              },
              type: DrawerMaskModelTypes.transformer,
              radius: DefaultControllerRadius,
            };
            return new MaskTaskCircleTransformer(model, this.renderParams);
          }
        })
        .filter(model => !!model);
    }
    return [];
  }

  /**
   * 创建一个绘制旋转图标的任务
   *
   * @param element
   * @returns
   */
  private createMaskRotateTask(rotation: IElementRotation): IRenderTask {
    const { x, y, points, angle, width, height, scale } = rotation;
    const model: IRotationModel = {
      point: { x, y },
      points,
      angle,
      type: DrawerMaskModelTypes.rotate,
      width,
      height,
      scale,
    };
    return new MaskTaskRotate(model, this.renderParams);
  }

  /**
   * 给出一个组件创建一个绘制尺寸指示器的任务
   *
   * @param element
   */
  private createMaskIndicatorTask(element: IElement): IRenderTask {
    let p1: IPoint, p2: IPoint;
    switch (element.model.type) {
      case CreatorTypes.line: {
        [p1, p2] = element.rotatePoints.sort((a, b) => a.x - b.x);
        break;
      }
      default: {
        if (element.model.angle % 90 === 0 && element.model.leanYAngle === 0) {
          p1 = element.maxBoxPoints[3];
          p2 = element.maxBoxPoints[2];
        } else {
          // 获取最左侧，最下侧，最右侧三个点
          const [leftPoint, bottomPoint, rightPoint] = CommonUtils.getLBRPoints(
            element.rotateBoxPoints,
            true,
          );
          // 计算最下侧点与最左侧点，最下侧点与最右侧点的夹角
          let leftAngle = MathUtils.transformToAcuteAngle(
            MathUtils.calcAngle(bottomPoint, leftPoint) + 180,
          );
          // 计算最下侧点与最右侧点，最下侧点与最右侧点的夹角
          let rightAngle = MathUtils.transformToAcuteAngle(
            MathUtils.calcAngle(bottomPoint, rightPoint) + 180,
          );
          // 取夹角较小的点
          const point = leftAngle < rightAngle ? leftPoint : rightPoint;
          // 将点按x坐标排序
          [p1, p2] = [point, bottomPoint].sort((a, b) => a.x - b.x);
        }
        break;
      }
    }
    // 计算夹角
    const angle = MathUtils.calcAngle(p1, p2);
    // 生成指示器数据对象
    const model: IMaskModel = {
      point: MathUtils.calcSegmentLineCenterCrossPoint(
        p1,
        p2,
        true,
        SelectionIndicatorMargin / this.drawer.shield.stageScale,
      ),
      angle,
      type: DrawerMaskModelTypes.indicator,
      text: `${element.width} x ${element.height}`,
    };
    return new MaskTaskIndicator(model, this.renderParams);
  }

  /**
   * 创建一个光标圆
   *
   * @returns
   */
  private createMaskArbitraryCursorTask(): IRenderTask {
    if (
      this.drawer.shield.currentCreator.category === CreatorCategories.freedom
    ) {
      const model: IMaskModel = {
        point: this.drawer.shield.cursor.value,
        type: DrawerMaskModelTypes.cursor,
        radius: DefaultControllerRadius,
      };
      return new MaskTaskCircleTransformer(model, this.renderParams);
    }
  }
}
