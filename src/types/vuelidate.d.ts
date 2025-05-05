declare module '@vuelidate/core' {
  import { Ref } from 'vue';
  // 將所有內容視為 any，僅供編譯通過；建議日後安裝官方型別或完善宣告
  const useVuelidate: (...args: any[]) => Ref<any>;
  export { useVuelidate };
  export default useVuelidate;
}

declare module '@vuelidate/validators' {
  // 匯出常用驗證器，暫用 any
  const required: any;
  const email: any;
  const minLength: (len: number) => any;
  const helpers: any;
  export { required, email, minLength, helpers };
  export default {
    required,
    email,
    minLength,
    helpers
  };
} 