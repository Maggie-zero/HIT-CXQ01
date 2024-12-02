import Layout from '@/layout/index.vue'

export default [
  // 单独示例
  {
    path: '/home',
    component: Layout,
    name: 'home',
    meta: {
      level: 0,
      isSideBar: false, //
      isSingle: true,
      type: "Production",
      title: '主页',
      icon: 'Iphone'
    },
    redirect: { path: '/document1' },
    children: [
      {
        path: '/document1',
        component: () => import('@/view/product/time_calib/index.vue')
      },
    ]
  },
  // 生产模式示例
  {
    path: '/img',
    component: Layout,
    name: 'img',
    meta: {
      level: 0,
      type: "Production",
      isSideBar: true,
      title: '图像分析',
      icon: 'Iphone'
    },
    redirect: { path: '/imgProcess' },
    children: [
      {
        path: '/imgProcess',
        meta: {
          level: 1,
          title: '图像处理',
          icon: 'stopwatch'
        },
        component: () => import('@/view/product/imgProcess/index.vue')
      },
      {
        path: '/home2',
        meta: {
          level: 1,
          title: '监控',
          icon: 'stopwatch'
        },
        component: () => import('@/view/sys_common/intro.vue')
      },
    ]
  },
  // 科研模式示例
  {
    path: '/geo',
    component: Layout,
    name: 'hologram',
    meta: {
      level: 0,
      type: "Research",
      isSideBar: true,
      title: '地图系统',
      icon: 'Iphone'
    },
    redirect: { path: '/hologram' },
    children: [
      {
        path: '/hologram',
        meta: {
          level: 1,
          title: '地理演示',
          icon: 'stopwatch'
        },
        component: () => import('@/view/research/hologram/index.vue')
      },
    ]
  },
  // 战略模式示例
  {
    path: '/stre',
    component: Layout,
    name: 'stre',
    meta: {
      level: 0,
      type: "Strategy",
      isSideBar: true,
      title: '行为',
      icon: 'Iphone'
    },
    redirect: { path: '/stre1' },
    children: [
      {
        path: '/stre1',
        meta: {
          level: 1,
          title: '演示',
          icon: 'stopwatch'
        },
        component: () => import('@/view/strategy/op_record/index.vue')
      },
    ]
  },
]

export const my_route = []

