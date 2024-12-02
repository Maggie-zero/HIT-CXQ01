import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgpu";
import "@tensorflow/tfjs-backend-webgl";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import * as deepLab from "@tensorflow-models/deeplab";
import * as poseDetection from "@tensorflow-models/pose-detection";
import * as bodySegmentation from '@tensorflow-models/body-segmentation';

import { getLabels, getColormap } from '@tensorflow-models/deeplab';
const model = 'ade20k';



class TfModel {
  // 该类实例
  // private static TfModel: TfModel | undefined

  // 模型文件
  private model: any;
  private index: any;

  public label: any;


  public constructor(index: tfModels) {
    try {
      this.index = index
      this.label = modelsInfo[index].label
    } catch (reason) {
      console.log(reason)
    }
  }

  /**
   *  加载模型
   */
  public async load() {
    try {
      this.model = await modelsInfo[this.index].load!()
      return true
    } catch (err) {
      console.log(err);
      return false
    }
  }

  /**
   *  模型推理
   */
  public async detect(obj: any) {
    return await modelsInfo[this.index].detect!(this.model, obj);
  }

  /**
   *  选择功能界面
   */
  public read() {
    console.log(this.model)
  }
}
export enum tfModels {
  Ssd = 0,
  Movenet = 1,
  Deeplab = 2,
  BodySeg = 3,
  Recog = 4,
}

const modelsInfo = [
  {
    id: 0,
    name: "ssd",
    label: "实体识别",
    type: "mobilenet_v2",
    path: "/model/mobilenet_v2/model.json",
    interface: cocoSsd,
    backend: "webgl",
    load: async (): Promise<any> => {
      await tf.setBackend("webgl");
      return await cocoSsd.load({
        base: "mobilenet_v2",
        modelUrl: "./model/mobilenet_v2/mmodel.json",
      });
    },
    detect: async (model: any, obj: any) => {
      return await model.detect(obj)
    }
  },
  {
    id: 1,
    name: "movenet",
    label: "姿态识别",
    path: "/model/movenet/model.json",
    interface: poseDetection,
    backend: "webgl",
    load: async (): Promise<any> => {
      await tf.setBackend("webgpu");
      const detectorConfig = {
        modelType: poseDetection.movenet.modelType.MULTIPOSE_LIGHTNING,
        enableTracking: true,
        trackerType: poseDetection.TrackerType.BoundingBox,
        modelUrl: "./model/movenet/model.json",
      };
      return await poseDetection.createDetector(
        poseDetection.SupportedModels.MoveNet,
        detectorConfig
      );
    },
    detect: async (model: any, obj: any) => {
      return await model.estimatePoses(obj)
    }
  },
  {
    id: 2,
    name: "deeplab",
    label: "语义分割",
    type: "ade20k",
    path: "/model/deeplab/model.json",
    interface: deepLab,
    backend: "webgl",
    load: async (): Promise<any> => {
      // const colormap = getColormap(model);
      // const labels = getLabels(model);
      // console.log(colormap)
      // console.log(labels)
      await tf.setBackend("webgl");
      const quantizationBytes = 2;
      return await deepLab.load({
        base: "ade20k",
        quantizationBytes,
        modelUrl: "./model/deeplab/model.json",
      });
    },
    detect: async (model: any, obj: any) => {
      return await model.segment(obj)
    }
  },
  {
    id: 3,
    name: "bodyseg",
    label: "身体分割",
    type: "general",
    path: "/model/bodyseg/model.json",
    // interface: bodySegmentation,
    backend: "webgl",
    load: async (): Promise<any> => {
      await tf.setBackend("webgl");
      const model = bodySegmentation.SupportedModels.MediaPipeSelfieSegmentation;
      const segmenterConfig: any = {
        runtime: 'tfjs',
        modelUrl: "./model/bodyseg/model.json",
      };
      return await bodySegmentation.createSegmenter(model, segmenterConfig);
    },
    detect: async (model: any, obj: any) => {
      // const segmentationConfig = { flipHorizontal: false };
      return await model.segmentPeople(obj);
    }
  },
  {
    id: 4,
    name: "Recog",
    label: "影像识别",
    type: "xray",
    // path: "/model/bodyseg/model.json",
    // interface: bodySegmentation,
    backend: "webgl",
    load: async (): Promise<any> => {
      console.log("xray")
      return {};
    },
    detect: (model: any, obj: any) => {
      return obj;
    }
  },
]


export { TfModel };