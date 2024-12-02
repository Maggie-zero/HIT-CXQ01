<template>
  <div class="h-full w-full p-4 flex overflow-hidden bg-white">
    <div class="h-full w-full flex flex-col flex-1 shadow-lg border">
      <div class="min-h-[200px] h-2/3 border-b-2 resize-y overflow-auto">
        <component
          :is="MainPic"
          ref="picMain"
          :para="state.para"
          @pic_select="pic_brush"
        />
      </div>
      <div class="min-h-[200px] flex-1">
        <component
          :is="ResPic"
          ref="picRes"
        />
      </div>
    </div>

    <div class="h-full w-1/6 ml-4 relative flex-col justify-between">
      <div class="h-full w-full flex flex-col">
        <div class="h-[5%] w-full">
          <div class="border-b-2 w-full h-full text-lg text-center pt-2">
            参数设置
          </div>
        </div>
        <!-- 专属面板 -->
        <div class="w-full h-full flex-1">
          <component
            :is="CanPic"
            ref="picCtrl"
            @load_img="load_img"
            @res_out="load_res"
          />
        </div>
      </div>
      <!-- 标头 -->
      <canvas
        class="hidden"
        id="trans"
      ></canvas>
      <canvas
        class="hidden"
        id="img"
      ></canvas>
      <!-- 参数设定 -->
      <div class="w-full min-h-min z-10 absolute right-0 bottom-0 pb-1">
        <div
          id="pane"
          class="w-full h-auto shadow-lg"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Pane } from "tweakpane";
import { pane_para, algoModel } from "./interface";
import { MainPic, CanPic, ResPic } from "./com";
import * as bodySegmentation from "@tensorflow-models/body-segmentation";
import { Unit8 } from "@/utils";

const picMain = ref();
const picCtrl = ref();
const picRes = ref();
const state = reactive({
  para: {} as any,
  pane: {} as any,
});

const load_img = (img: any) => {
  picMain.value.loadImg(img);
  picRes.value.removeRes();
};

const pic_brush = (img: any) => {
  picCtrl.value.imgBrush(img);
};

const load_res = (mode: any, img: any, res: any) => {
  // 生成操作canvas
  const canvas: any = document.getElementById("trans");
  // 选择处理方法
  const type = algoModel[mode].type;
  // 格式处理生成结果图像
  trans_res[type](canvas, img, res, picRes.value.loadRes);
  // picCtrl.value.resetTyped(disp);
};

