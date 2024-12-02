<template>
  <div class="h-full w-full flex flex-col">
    <div class="w-full h-8 flex justify-between">
      <label
        class="menuButton shadow-md bg-gray-200 cursor-pointer mt-1"
        for="upload"
      >
        <span v-if="state.isLoading">加载中...</span>
        <span v-else>本地</span>
        <input
          v-if="!state.isLoading"
          type="file"
          id="upload"
          @change="fileChange"
          class="hidden"
        />
      </label>
      <div class="menuButton shadow-md bg-gray-200 cursor-pointer mt-1">
        系统
      </div>
    </div>

    <div class="h-40 w-full flex-shrink-0 border">
      <canvas
        id="cav"
        class="h-full w-full"
      ></canvas>
    </div>

    <div class="flex m-1 justify-between border-b-2 pb-2">
      <button
        @click="picDraw(state.img)"
        :disabled="state.downable"
        class="menuButton shadow-md bg-gray-200 cursor-pointer disabled:opacity-20"
      >
        原图
      </button>
      <button
        @click="download"
        :disabled="state.downable"
        class="menuButton shadow-md bg-gray-200 m cursor-pointer disabled:opacity-20"
      >
        下载
      </button>
    </div>

    <div class="h-10 flex items-center px-2">
      <div class="w-28 flex-1">
        <el-select
          v-model="state.mission"
          placeholder="Select"
          :fit-input-width="true"
          @change="missionChange"
        >
          <el-option
            v-for="item in algoModel"
            :key="item.id"
            :value="item.value"
            :label="item.label"
          />
        </el-select>
      </div>
    </div>
    <div class="h-10 flex items-center px-2">
      <div class="w-28 flex-1">
        <el-select
          v-model="state.algo"
          placeholder="Select"
          :fit-input-width="true"
          @change="modelChange"
        >
          <el-option
            v-for="item in algoModel[state.mission].model"
            :key="item.value"
            :value="item.value"
            :label="item.label"
          />
        </el-select>
      </div>
    </div>

    <div class="flex justify-between w-full h-10 p-1">
      <button
        @click="detect"
        :disabled="state.downable"
        class="menuButton shadow-md bg-gray-200 cursor-pointer disabled:opacity-20"
      >
        推演
      </button>
      <button
        @click="submit"
        :disabled="state.downable"
        class="menuButton shadow-md bg-gray-200 cursor-pointer disabled:opacity-20"
      >
        识别
      </button>
    </div>

    <div class="w-full h-40 bg-black text-white text-sm flex p-1">
      <span id="typed"></span>
    </div>

    <div class="border rounded-md h-20 mt-2">
      {{ state.result }}
    </div>
  </div>
</template>

<script setup lang="ts">
import * as Tiff from "tiff.js";
import fs from "file-saver";
import { algoModel } from "../interface";
import { fileCheck, TfModel } from "@/utils";
import Typed from "typed.js";

const emit = defineEmits<{
  (e: "load_img", state: any): void;
  // 传递结果1、方法；2分析图，3、结果
  (e: "res_out", mode: any, img: any, res: any): void;
}>();

const state = reactive({
  canvas: {} as any,
  ctx: {} as any,
  downable: true,
  isLoading: false,
  mission: 4,
  algo: 0,
  result: "",

  typed: {} as any,

  img: {} as any,
});
let model = {} as any;

// 后台分析
const submit = async () => {
  const para = "{ 'CF': '" + state.algo + "' }";
  state.canvas.toBlob(
    (blob: any) => {
      let files = new window.File([blob], "dsfasf", { type: "asdfsf" });
      if (files !== null) {
        let _formData = new FormData();
        _formData.append("name", files.name);
        _formData.append("para", para);
        _formData.append("file", files);
      }
    },
    "image/jpeg",
    0.95
  );
};

// 推理
const detect = async () => {
  resetTyped(["推理分析中...."], true);
  const res = await model.detect(state.canvas);
  emit("res_out", state.mission, state.canvas, res);
  resetTyped(["模型推理结束<br>请查看结果"]);
};

