<template>
  <div
    ref="D3Dom"
    id="area"
    class="h-full w-full relative bg-transparent"
  >
    <div class="z-30 absolute top-0 left-0 flex pl-5 pt-1 text-sm">
      {{ state.name }}
    </div>
    <div class="z-30 absolute top-0 right-0 flex p-1">
      <div
        class="text-xs mr-5"
        v-if="state.img.transform"
      >
        放大倍数{{ state.img.transform.k.toFixed(2) }}
      </div>
      <button
        class="mr-1 rounded-md px-1 text-xs border hover:bg-blue-50 shadow-md"
        @click="select"
      >
        框选
      </button>
      <button
        class="mr-1 rounded-md px-1 text-xs border hover:bg-blue-50 shadow-md"
        @click="reset"
      >
        复位
      </button>
      <button
        class="mr-1 rounded-md px-1 text-xs border hover:bg-blue-50 shadow-md"
        @click="axis"
      >
        标尺
      </button>
      <button
        class="mr-1 rounded-md px-1 text-xs border hover:bg-blue-50 shadow-md"
        @click="grid"
      >
        网格
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as d3 from "d3";
import { filterGen } from "../interface";

import { debounce } from "lodash-es";
const props = withDefaults(
  defineProps<{
    para: any;
  }>(),
  {}
);
const emit = defineEmits<{
  (e: "img_load", src: any): void;
  (e: "pic_select", src: any): void;
}>();

const D3Dom = ref();
const state = reactive({
  canvas: {} as any,
  ctx: {} as any,
  img: {} as any,
  name: "",

  Area: {} as any, // d3整体空间
  tab: {} as any, // d3操作空间
  grid: {} as any, // d3网格坐标
  zoom: {} as any, // d3放大缩小
  transform: 1, // d3变化比例
  mini: {} as any,
  filter: "",
});

watch(
  props.para,
  debounce(() => {
    state.filter = filterGen(props.para);
    if (state.img.file) {
      resize();
      imgDraw(state.img.transform, 1, 1);
    }
  }, 200)
);

// 框选
const select = () => {
  if (state.img.file) {
    const brush = d3.brush().on("start brush", brushed);

    function brushed({ selection: [[x0, y0], [x1, y1]] }: any) {
      (x0 = Math.round(x0)), (y0 = Math.round(y0));
      (x1 = Math.round(x1)), (y1 = Math.round(y1));
      const dx = x1 - x0,
        dy = y1 - y0;
      if (x1 > x0 && y1 > y0) {
        const data = state.ctx.getImageData(x0, y0, dx, dy);
        emit("pic_select", data);
      }
    }
    if (state.tab.select("#brush").empty()) {
      state.ctx = state.canvas.node().getContext("2d", {
        willReadFrequently: true,
      });
      state.Area.selectAll(".grid").attr("opacity", 0);
      state.tab
        .style("z-index", 20)
        .append("g")
        .attr("id", "brush")
        .call(brush)
        .call(brush.move, [
          [0, 0],
          [200, 200],
        ]);
    } else {
      resize();
    }
  }
};
// 复位
const reset = () => {
  if (state.img.file) {
    state.img.transform = d3.zoomIdentity;
    state.canvas
      .call(state.zoom.transform, state.img.transform)
      .on("dblclick.zoom", null);
    imgDraw(
      state.img.transform,
      D3Dom.value.offsetWidth / state.img.domWidth,
      D3Dom.value.offsetHeight / state.img.domHeight
    );
  }
};
// 标尺
const axis = () => {
  state.Area.selectAll(".axis").attr(
    "opacity",
    state.Area.select(".axis").style("opacity") == 1 ? 0 : null
  );
};
// 网格
const grid = () => {
  state.Area.selectAll(".grid").attr(
    "opacity",
    state.Area.select(".grid").style("opacity") == 1 ? 0 : null
  );
};
// 重新大小
const resize = () => {
  d3.select("#area").select("canvas").remove();
  d3.select("#area").selectAll("svg").remove();
  nextTick(() => {
    if (D3Dom.value) {
      areaInit(D3Dom.value.offsetWidth, D3Dom.value.offsetHeight);
      gridInit(D3Dom.value.offsetWidth, D3Dom.value.offsetHeight);
      if (state.img.file) {
        imgInit(state.img.file);
      }
    }
  });
};
// 跟踪元素大小
const watchEl = () => {
  if (true) {
    D3Dom.value.style.transition = "width 1s, height 1s";
  }
  const resizeObserver = new ResizeObserver(() => resize());
  resizeObserver.observe(D3Dom.value);
};
// 初始化整体空间
const areaInit = (Width: number, Height: number) => {
  const margin = { top: 30, right: 30, bottom: 30, left: 30 };
  // 整体area建立
  state.Area = d3
    .select("#area")
    .append("svg")
    .attr("viewBox", [0, 0, Width, Height])
    .style("position", "absolute")
    .style("z-index", 0);
  // 初始化坐标轴，网格
  state.grid.gx = state.Area.append("g").attr("class", "axis");
  state.grid.gy = state.Area.append("g").attr("class", "axis");
  state.grid.gGrid = state.Area.append("g").attr("class", "grid");
  // 框选图层
  state.tab = d3
    .select("#area")
    .append("svg")
    .attr("id", "tab")
    .style("position", "absolute")
    .attr("transform", `translate(30,30)`)
    .attr("width", Width - margin.left - margin.right)
    .attr("height", Height - margin.top - margin.bottom);
  // 初始化图片面板
  state.canvas = d3
    .select("#area")
    .append("canvas")
    .attr("width", Width - margin.left - margin.right)
    .attr("height", Height - margin.top - margin.bottom)
    .style("position", "absolute")
    .style("z-index", 10)
    .style("margin-left", margin.left + "px")
    .style("margin-top", margin.top + "px");
  state.ctx = state.canvas.node().getContext("2d", {
    willReadFrequently: false,
  });
};
// 初始化坐标、比例尺
const gridInit = (Width: number, Height: number) => {
  // 参数计算准备
  const k = Height / Width;
  const x = (w: any) => {
    return d3.scaleLinear().domain(w).range([0, Width]);
  };
  const y = (h: any) => {
    return d3.scaleLinear().domain(h).range([0, Height]);
  };
  const xAxis = (g: any, x: any) =>
    g
      .attr("transform", `translate(30,${Height})`)
      .call(d3.axisTop(x).ticks(12))
      .call((g: any) => {
        g.select(".domain").attr("display", "none");
      });
  const yAxis = (g: any, y: any) =>
    g
      .attr("transform", `translate(0,30)`)
      .call(d3.axisRight(y).ticks(12 * k))
      .call((g: any) => g.select(".domain").attr("display", "none"));
  const grid = (g: any, x: any, y: any) =>
    g
      .attr("transform", `translate(30,30)`)
      .attr("stroke", "currentColor")
      .attr("stroke-opacity", 0.1)
      .call((g: any) =>
        g
          .selectAll(".x")
          .data(x.ticks(48))
          .join(
            (enter: any) =>
              enter
                .append("line")
                .attr("class", "x")
                .attr("y2", D3Dom.value.offsetHeight),
            (update: any) => update,
            (exit: any) => exit.remove()
          )
          .attr("x1", (d: any) => 0.5 + x(d))
          .attr("x2", (d: any) => 0.5 + x(d))
      )
      .call((g: any) =>
        g
          .selectAll(".y")
          .data(y.ticks(48 * k))
          .join(
            (enter: any) =>
              enter
                .append("line")
                .attr("class", "y")
                .attr("x2", D3Dom.value.offsetWidth),
            (update: any) => update,
            (exit: any) => exit.remove()
          )
          .attr("y1", (d: any) => 0.5 + y(d))
          .attr("y2", (d: any) => 0.5 + y(d))
      );
  state.zoom = d3
    .zoom()
    .scaleExtent([0.1, 120])
    // .translateExtent([
    //   [-Width * 2, -Height * 2],
    //   [3 * Width, 3 * Height],
    // ])
    .on("zoom", ({ transform }: any) => {
      state.img.transform = { ...transform };
      imgDraw(
        state.img.transform,
        Width / state.img.domWidth,
        Height / state.img.domHeight
      );
      const zx = transform
        .rescaleX(x([0, state.img.lx]))
        .interpolate(d3.interpolateRound);
      const zy = transform
        .rescaleY(y([0, state.img.ly]))
        .interpolate(d3.interpolateRound);
      state.grid.gx.call(xAxis, zx);
      state.grid.gy.call(yAxis, zy);
      state.grid.gGrid.call(grid, zx, zy);
    });
  state.Area.selectAll(".grid").attr("opacity", 0);
};