const trans_res = {
  ssd: (canvas: any, img: any, res: any, func: any) => {
    const ctx = canvas.getContext("2d");
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    ctx.strokeStyle = "#a1e42d";
    ctx.fillStyle = "#a1e42d";
    if (res.length > 0) {
      res.forEach((prodiction: any) => {
        let innerText =
          prodiction.class +
          " - with " +
          Math.round(parseFloat(prodiction.score) * 100) +
          "% confidence.";
        ctx.font = "30px Arial";
        ctx.fillText(innerText, prodiction.bbox[0], prodiction.bbox[1]);
        ctx.lineWidth = 6;
        ctx.strokeRect(
          prodiction.bbox[0],
          prodiction.bbox[1],
          prodiction.bbox[2],
          prodiction.bbox[3]
        );
      });
    }
    const image = new Image();
    image.src = canvas.toDataURL();
    image.onload = function () {
      func(image);
    };
  },
  movenet: (canvas: any, img: any, res: any, func: any) => {
    const ctx = canvas.getContext("2d");
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    ctx.strokeStyle = "#a1e42d";
    ctx.fillStyle = "#a1e42d";
    if (res.length > 0) {
      res.forEach((prodiction: any) => {
        console.log(prodiction);
        prodiction.keypoints.forEach((point: any) => {
          // drawPoint(state.ctx, point, true, true)
          ctx.beginPath();
          ctx.arc(point.x, point.y, 10, 0, 2 * Math.PI);
          ctx.fill();
        });
      });
    }
    const image = new Image();
    image.src = canvas.toDataURL();
    image.onload = function () {
      func(image);
    };
  },
  deeplab: (canvas: any, _: any, res: any, func: any) => {
    console.log(res);
    const ctx = canvas.getContext("2d");
    canvas.width = res.width;
    canvas.height = res.height;
    const imgData = new ImageData(res.segmentationMap, res.width, res.height);
    const cx = new Unit8(imgData);
    const ratio = cx.calcuRatio();
    console.log(ratio);
    ctx.putImageData(imgData, 0, 0);
    const image = new Image();
    image.src = canvas.toDataURL();
    image.onload = function () {
      func(image);
    };
  },
  bodyseg: async (canvas: any, img: any, res: any, func: any) => {
    const img_cav: any = document.getElementById("img");
    const ctx2 = img_cav.getContext("2d");
    img_cav.width = img.width;
    img_cav.height = img.height;
    ctx2.drawImage(img, 0, 0);
    canvas.width = img.width;
    canvas.height = img.height;
    console.log(img.offsetWidth, img.offsetHeight);
    const coloredPartImage = await bodySegmentation.toBinaryMask(res);
    const opacity = 0.7;
    const flipHorizontal = false;
    const maskBlurAmount = 0;
    bodySegmentation.drawMask(
      canvas,
      img_cav,
      coloredPartImage,
      opacity,
      maskBlurAmount,
      flipHorizontal
    );
    const image = new Image();
    image.src = canvas.toDataURL();
    image.onload = function () {
      func(image);
    };
    console.log(res);
  },
  xray: (canvas: any, img: any, _: any, func: any) => {
    const ctx = canvas.getContext("2d");
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    let imageData = ctx.getImageData(0, 0, img.width, img.height);
    ctx.clearRect(0, 0, img.width, img.height);
    for (let i = 0; i < imageData.data.length; i = i + 4) {
      const Gray =
        imageData.data[i] * 77 +
        imageData.data[i + 1] * 151 +
        imageData.data[i + 2] * 28;
      if (Gray > 0 && Gray < 6600) {
        imageData.data[i] = 0;
        imageData.data[i + 1] = 255;
        imageData.data[i + 2] = 255;
      } else if (Gray >= 6600) {
        imageData.data[i] = 77;
        imageData.data[i + 1] = 151;
        imageData.data[i + 2] = 28;
      }
    }
    const cx = new Unit8(imageData);
    const ratio = cx.calcuExceptRatio(["0,0,0"]);
    console.log(ratio);
    ctx.putImageData(imageData, 0, 0);

    const image = new Image();
    image.src = canvas.toDataURL();
    image.onload = function () {
      func(image);
    };
    return ["模型推理结束<br>请查看结果<br>" + JSON.stringify(ratio)];
  },
};

const paneInit = (para: any) => {
  para.forEach((item: any) => {
    state.para[item.name] = item.default;
  });
  state.pane = new Pane({
    container: document.getElementById("pane") as any,
    title: "参数设置",
    expanded: false,
  });
  para
    .filter((item: any) => item.type == "binding")
    .forEach((item: any) => {
      state.pane.addBinding(state.para, item.name, {
        min: item.min,
        max: item.max,
        label: item.label,
      });
      // .on("change", (ev: any) => {});
    });

  const btn = state.pane.addButton({
    title: "确认",
    label: "回到初始", // optional
  });
  btn.on("click", () => {
    para.forEach((item: any) => {
      state.para[item.name] = item.default;
    });
    state.pane.refresh();
  });
};

onMounted(() => {
  paneInit(pane_para);
  nextTick(() => {});
});
onBeforeUnmount(() => {});
</script>

<style scoped lang="scss">
:deep(#pane) {
  .tp-lblv_l {
    padding: 0px;
  }
  .tp-lblv_v {
    width: 70%;
    // display: none;
  }
}
</style>
