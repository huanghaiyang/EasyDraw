import IStageEvent from "@/types/IStageEvent";
import IStageShield from "@/types/IStageShield";
import ResizeEvents from "@/utils/ResizeEvents";
import { EventEmitter } from 'events';
import isHotkey from "is-hotkey";

export default class StageEvent extends EventEmitter implements IStageEvent {
  shield: IStageShield;

  private _isCtrl: boolean;
  private _isCtrlWheel: boolean;

  get isCtrl(): boolean {
    return this._isCtrl;
  }

  get isCtrlWheel(): boolean {
    return this._isCtrlWheel;
  }

  constructor(shield: IStageShield) {
    super();
    this.shield = shield;
  }

  init(): void {
    this._isCtrl = false;
    this._isCtrlWheel = false;
    this.initEvents();
  }

  /**
     * 初始化事件
     */
  async initEvents(): Promise<void> {
    Promise.all([
      this.initRenderResizeEvent(),
      this.initMouseEvents()
    ])
  }


  /**
   * 初始化画布容器尺寸变更监听
   */
  async initRenderResizeEvent(): Promise<void> {
    ResizeEvents.addListener(this.shield.renderEl, (e) => {
      this.emit('resize', e)
    })
  }

  /**
   * 初始化鼠标事件
   */
  async initMouseEvents(): Promise<void> {
    this.shield.canvas.addEventListener('mousemove', e => {
      this.emit('cursorMove', e)
    })
    this.shield.canvas.addEventListener('mouseleave', e => {
      this.emit('cursorLeave', e)
    })
    this.shield.canvas.addEventListener('mousedown', e => {
      this.emit('pressDown', e)
    })
    this.shield.canvas.addEventListener('mouseup', e => {
      this.emit('pressUp', e)
    })
    this.shield.canvas.addEventListener('wheel', e => {
      e.preventDefault()
      e.stopPropagation()

      this._isCtrlWheel = this._isCtrl;
      if (this._isCtrlWheel) {
        this.emit('wheelScale', -e.deltaY / 1000, e);
      }
    })

    document.addEventListener('keydown', e =>{
      this._isCtrl = isHotkey('ctrl')(e);
    })
    document.addEventListener('keyup', e =>{
      this._isCtrl = false;
    })
  }
}