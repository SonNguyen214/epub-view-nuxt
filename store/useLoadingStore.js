export const useLoadingStore = defineStore("loadingStore", () => {
  // 🌟 State variables
  const loading = ref(false);

  // 🌟 Set total score
  const setLoading = (bol) => {
    loading.value = Boolean(bol);
  };

  return {
    loading,
    setLoading,
  };
});