//选择数据源得到数据项
const fileChange = async (e: any) => {
  const file = e.target.files[0];
  console.log(file);
  state.isLoading = true;
  if (
    fileCheck(file, 100, [
      "image/png",
      "image/jpeg",
      "image/gif",
      "image/jpg",
      "image/tiff",
    ])[0]
  ) {
    state.isLoading = false;
    return;
  }
  state.img = new Image();
  if (file.type == "image/tiff") {
    const tiff = new Tiff({
      buffer: await file.arrayBuffer(),
    });
    //转成png格式的base64图片，将其用img标签展示即可
    state.img.src = tiff.toDataURL("image/png");
  } else {
    state.img.src = window.URL.createObjectURL(file);
  }
  state.img.onload = function () {
    URL.revokeObjectURL(state.img.src);
    ctxInit(state.img.width, state.img.height);
    emit("load_img", [state.img, file.name]);
    picDraw(state.img);
    state.isLoading = false;
  };
};

const imgBrush = (data: any) => {
  console.log(data);
  state.downable = false;
  state.canvas.width = data.width;
  state.canvas.height = data.height;
  state.ctx.save();
  state.ctx.clearRect(
    0,
    0,
    state.canvas.offsetWidth,
    state.canvas.offsetHeight
  );
  // state.ctx.scale(2, 2);
  state.ctx.putImageData(
    data,
    0,
    0,
    0,
    0,
    data.width,
    data.height
    // state.canvas.offsetWidth / 2,
    // state.canvas.offsetHeight / 2
  );
  state.ctx.scale(2, 2);
  state.ctx.restore();
};

const picDraw = (data: any) => {
  state.downable = false;
  state.canvas.width = data.width;
  state.canvas.height = data.height;
  state.ctx.save();
  state.ctx.clearRect(
    0,
    0,
    state.canvas.offsetWidth,
    state.canvas.offsetHeight
  );
  // state.ctx.scale(2, 2);
  state.ctx.drawImage(
    data,
    0,
    0,
    data.width,
    data.height
    // state.canvas.offsetWidth / 2,
    // state.canvas.offsetHeight / 2
  );
  // state.ctx.scale(2, 2);
  state.ctx.restore();
};

const ctxInit = (width: number, height: number) => {
  state.canvas = document.getElementById("cav");
  state.ctx = state.canvas.getContext("2d");
  state.canvas.width = width;
  state.canvas.height = height;
};

const download = () => {
  state.canvas.toBlob(
    (blob: any) => {
      fs.saveAs(blob, "");
      /* … */
    },
    "image/jpeg",
    0.95
  );
};

const missionChange = async (val: any) => {
  state.algo = algoModel[val].model[0].value;
  model = new TfModel(val);
  resetTyped([state.algo + "模型开始加载。。。"], true);
  const flag = await model.load();
  if (flag) {
    resetTyped([state.algo + "模型加载成功<br>可以开始推演"]);
  } else {
    resetTyped([state.algo + "模型加载失败"]);
  }
};

const modelChange = async (val: any) => {
  model = new TfModel(val);
  await model.load();
};

const resetTyped = (strings, loop = false) => {
  if (state.typed && state.typed.constructor === Typed) {
    state.typed.destroy();
  }
  state.typed = new Typed("#typed", {
    strings: strings,
    typeSpeed: 100,
    loop: loop,
    backSpeed: 60,
    showCursor: false,
  });
};
defineExpose({ imgBrush, resetTyped });
onMounted(async () => {
  missionChange(state.mission);
  nextTick(() => {});
});
onBeforeUnmount(() => {});
</script>

<style scoped lang="scss">
.menuButton {
  width: 3rem;
  height: 1.5rem;
  border-radius: 0.25rem;
  padding: 0.2rem;
  text-align: center;
  font-size: 0.875rem /* 14px */;
  line-height: 1.25rem /* 20px */;
}
</style>
