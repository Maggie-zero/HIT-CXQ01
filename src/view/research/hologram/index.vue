<template>
  <div class="relative h-full w-full">
    <div id="pane" class="absolute top-2 left-2 w-1/5 z-10"></div>
    <div id="cesiumContainer" class="absolute top-0 left-0 w-full h-full"></div>
    <canvas id="colorRamp" class="absolute bottom-10 left-10 h-6 w-32"></canvas>
  </div>
</template>

<script setup lang="ts">
import { Pane } from "tweakpane";
import { panePara } from "./interface";
import { Ion, Viewer } from "cesium";
import * as Cesium from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";

const minHeight = -10000.0;
// const seaLevel = 0.0;
const maxHeight = 2000.0;
const countourLineSpacing = 500.0;

const range = maxHeight - minHeight;
const d = height => (height - minHeight) / range;

Ion.defaultAccessToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiYzIzM2MwNy05OTAzLTQ4NjUtYmFjZC0wOWVjYThjODM5ZDIiLCJpZCI6MTgyNjEyLCJpYXQiOjE3MDE3NzU4OTR9.dRcHqDW6fURu70xEFTdvwBvAN4JU5-RFSrPHzYwt9IA";
const state = reactive({
  viewer: {} as any,
  entity: {} as any,

  pane: {} as any,
  para: {} as any
});

const myAction = async () => {
  const scene = state.viewer.scene;
  const globe = scene.globe;
  const camera = scene.camera;

  scene.verticalExaggeration = 1;
  scene.msaaSamples = 4;
  globe.enableLighting = true;
  globe.maximumScreenSpaceError = 1.0;
  globe.enableLighting = true;
  scene.light = new Cesium.DirectionalLight({
    direction: new Cesium.Cartesian3(1, 0, 0) // Updated every frame
  });
  const cameraMaxHeight = globe.ellipsoid.maximumRadius * 2;
  const scratchNormal = new Cesium.Cartesian3();
  scene.preRender.addEventListener(function(scene, time) {
    const surfaceNormal = globe.ellipsoid.geodeticSurfaceNormal(
      camera.positionWC,
      scratchNormal
    );
    const negativeNormal = Cesium.Cartesian3.negate(
      surfaceNormal,
      surfaceNormal
    );
    scene.light.direction = Cesium.Cartesian3.normalize(
      Cesium.Cartesian3.add(negativeNormal, camera.rightWC, surfaceNormal),
      scene.light.direction
    );

    const zoomMagnitude =
      Cesium.Cartesian3.magnitude(camera.positionWC) / cameraMaxHeight;

    updateGlobeMaterialUniforms(zoomMagnitude);
  });
  updateGlobeMaterial();
};

const updateGlobeMaterial = () => {
  const scene = state.viewer.scene;
  const globe = scene.globe;
  let material;
  if (state.para.lines) {
    if (state.para.ramp) {
      material = getElevationContourMaterial();
      let shadingUniforms = material.materials.elevationRampMaterial.uniforms;
      shadingUniforms.image = getColorRamp();
      shadingUniforms.minimumHeight =
        minHeight * state.viewer.scene.verticalExaggeration;
      shadingUniforms.maximumHeight =
        maxHeight * state.viewer.scene.verticalExaggeration;
      shadingUniforms = material.materials.contourMaterial.uniforms;
      shadingUniforms.width = 1.0;
      shadingUniforms.spacing =
        countourLineSpacing * state.viewer.scene.verticalExaggeration;
      shadingUniforms.color = state.para.iColor
        ? Cesium.Color.WHITE.withAlpha(0.5)
        : Cesium.Color.BLACK.withAlpha(0.5);
      globe.material = material;
      return;
    }

    material = Cesium.Material.fromType("ElevationContour");
    const shadingUniforms = material.uniforms;
    shadingUniforms.width = 1.0;
    shadingUniforms.spacing =
      countourLineSpacing * state.viewer.scene.verticalExaggeration;
    shadingUniforms.color = state.para.iColor
      ? Cesium.Color.WHITE
      : Cesium.Color.BLACK;
    globe.material = material;
    return;
  }

  if (state.para.ramp) {
    material = Cesium.Material.fromType("ElevationRamp");
    const shadingUniforms = material.uniforms;
    shadingUniforms.image = getColorRamp();
    shadingUniforms.minimumHeight =
      minHeight * state.viewer.scene.verticalExaggeration;
    shadingUniforms.maximumHeight =
      maxHeight * state.viewer.scene.verticalExaggeration;
    globe.material = material;
    return;
  }

  globe.material = material;
};
function updateGlobeMaterialUniforms(zoomMagnitude) {
  const material = state.viewer.scene.globe.material;
  if (!Cesium.defined(material)) {
    return;
  }
  const spacing = 5.0 * Math.pow(10, Math.floor(4 * zoomMagnitude));
  if (state.para.lines) {
    const uniforms = state.para.ramp
      ? material.materials.contourMaterial.uniforms
      : material.uniforms;
    uniforms.spacing = spacing * state.viewer.scene.verticalExaggeration;
  }

  if (state.para.ramp) {
    const uniforms = state.para.lines
      ? material.materials.elevationRampMaterial.uniforms
      : material.uniforms;
    uniforms.spacing = spacing * state.viewer.scene.verticalExaggeration;
    uniforms.minimumHeight =
      minHeight * state.viewer.scene.verticalExaggeration;
    uniforms.maximumHeight =
      maxHeight * state.viewer.scene.verticalExaggeration;
  }
}
function getColorRamp() {
  const ramp: any = document.getElementById("colorRamp");
  ramp.width = 100;
  ramp.height = 15;
  const ctx = ramp.getContext("2d");
  const grd = ctx.createLinearGradient(0, 0, 100, 0);

  grd.addColorStop(d(maxHeight), "#B79E6C");
  grd.addColorStop(d(100.0), "#FBFFEE");
  grd.addColorStop(d(0.0), "#F9FCCA");
  grd.addColorStop(d(-500.0), "#BDE7AD");
  grd.addColorStop(d(-1000.0), "#81D2A3");
  grd.addColorStop(d(-1500.0), "#5AB7A4");
  grd.addColorStop(d(-2000.0), "#4C9AA0");
  grd.addColorStop(d(-2500.0), "#437D9A");
  grd.addColorStop(d(-4000.0), "#3E6194");
  grd.addColorStop(d(-5000.0), "#424380");
  grd.addColorStop(d(-8000.0), "#392D52");
  grd.addColorStop(d(minHeight), "#291C2F");

  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, ramp.width, ramp.height);

  return ramp;
}
function getElevationContourMaterial() {
  // Creates a composite material with both elevation shading and contour lines
  return new Cesium.Material({
    fabric: {
      type: "ElevationColorContour",
      materials: {
        contourMaterial: {
          type: "ElevationContour"
        },
        elevationRampMaterial: {
          type: "ElevationRamp"
        }
      },
      components: {
        diffuse:
          "(1.0 - contourMaterial.alpha) * elevationRampMaterial.diffuse + contourMaterial.alpha * contourMaterial.diffuse",
        alpha: "max(contourMaterial.alpha, elevationRampMaterial.alpha)"
      }
    },
    translucent: false
  });
}

