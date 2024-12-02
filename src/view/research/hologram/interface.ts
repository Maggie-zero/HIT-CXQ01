// pane参数
export const panePara = [
  {
    name: "enableLighting",
    type: "binding",
    label: "光线启用",
    default: true,
    func: (val: any, ev: any) => {
      val.scene.globe.enableLighting = ev.value
    }
  },
  {
    name: "enableFog",
    type: "binding",
    label: "迷雾启用",
    default: true,
    func: (val: any, ev: any) => {
      val.scene.fog.enabled = ev.value;
      val.scene.globe.showGroundAtmosphere = ev.value;
      console.log(val)
    }

  },
  {
    name: "verticalExaggeration",
    type: "binding",
    min: 1,
    max: 5,
    label: "高度显度",
    default: 1,
    func: (val: any, ev: any) => {
      val.scene.verticalExaggeration = ev.value;
    }
  },
  {
    name: "ramp",
    type: "binding",
    label: "色块显示",
    default: false
  },
  {
    name: "lines",
    type: "binding",
    label: "等高线",
    default: false
  },
  {
    name: "iColor",
    type: "binding",
    label: "线颜色",
    default: false
  },
]
