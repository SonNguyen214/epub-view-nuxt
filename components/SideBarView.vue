<script setup>
// Props
const props = defineProps({
  rendition: {
    type: Object,
    default: null,
  },
  currentBookId: String,
  bookEpub: Object,
  bookmarks: Object,
});

// Emit events
const emit = defineEmits([
  "handleUpload",
  "home",
  "index",
  "notes",
  "gotoFirstPage",
  "gotoBookmark",
  "removeBookmark",
]);

import UploadFile from "./SideBar/UploadFile.vue";
import GoogleTranslate from "./SideBar/GoogleTranslate.vue";
import ViewMode from "./SideBar/ViewMode.vue";
import FontSizeControl from "./SideBar/FontSizeControl.vue";
import LineSpacingControl from "./SideBar/LineHeightControl.vue";
import NotesList from "./SideBar/NotesList.vue";
import { useGlobalStore } from "~/store/useGlobalStore.js";

// State
const isExpanded = ref(false);
const currentLang = ref("ko");
const toc = ref([]);
const globalStore = useGlobalStore();
const notes = ref([]);

// Load notes from localStorage
const loadNotes = () => {
  if (props.currentBookId) {
    const savedAnnotations = JSON.parse(
      localStorage.getItem("epubAnnotations") || "{}"
    );
    const bookAnnotations = savedAnnotations[props.currentBookId];
    if (bookAnnotations && bookAnnotations.notes) {
      notes.value = bookAnnotations.notes;
    }
  }
};

watch(isExpanded, (newVal) => {
  if (newVal) {
    loadNotes();
  }
});

// Watch for bookId changes to reload notes
watch(
  () => props.currentBookId,
  () => {
    loadNotes();
  },
  { immediate: true }
);

// Watch for changes and apply them directly
watch(
  () => globalStore.fontSize,
  (newValue) => {
    if (props.rendition) {
      props.rendition.themes.fontSize(`${newValue}px`);
    }
  },
  { immediate: true }
);

watch(
  () => globalStore.lineSpacing,
  (newValue) => {
    if (props.rendition) {
      props.rendition.themes.override("line-height", `${newValue}rem`);
    }
  },
  { immediate: true }
);

// Set initial language on component mount
onMounted(() => {
  currentLang.value = getBrowserLanguage();
});

//Update toc when book change
watchEffect(() => {
  if (props.bookEpub) {
    props.bookEpub.loaded.navigation.then((navigation) => {
      toc.value = navigation.toc;
    });
  }
});

// Get browser language and convert to Google Translate format
const getBrowserLanguage = () => {
  const browserLang = navigator.language || navigator.userLanguage;
  // Convert browser language code to Google Translate format
  const langMap = {
    ko: "ko",
    "ko-KR": "ko",
    en: "en",
    "en-US": "en",
    "en-GB": "en",
    ja: "ja",
    "ja-JP": "ja",
    zh: "zh-CN",
    "zh-CN": "zh-CN",
    "zh-TW": "zh-TW",
    "zh-HK": "zh-TW",
  };
  return langMap[browserLang] || "en"; // Default to English if language not supported
};

// Menu items array
const menuItems = [
  {
    icon: "pi pi-upload",
    label: "파일 업로드",
    action: "upload",
  },
  {
    icon: "pi pi-home",
    label: "첫 페이지로 이동",
    action: "home",
  },
  {
    icon: "pi pi-list",
    label: "목차",
    action: "index",
  },
  {
    icon: "pi pi-bookmark",
    label: "북마크",
    action: "bookmarks",
  },
  {
    icon: "pi pi-pencil",
    label: "노트",
    action: "notes",
  },
  {
    icon: "pi pi-globe",
    label: "언어",
    action: "translate",
  },
  {
    icon: "pi pi-book",
    label: "보기 모드",
    action: "viewMode",
  },
  {
    icon: "pi pi-search",
    label: "노트",
    action: "fontSize",
  },
  {
    icon: "pi pi-arrows-v",
    label: "노트",
    action: "lineSpacing",
  },
];

