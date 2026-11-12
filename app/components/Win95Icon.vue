<script setup lang="ts">
// Hand-drawn pixel icons in the spirit of the 95/98 set. 32×32 grid, crisp edges.
defineProps<{
  name: 'computer' | 'folder' | 'recycle' | 'hourglass' | 'info' | 'warning' | 'lock' | 'document'
  size?: number
}>()
</script>

<template>
  <svg
    :width="size ?? 32"
    :height="size ?? 32"
    viewBox="0 0 32 32"
    shape-rendering="crispEdges"
    aria-hidden="true"
    class="shrink-0"
  >
    <template v-if="name === 'computer'">
      <rect x="4" y="3" width="24" height="18" fill="#c0c0c0" stroke="#000" />
      <rect x="7" y="6" width="18" height="12" fill="#008080" />
      <rect x="7" y="6" width="18" height="1" fill="#000" />
      <rect x="7" y="6" width="1" height="12" fill="#000" />
      <rect x="9" y="8" width="8" height="5" fill="#000080" />
      <rect x="10" y="9" width="6" height="3" fill="#fff" />
      <rect x="12" y="21" width="8" height="3" fill="#808080" stroke="#000" />
      <rect x="2" y="24" width="28" height="5" fill="#c0c0c0" stroke="#000" />
      <rect x="22" y="26" width="5" height="1" fill="#000" />
      <rect x="5" y="26" width="2" height="1" fill="#00c000" />
    </template>

    <template v-else-if="name === 'folder'">
      <path d="M3 8h9l2 2h15v17H3z" fill="#c8a500" stroke="#000" />
      <path d="M3 13h26v14H3z" fill="#ffe96b" stroke="#000" />
      <rect x="4" y="14" width="24" height="1" fill="#fff8c4" />
    </template>

    <template v-else-if="name === 'recycle'">
      <path d="M7 8h18l-2 21H9z" fill="#dfdfdf" stroke="#000" />
      <rect x="5" y="5" width="22" height="4" fill="#c0c0c0" stroke="#000" />
      <path d="M11 11v15M16 11v15M21 11v15" stroke="#808080" />
      <path d="M13 15l3-3 3 3h-2v4h-2v-4z" fill="#008000" />
      <path d="M12 21h3v3h-5zM22 21l-2 3h-3v-3z" fill="#008000" />
    </template>

    <template v-else-if="name === 'hourglass'">
      <rect x="7" y="2" width="18" height="3" fill="#000" />
      <rect x="7" y="27" width="18" height="3" fill="#000" />
      <path d="M9 5h14v5l-5 6 5 6v5H9v-5l5-6-5-6z" fill="#fff" stroke="#000" />
      <path d="M11 8h10l-5 6zM12 25l4-5 4 5z" fill="#000" />
    </template>

    <template v-else-if="name === 'info'">
      <circle cx="16" cy="16" r="13" fill="#fff" stroke="#000" />
      <circle cx="16" cy="16" r="11" fill="#0000c0" />
      <rect x="14" y="8" width="4" height="3" fill="#fff" />
      <rect x="14" y="13" width="4" height="10" fill="#fff" />
      <rect x="12" y="23" width="8" height="2" fill="#fff" />
    </template>

    <template v-else-if="name === 'warning'">
      <path d="M16 3l14 25H2z" fill="#ffe900" stroke="#000" />
      <rect x="15" y="11" width="3" height="9" fill="#000" />
      <rect x="15" y="22" width="3" height="3" fill="#000" />
    </template>

    <template v-else-if="name === 'lock'">
      <path d="M10 14v-4a6 6 0 0 1 12 0v4" fill="none" stroke="#000" stroke-width="3" />
      <path d="M10 14v-4a6 6 0 0 1 12 0v4" fill="none" stroke="#c0c0c0" stroke-width="1" />
      <rect x="6" y="14" width="20" height="15" fill="#e0b000" stroke="#000" />
      <rect x="7" y="15" width="18" height="1" fill="#fff3a0" />
      <rect x="15" y="19" width="2" height="6" fill="#000" />
    </template>

    <template v-else-if="name === 'document'">
      <path d="M7 3h13l6 6v20H7z" fill="#fff" stroke="#000" />
      <path d="M20 3v6h6" fill="#c0c0c0" stroke="#000" />
      <path d="M10 13h12M10 16h12M10 19h12M10 22h8" stroke="#808080" />
    </template>
  </svg>
</template>
