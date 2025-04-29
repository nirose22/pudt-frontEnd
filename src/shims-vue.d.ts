declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// 若 TS 提示型別缺失，再加這行即可
declare module 'primevue/drawer';
declare module 'primevue/divider';
declare module 'primevue/rating';
declare module 'primevue/card';
