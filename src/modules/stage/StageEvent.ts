import IStageEvent from "@/types/IStageEvent";
import IStageShield from "@/types/IStageShield";
import EventUtils from "@/utils/EventUtils";
import ResizeEvents from "@/utils/ResizeEvents";
import { EventEmitter } from "events";
import isHotkey from "is-hotkey";
import { TaskQueue } from "@/modules/render/RenderQueue";
import { QueueTask } from "@/modules/render/RenderTask";
import FileUtils from "@/utils/FileUtils";
import TimeUtils from "@/utils/TimerUtils";

export default class StageEvent extends EventEmitter implements IStageEvent {
  shield: IStageShield;

  private _isCtrl: boolean;
  private _isCtrlWheel: boolean;
  private _isShift: boolean;
  private _isCtrlEvent: (e: KeyboardEvent) => boolean;
  private _isCtrlPlusEvent: (e: KeyboardEvent) => boolean;
  private _isCtrlReduceEvent: (e: KeyboardEvent) => boolean;
  private _isCtrl0Event: (e: KeyboardEvent) => boolean;
  private _isCtrlAEvent: (e: KeyboardEvent) => boolean;
  private _isCtrlMEvent: (e: KeyboardEvent) => boolean;
  private _isCtrlHEvent: (e: KeyboardEvent) => boolean;
  private _isCtrlGEvent: (e: KeyboardEvent) => boolean;
  private _isCtrlCEvent: (e: KeyboardEvent) => boolean;
  private _isCtrlZEvent: (e: KeyboardEvent) => boolean;
  private _isCtrlYEvent: (e: KeyboardEvent) => boolean;
  private _isCtrlShiftGEvent: (e: KeyboardEvent) => boolean;
  private _isShiftEvent: (e: KeyboardEvent) => boolean;
  private _isShift1Event: (e: KeyboardEvent) => boolean;
  private _isDeleteEvent: (e: KeyboardEvent) => boolean;
  private _isEscEvent: (e: KeyboardEvent) => boolean;

  get isCtrl(): boolean {
    return this._isCtrl;
  }

  get isOnlyCtrl(): boolean {
    return this._isCtrl && !this._isShift;
  }

  get isCtrlWheel(): boolean {
    return this._isCtrlWheel;
  }

  get isShift(): boolean {
    return this._isShift;
  }

  get isOnlyShift(): boolean {
    return this._isShift && !this._isCtrl;
  }

  constructor(shield: IStageShield) {
    super();
    this.shield = shield;
  }

  init(): void {
    this._isCtrl = false;
    this._isCtrlWheel = false;
    this._isCtrlEvent = isHotkey("ctrl");
    this._isCtrlPlusEvent = isHotkey("ctrl+=");
    this._isCtrlReduceEvent = isHotkey("ctrl+-");
    this._isCtrl0Event = isHotkey("ctrl+0");
    this._isShiftEvent = isHotkey("shift");
    this._isShift1Event = isHotkey("shift+1");
    this._isDeleteEvent = isHotkey("backspace");
    this._isCtrlAEvent = isHotkey("ctrl+a");
    this._isCtrlMEvent = isHotkey("ctrl+m");
    this._isCtrlHEvent = isHotkey("ctrl+h");
    this._isCtrlGEvent = isHotkey("ctrl+g");
    this._isCtrlCEvent = isHotkey("ctrl+c");
    this._isCtrlZEvent = isHotkey("ctrl+z");
    this._isCtrlYEvent = isHotkey("ctrl+y");
    this._isCtrlShiftGEvent = isHotkey("ctrl+shift+g");
    this._isEscEvent = isHotkey("esc");
    this.initEvents();
  }

  /**
   * 初始化事件
   */
  async initEvents(): Promise<void> {
    Promise.all([this.initRenderResizeEvent(), this.initMouseEvents()]);
  }

  /**
   * 判断是否为输入事件
   *
   * @param e
   * @returns
   */
  private _isInputEvent(e: Event): boolean {
    return e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;
  }

  /**
   * 初始化画布容器尺寸变更监听
   */
  async initRenderResizeEvent(): Promise<void> {
    ResizeEvents.addListener(this.shield.renderEl, e => {
      this.emit("resize", e);
    });
  }

  /**
   * 创建图片组件
   *
   * @param imageDataList
   */
  private _createImages(imageDataList: ImageData[]): void {
    if (imageDataList && imageDataList.length) {
      let taskQueue = new TaskQueue();
      imageDataList.forEach((imageData, index) => {
        taskQueue.add(
          new QueueTask(async () => {
            await new Promise(resolve => {
              this.emit("pasteImage", imageData, async () => {
                await TimeUtils.wait(100);
                resolve(true);
              });
            });
            if (index === imageDataList.length - 1) {
              await taskQueue.destroy();
              taskQueue = null;
            }
          }),
        );
      });
    }
  }