// Handle click events
const handleClick = (action, lang) => {
  if (action === "translate" && lang) {
    if (currentLang.value !== lang) {
      currentLang.value = lang;
    }
  } else if (action !== "upload") {
    emit(action);
  }
};

// Handle file upload
const handleFileUpload = (event) => {
  emit("handleUpload", event);
};

const handleTocClick = async (href) => {
  try {
    if (props.rendition) {
      await props.rendition.display(href);
    }
  } catch (e) {
    alert("클릭한 목차의 페이지가 존재하지 않습니다.");
    console.error(e);
  }
};

const handleNoteClick = async (note) => {
  try {
    if (props.rendition) {
      await props.rendition.display(note.cfi);
    }
  } catch (e) {
    alert("클릭한 노트의 페이지가 존재하지 않습니다.");
    console.error(e);
  }
};

const remove = (event, percentage) => {
  event.stopPropagation();
  emit("removeBookmark", percentage, props.currentBookId);
};
</script>

<template>
  <div class="sidebar">
    <aside
      :class="['wrapper', isExpanded ? 'w-64' : 'w-16']"
      @mouseenter="isExpanded = true"
      @mouseleave="isExpanded = false"
    >
      <i
        class="pi pi-times w-full text-sidebar-foreground p-5 border-b border-sidebar-border"
        :class="{ 'pi-bars': !isExpanded }"
      ></i>
      <nav class="!h-[calc(100dvh-80px)] overflow-auto">
        <ul>
          <li v-for="(item, index) in menuItems" :key="index">
            <template v-if="item.action === 'upload'">
              <div class="items">
                <div class="content">
                  <i :class="item.icon" style="font-size: 1vw"></i>
                  <span
                    :class="[
                      'text ',
                      isExpanded ? 'opacity-100' : 'opacity-0 w-0',
                    ]"
                    style="font-size: 0.8vw"
                  >
                    {{ item.label }}
                  </span>
                </div>
                <UploadFile @handelUpload="handleFileUpload" />
              </div>
            </template>
            <template v-else-if="item.action === 'translate'">
              <div class="items">
                <div class="content">
                  <i :class="item.icon" style="font-size: 1vw"></i>
                  <div
                    v-if="isExpanded"
                    class="flex gap-2 ml-5 whitespace-nowrap overflow-hidden"
                  >
                    <div
                      v-for="(lang, index) in ['ko', 'en', 'ja', 'zh-CN']"
                      :key="index"
                      @click.stop="handleClick(item.action, lang)"
                      :class="[
                        'text-[0.8vw] cursor-pointer transition-colors notranslate truncate',
                        currentLang === lang
                          ? 'text-[#9FCDEE]'
                          : 'hover:text-gray-300',
                      ]"
                    >
                      {{
                        lang === "ko"
                          ? "한국어"
                          : lang === "en"
                          ? "English"
                          : lang === "ja"
                          ? "日本語"
                          : "中文"
                      }}
                    </div>
                  </div>
                </div>
                <GoogleTranslate :current-lang="currentLang" />
              </div>
            </template>
            <template v-else-if="item.action === 'viewMode'">
              <div class="items">
                <div class="content">
                  <i :class="item.icon" style="font-size: 1vw"></i>
                  <div
                    v-if="isExpanded"
                    class="flex gap-2 ml-5 whitespace-nowrap overflow-hidden"
                  >
                    <ViewMode
                      :rendition="rendition"
                      @gotoFirstPage="$emit('gotoFirstPage')"
                    />
                  </div>
                </div>
              </div>
            </template>
            <template v-else-if="item.action === 'fontSize'">
              <div class="items">
                <div class="content">
                  <i :class="item.icon" style="font-size: 1vw"></i>
                  <div
                    v-if="isExpanded"
                    class="flex gap-2 ml-5 whitespace-nowrap overflow-hidden"
                  >
                    <FontSizeControl
                      :rendition="rendition"
                      :book-id="currentBookId"
                    />
                  </div>
                </div>
              </div>
            </template>
            <template v-else-if="item.action === 'lineSpacing'">
              <div class="items">
                <div class="content">
                  <i :class="item.icon" style="font-size: 1vw"></i>
                  <div
                    v-if="isExpanded"
                    class="flex gap-2 ml-5 whitespace-nowrap overflow-hidden"
                  >
                    <LineSpacingControl
                      :rendition="rendition"
                      :book-id="currentBookId"
                    />
                  </div>
                </div>
              </div>
            </template>
            <template v-else-if="item.action === 'notes'">
              <Button
                class="items"
                :title="item.label"
                text
                severity="secondary"
                :pt="{
                  root: {
                    class: 'focus:outline-none',
                  },
                }"
              >
                <div class="content">
                  <i :class="item.icon" style="font-size: 1vw"></i>
                  <span
                    :class="[
                      'text !ml-3',
                      isExpanded ? 'opacity-100' : 'opacity-0 w-0',
                    ]"
                    style="font-size: 0.8vw"
                  >
                    {{ item.label }}
                  </span>
                </div>

                <NotesList
                  :notes="notes"
                  :is-expanded="isExpanded"
                  :rendition="rendition"
                  :current-book-id="currentBookId"
                  @note-click="handleNoteClick"
                  @note-deleted="loadNotes"
                />
              </Button>
            </template>
            <Button
              v-else
              class="items"
              :title="item.label"
              @click="handleClick(item.action)"
              text
              severity="secondary"
              :pt="{
                root: {
                  class: 'focus:outline-none',
                },
              }"
            >
              <div
                class="content"
                @click="
                  item.action === 'home' ? $emit('gotoFirstPage') : () => {}
                "
              >
                <i :class="item.icon" style="font-size: 1vw"></i>
                <span
                  :class="[
                    'text !ml-3',
                    isExpanded ? 'opacity-100' : 'opacity-0 w-0',
                  ]"
                  style="font-size: 0.8vw"
                >
                  {{ item.label }}
                </span>
              </div>

              <div
                v-if="bookmarks && item.action === 'bookmarks'"
                class="sub-content grid grid-cols-2 gap-4"
                :class="[isExpanded ? 'opacity-100' : 'opacity-0 w-0 hidden']"
              >
                <div
                  v-for="bookmark in bookmarks[currentBookId]"
                  :key="bookmark.percentage"
                  @click="
                    $emit(
                      'gotoBookmark',
                      bookmark.percentage,
                      rendition,
                      currentBookId
                    )
                  "
                >
                  <Chip
                    :label="bookmark.date"
                    removable
                    class="py-1 px-2 text-sm"
                    @remove="(event) => remove(event, bookmark.percentage)"
                  ></Chip>
                </div>
              </div>

              <div
                className="w-full pl-10 text-start "
                v-if="bookEpub && rendition && item.action === 'index'"
                :class="[
                  isExpanded
                    ? 'opacity-100  !max-h-[200px] overflow-auto'
                    : 'opacity-0 hidden',
                ]"
              >
                <ul
                  className="text-[#c9c6c6]  flex flex-col gap-1"
                  :class="[
                    isExpanded ? 'opacity-100' : 'opacity-0 w-0 hidden h-0',
                  ]"
                >
                  <li v-for="item in toc" :key="item.id" class="!text-sm">
                    <button
                      class="hover:scale-[1.02]"
                      @click="handleTocClick(item.href)"
                    >
                      {{ item.label }}
                    </button>
                    <ul className="!text-xs flex flex-col gap-2 mt-1">
                      <li
                        v-for="subitem in item?.subitems"
                        :key="subitem.id"
                        className=""
                      >
                        <button
                          className="hover:scale-[1.02] "
                          @click="handleTocClick(subitem.href)"
                        >
                          {{ subitem.label }}
                        </button>
                      </li>
                    </ul>
                  </li>
                </ul>
              </div>
            </Button>
          </li>
        </ul>
      </nav>
    </aside>

    <!-- Add space on the left -->
    <div :class="['w-16 flex-shrink-0']"></div>
  </div>
</template>

<style scoped>
.text-sidebar-foreground {
  @apply text-white;
}

.border-sidebar-border {
  @apply border-gray-700;
}

.hover\:bg-sidebar-accent:hover {
  @apply bg-gray-700;
}
</style>
