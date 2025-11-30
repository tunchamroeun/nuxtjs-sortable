<template>
  <div>
    <h1>Draggable Test</h1>
    <ClientOnly>
      <Draggable
        v-model="items"
        item-key="id"
        class="list"
      >
        <template #item="{ element }">
          <div class="item">
            {{ element.name }}
          </div>
        </template>
      </Draggable>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
const items = ref([
  { id: 1, name: 'Item 1' },
  { id: 2, name: 'Item 2' },
  { id: 3, name: 'Item 3' },
])
</script>
