import { tfModels } from "@/utils"
// pane参数
export const pane_para = [
  {
    name: "invert",
    type: "binding",
    min: 0,
    max: 100,
    label: "色调翻转",
    default: 0,
  },
  {
    name: "blur",
    type: "binding",
    min: 0,
    max: 50,
    label: "模糊度",
    default: 0,
  },
  {
    name: "opacity",
    type: "binding",
    min: 0,
    max: 100,
    label: "透明度",
    default: 0,
  },
  {
    name: "contrast",
    type: "binding",
    min: 0,
    max: 200,
    label: "对比度",
    default: 100,
  },
  {
    name: "grayscale",
    type: "binding",
    min: 0,
    max: 100,
    label: "灰度",
    default: 0,
  },
  {
    name: "sepia",
    type: "binding",
    min: 0,
    max: 100,
    label: "褐度",
    default: 0,
  },
  {
    name: "hue",
    type: "binding",
    min: 0,
    max: 360,
    label: "色相",
    default: 0,
  },
  {
    name: "saturate",
    type: "binding",
    min: 0,
    max: 360,
    label: "饱和度",
    default: 100,
  },
  {
    name: "brightness",
    type: "binding",
    min: 0,
    max: 360,
    label: "明度",
    default: 100,
  },
  {
    name: "rotate",
    type: "binding",
    label: "是否旋转",
    default: false
  },
]

export const d3_para = []

// 算法参数
export const algoModel = [
  {
    id: 0,
    value: tfModels.Ssd,
    type: "ssd",
    label: "实体识别",
    model: [
      {
        value: "mobilenet_v2",
        label: "mobilenet_v2",
      }
    ],
    para: "{ 'CF': 'demo' }",
  },
  {
    id: 1,
    value: tfModels.Movenet,
    type: "movenet",
    label: "姿态识别",
    model: [
      {
        value: "movenet",
        label: "movenet",
      }
    ],
    para: "{ 'CF': 'license' }",
  },
  {
    id: 2,
    value: tfModels.Deeplab,
    type: "deeplab",
    label: "语义分割",
    model: [
      {
        value: "ade20k",
        label: "ade20k",
      }
    ],
  },
  {
    id: 3,
    value: tfModels.BodySeg,
    type: "bodyseg",
    label: "身体分割",
    model: [
      {
        value: "selfie_segmentation",
        label: "selfie_segmentation",
      }
    ],
  },
  {
    id: 4,
    value: tfModels.Recog,
    type: "xray",
    label: "x影像识别",
    model: [
      {
        value: "xray",
        label: "x光影像",
      }
    ],
  },
] as any;

// filter 生成
export const filterGen = (para: any) => {
  return (
    "invert(" +
    para.invert +
    "%) " +
    "contrast(" +
    para.contrast +
    "%) " +
    "opacity(" +
    String(100 - para.opacity) +
    "%) " +
    "grayscale(" +
    para.grayscale +
    "% ) " +
    "sepia(" +
    para.sepia +
    "%) " +
    "hue-rotate(" +
    para.hue +
    "deg) " +
    "blur(" +
    para.blur +
    "px) " +
    "saturate(" +
    para.saturate +
    "%) " +
    "brightness(" +
    para.brightness +
    "%) "
  );
};