// cesium底图初始化
const cesiInit = async () => {
  const initPara = {
    animation: false, //左下动画组件
    baseLayerPicker: false, //底图组件，选择三维数字地球的底图
    fullscreenButton: false, // 全屏组件
    vrButton: false, //VR模式
    geocoder: false, //地理编码搜索组件
    homeButton: false, //回到默认视角
    infoBox: false, //信息框
    sceneModePicker: true, //2d,3d,2.5d
    timeline: false, //时间轴组件
    navigationHelpButton: false, //帮助提示组件
    selectionIndicator: false, //选取指示器组件
    navigationInstructionsInitiallyVisible: false, //导航说明
    mapProjection: new Cesium.WebMercatorProjection()
  };
  const arcGisImagery = Cesium.ArcGisMapServerImageryProvider.fromUrl(
    "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer"
  );
  state.viewer = new Viewer("cesiumContainer", {
    terrainProvider: await Cesium.CesiumTerrainProvider.fromIonAssetId(
      2426648,
      { requestVertexNormals: true }
    ),
    ...initPara,
    baseLayer: Cesium.ImageryLayer.fromProviderAsync(arcGisImagery, {}),
    contextOptions: {
      webgl: {
        // alpha: true,
      }
    }
  });
  state.viewer.scene.skyBox.show = false;
  state.viewer.scene.backgroundColor = new Cesium.Color(0, 0, 0, 0);
  state.viewer.cesiumWidget.creditContainer.style.display = "none";
};
const paneInit = (para: any) => {
  para.forEach((item: any) => {
    state.para[item.name] = item.default;
  });
  state.pane = new Pane({
    container: document.getElementById("pane") as any,
    title: "参数设置",
    expanded: true
  });
  para
    .filter((item: any) => item.type == "binding")
    .forEach((item: any) => {
      state.pane
        .addBinding(state.para, item.name, {
          min: item.min,
          max: item.max,
          label: item.label
        })
        .on("change", (ev: any) => {
          item.func && item.func(state.viewer, ev);
          updateGlobeMaterial();
        });
    });

  const btn = state.pane.addButton({
    title: "确认",
    label: "回到初始" // optional
  });
  btn.on("click", () => {
    para.forEach((item: any) => {
      state.para[item.name] = item.default;
    });
    state.pane.refresh();
  });
};

onMounted(async () => {
  paneInit(panePara);
  await cesiInit();

  nextTick(async () => {
    await myAction();
  });
  // state.viewer.camera.setView({
  //   destination: Cesium.Cartesian3.fromDegrees(126.62801, 45.73676, 17000000),
  // });
});
onBeforeUnmount(() => {
  Object.keys(state).forEach(el => delete state[el]);
});
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
#slider {
  width: 5px;
  height: 100%;
  position: absolute;
  left: 50%;
  background-color: #3370ff;
  z-index: 10;
}
</style>