  /**
   * 初始化鼠标事件
   */
  async initMouseEvents(): Promise<void> {
    this.shield.node.addEventListener("mousemove", (e: MouseEvent) => {
      this.emit("cursorMove", e);
    });
    this.shield.node.addEventListener("mouseleave", (e: MouseEvent) => {
      this.emit("cursorLeave", e);
    });
    this.shield.node.addEventListener("mousedown", (e: MouseEvent) => {
      this.emit("pressDown", e);
    });
    this.shield.node.addEventListener("mouseup", (e: MouseEvent) => {
      this.emit("pressUp", e);
    });
    this.shield.node.addEventListener("dblclick", (e: MouseEvent) => {
      this.emit("dblClick", e);
    });

    // 滚轮事件
    this.shield.node.addEventListener("wheel", (e: WheelEvent) => {
      EventUtils.stopPP(e);

      // 如果为ctrl+滚轮事件，则缩放，否则移动舞台
      this._isCtrlWheel = this._isCtrl;
      if (this._isCtrlWheel) {
        this.emit("wheelScale", -e.deltaY / 2000, e);
      } else {
        this.emit(
          "wheelMove",
          {
            x: e.deltaX,
            y: e.deltaY,
          },
          e,
        );
      }
    });

    // 拖拽over事件需要阻止默认事件，否则无法触发drop事件
    this.shield.node.addEventListener("dragover", (e: DragEvent) => {
      EventUtils.stopPP(e);
    });

    // 拖拽解析数据
    this.shield.node.addEventListener("drop", (e: DragEvent) => {
      EventUtils.stopPP(e);

      // 解析图片
      FileUtils.getImageDataFromFileTransfer(e)
        .then(imageDataList => {
          this._createImages(imageDataList);
        })
        .catch(e => {
          e && console.warn(e);
        });
    });

    // 键盘事件
    document.addEventListener("keydown", (e: KeyboardEvent) => {
      this._isCtrl = this._isCtrlEvent(e);

      // 非输入操作
      if (!this._isInputEvent(e)) {
        // 放大操作
        if (this._isCtrlPlusEvent(e)) {
          EventUtils.stopPP(e);
          this.emit("scaleIncrease");
        }

        // 缩小操作
        if (this._isCtrlReduceEvent(e)) {
          EventUtils.stopPP(e);
          this.emit("scaleReduce");
        }

        // 还原缩放到100%
        if (this._isCtrl0Event(e)) {
          EventUtils.stopPP(e);
          this.emit("scale100");
        }

        // 舞台自适应操作
        if (this._isShift1Event(e)) {
          EventUtils.stopPP(e);
          this.emit("scaleAutoFit");
        } else if (this._isShiftEvent(e)) {
          this._isShift = true;
        } else {
          this._isShift = false;
        }

        // 监听组件删除操作
        if (this._isDeleteEvent(e)) {
          EventUtils.stopPP(e);
          this.emit("deleteSelects");
        }
        // 监听组件全选操作
        if (this._isCtrlAEvent(e)) {
          EventUtils.stopPP(e);
          this.emit("selectAll");
        }
        // 监听组件移动操作
        if (this._isCtrlMEvent(e)) {
          EventUtils.stopPP(e);
          this.emit("selectMoveable");
        }
        // 监听组件手型操作
        if (this._isCtrlHEvent(e)) {
          EventUtils.stopPP(e);
          this.emit("selectHand");
        }
        // 监听组件组合操作
        if (this._isCtrlGEvent(e)) {
          EventUtils.stopPP(e);
          this.emit("selectGroup");
        }
        // 监听组件复制操作
        if (this._isCtrlCEvent(e)) {
          EventUtils.stopPP(e);
          this.emit("selectCopy", e);
        }
        // 监听撤销操作
        if (this._isCtrlZEvent(e)) {
          EventUtils.stopPP(e);
          this.emit("undo");
        }
        // 监听重做操作
        if (this._isCtrlYEvent(e)) {
          EventUtils.stopPP(e);
          this.emit("redo");
        }
        // 监听组件组合取消操作
        if (this._isCtrlShiftGEvent(e)) {
          EventUtils.stopPP(e);
          this.emit("selectGroupCancel");
        }
        // 监听esc键
        if (this._isEscEvent(e)) {
          EventUtils.stopPP(e);
          this.emit("cancel");
        }
      }
    });

    // 键盘弹起事件监听
    document.addEventListener("keyup", (e: KeyboardEvent) => {
      this._isCtrl = e.ctrlKey;
      this._isShift = e.shiftKey;
    });

    // 粘贴操作
    document.addEventListener("paste", (evt: ClipboardEvent) => {
      if (this._isInputEvent(evt)) {
        return;
      }
      // 解析图片
      FileUtils.getImageDataFromClipboard(evt)
        .then(imageDataList => {
          this._createImages(imageDataList);
        })
        .catch(e => {
          e && console.warn(e);
          // 读取剪贴板，获取组件数组
          try {
            const elementsJson = JSON.parse(evt.clipboardData.getData("text/plain"));
            if (elementsJson) {
              this.emit("pasteElements", elementsJson);
            }
          } catch (e) {
            e && console.warn(e);
          }
        });
    });
  }

  /**
   * 上传图片
   *
   * @param images
   */
  async onImagesUpload(images: File[]): Promise<void> {
    if (images.length) {
      const imageDataList = await FileUtils.getImageDataFromFiles(images);
      this._createImages(imageDataList);
    }
  }
}
