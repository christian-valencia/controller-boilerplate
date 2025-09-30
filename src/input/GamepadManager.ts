export type ButtonName =
  | 'A' | 'B' | 'X' | 'Y'
  | 'LB' | 'RB' | 'LT' | 'RT'
  | 'LS' | 'RS'
  | 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'
  | 'VIEW' | 'MENU' | 'HOME'

type StickName = 'LEFT' | 'RIGHT'

const AXIS = { LS_X: 0, LS_Y: 1, RS_X: 2, RS_Y: 3 } as const
const BUTTON = {
  A: 0, B: 1, X: 2, Y: 3,
  LB: 4, RB: 5, LT: 6, RT: 7,
  VIEW: 8, MENU: 9, LS: 10, RS: 11,
  UP: 12, DOWN: 13, LEFT: 14, RIGHT: 15,
  HOME: 16
} as const

export class GamepadManager {
  private prev: Map<number, Gamepad> = new Map()
  private now: Map<number, Gamepad> = new Map()
  private deadzone = 0.18
  private triggerThreshold = 0.2
  private indexOfFirst: number | null = null

  constructor() {
    window.addEventListener('gamepadconnected', (e) => {
      if (this.indexOfFirst === null) this.indexOfFirst = (e as GamepadEvent).gamepad.index
    })
    window.addEventListener('gamepaddisconnected', (e) => {
      const idx = (e as GamepadEvent).gamepad.index
      if (this.indexOfFirst === idx) this.indexOfFirst = null
    })
  }

  first(): Gamepad | null {
    const pads = navigator.getGamepads()
    for (const g of pads) if (g) return g
    return null
  }

  update() {
    this.prev = new Map(this.now)
    this.now.clear()
    const pads = navigator.getGamepads()
    for (const g of pads) if (g) this.now.set(g.index, g)
  }

  private btnValue(g: Gamepad, name: keyof typeof BUTTON): number {
    const b = g.buttons[BUTTON[name]]
    if (!b) return 0
    // Triggers are analog on XInput
    if (name === 'LT' || name === 'RT') {
      return b.value >= this.triggerThreshold ? b.value : 0
    }
    return b.pressed ? 1 : 0
  }

  isDown(name: ButtonName, padIndex = 0): boolean {
    const g = this.now.get(padIndex); if (!g) return false
    return this.btnValue(g, name as any) > 0
  }
  justPressed(name: ButtonName, padIndex = 0): boolean {
    const gNow = this.now.get(padIndex); const gPrev = this.prev.get(padIndex)
    if (!gNow) return false
    const now = this.btnValue(gNow, name as any) > 0
    const was = gPrev ? this.btnValue(gPrev, name as any) > 0 : false
    return now && !was
  }
  justReleased(name: ButtonName, padIndex = 0): boolean {
    const gNow = this.now.get(padIndex); const gPrev = this.prev.get(padIndex)
    if (!gNow) return false
    const now = this.btnValue(gNow, name as any) > 0
    const was = gPrev ? this.btnValue(gPrev, name as any) > 0 : false
    return !now && was
  }

  getStick(which: StickName, padIndex = 0): {x:number,y:number, magnitude:number} {
    const g = this.now.get(padIndex); if (!g) return {x:0,y:0,magnitude:0}
    const axX = which === 'LEFT' ? AXIS.LS_X : AXIS.RS_X
    const axY = which === 'LEFT' ? AXIS.LS_Y : AXIS.RS_Y
    let x = g.axes[axX] ?? 0
    let y = g.axes[axY] ?? 0
    // Invert Y for screen coords
    y = -y
    const mag = Math.hypot(x,y)
    if (mag < this.deadzone) return {x:0,y:0,magnitude:0}
    // Normalize after removing deadzone
    const norm = (mag - this.deadzone) / (1 - this.deadzone)
    const scale = norm / (mag || 1)
    return { x: x * scale, y: y * scale, magnitude: norm }
  }
}