// canvas 底层画图
const imgDraw = (transform: any, lx: number, ly: number) => {
  state.ctx.save();
  state.ctx.clearRect(0, 0, D3Dom.value.offsetWidth, D3Dom.value.offsetHeight);
  state.ctx.translate(transform.x, transform.y);
  state.ctx.scale(transform.k, transform.k);
  state.ctx.filter = state.filter;
  state.ctx.drawImage(
    state.img.file,
    0,
    0,
    state.img.width * state.img.lk * lx,
    state.img.height * state.img.lk * ly
  );
  state.ctx.restore();
};

// 画图
const imgInit = (file: any) => {
  state.img.file = file;
  const _width = file.width;
  const _height = file.height;
  // 初始化图片信息
  state.img.x = 0;
  state.img.y = 0;
  state.img.transform = d3.zoomIdentity;

  state.img.width = _width;
  state.img.height = _height;
  state.img.domWidth = D3Dom.value.offsetWidth;
  state.img.domHeight = D3Dom.value.offsetHeight;
  // 初始化网格
  // 计算原始比例
  state.img.lx =
    (_width / state.img.domWidth >= _height / state.img.domHeight
      ? _width
      : (state.img.domWidth * _height) / state.img.domHeight) * 1.25;
  state.img.ly =
    (_height / state.img.domHeight >= _width / state.img.domWidth
      ? _height
      : (state.img.domHeight * _width) / state.img.domWidth) * 1.25;
  state.img.lk =
    Math.min(
      D3Dom.value.offsetHeight / state.img.height,
      D3Dom.value.offsetWidth / state.img.width
    ) * 0.8;
  gridInit(D3Dom.value.offsetWidth, D3Dom.value.offsetHeight);
  // 画图
  state.canvas
    .call(state.zoom)
    .call(state.zoom.transform, state.img.transform)
    .on("dblclick.zoom", null);
  imgDraw(state.img.transform, 1, 1);
};

// 加载图片
const loadImg = (img: any) => {
  state.name = img[1];
  imgInit(img[0]);
  // 返回图片的imagedata
  nextTick(() => {
    const data = state.ctx.getImageData(
      0,
      0,
      state.img.width,
      state.img.height
    );
    // emit("pic_select", data);
  });
};

defineExpose({ loadImg });
onMounted(() => {
  areaInit(D3Dom.value.offsetWidth, D3Dom.value.offsetHeight);

  watchEl();
  nextTick(() => {});
});
onBeforeUnmount(() => {});
</script>

<style scoped lang="scss"></style>
