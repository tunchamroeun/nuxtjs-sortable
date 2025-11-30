<template>
  <div>
    <h1>Two Lists Test</h1>
    <div class="lists-container">
      <ClientOnly>
        <div class="list-wrapper">
          <h2>List A</h2>
          <Draggable
            v-model="listA"
            item-key="id"
            group="shared"
            class="list list-a"
          >
            <template #item="{ element }">
              <div class="item item-a">
                {{ element.name }}
              </div>
            </template>
          </Draggable>
        </div>

        <div class="list-wrapper">
          <h2>List B</h2>
          <Draggable
            v-model="listB"
            item-key="id"
            group="shared"
            class="list list-b"
          >
            <template #item="{ element }">
              <div class="item item-b">
                {{ element.name }}
              </div>
            </template>
          </Draggable>
        </div>
      </ClientOnly>
    </div>
  </div>
</template>

<script setup lang="ts">
const listA = ref([
  { id: 1, name: 'A1' },
  { id: 2, name: 'A2' },
  { id: 3, name: 'A3' },
])

const listB = ref([
  { id: 4, name: 'B1' },
  { id: 5, name: 'B2' },
  { id: 6, name: 'B3' },
])
</script>
