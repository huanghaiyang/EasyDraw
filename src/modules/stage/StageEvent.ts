import IStageEvent from "@/types/IStageEvent";
import IStageShield from "@/types/IStageShield";
import EventUtils from "@/utils/EventUtils";
import ResizeEvents from "@/utils/ResizeEvents";
import { EventEmitter } from 'events';
import isHotkey from "is-hotkey";

export default class StageEvent extends EventEmitter implements IStageEvent {
  shield: IStageShield;

  private _isCtrl: boolean;
  private _isCtrlWheel: boolean;
  private _isCtrlEvent: (e: KeyboardEvent) => boolean;
  private _isCtrlPlusEvent: (e: KeyboardEvent) => boolean;
  private _isCtrlReduceEvent: (e: KeyboardEvent) => boolean;
  private _isCtrl0Event: (e: KeyboardEvent) => boolean;
  private _isShift1Event: (e: KeyboardEvent) => boolean;


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
    this._isCtrlEvent = isHotkey('ctrl');
    this._isCtrlPlusEvent = isHotkey('ctrl+=');
    this._isCtrlReduceEvent = isHotkey('ctrl+-');
    this._isCtrl0Event = isHotkey('ctrl+0');
    this._isShift1Event = isHotkey('shift+1');
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

    document.addEventListener('keydown', e => {
      this._isCtrl = this._isCtrlEvent(e);
      if (this._isCtrlPlusEvent(e)) {
        EventUtils.stopPP(e)
        this.emit('scaleIncrease')
      }
      if (this._isCtrlReduceEvent(e)) {
        EventUtils.stopPP(e)
        this.emit('scaleReduce')
      }
      if (this._isCtrl0Event(e)) {
        EventUtils.stopPP(e)
        this.emit('scale100')
      }
      if (this._isShift1Event(e)) {
        EventUtils.stopPP(e)
        this.emit('scaleAutoFit')
      }
    })
    document.addEventListener('keyup', e => {
      this._isCtrl = false;
    })
  }
}