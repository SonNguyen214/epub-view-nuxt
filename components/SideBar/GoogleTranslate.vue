<script setup>
import { ref, onMounted, watch } from "vue";
const props = defineProps({
  currentLang: {
    type: String,
    default: "",
  },
});

const changeLanguage = (lang) => {
  if (window.google && window.google.translate) {
    const select = document.querySelector(".goog-te-combo");
    if (select) {
      select.value = lang;
      select.dispatchEvent(new Event("change"));
    }
  }
};

// Watch for language changes
watch(
  () => props.currentLang,
  (newLang) => {
    if (newLang) {
      changeLanguage(newLang);
    }
  }
);

onMounted(() => {
  // if (!document.querySelector('script[src*="translate.google.com"]')) {
  //   const addScript = document.createElement("script");
  //   addScript.setAttribute(
  //     "src",
  //     "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
  //   );
  //   document.body.appendChild(addScript);
  // }
  // window.googleTranslateElementInit = () => {
  //   new window.google.translate.TranslateElement(
  //     {
  //       pageLanguage: props.currentLang,
  //       includedLanguages: "ko,en,zh-CN,ja",
  //       autoDisplay: false,
  //     },
  //     "google_translate_element"
  //   );
  // };
});
</script>

<template>
  <div class="w-full">
    <div id="google_translate_element" class="hidden"></div>
  </div>
</template>

<style>
</style> 
