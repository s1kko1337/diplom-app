<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <Card>
      <CardHeader>
        <CardTitle class="text-xs">ТЕХНИЧЕСКИЕ ХАРАКТЕРИСТИКИ</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-3">
          <div
            v-for="spec in equipment.specs"
            :key="spec.label"
            class="flex justify-between text-sm"
          >
            <span class="opacity-70">{{ spec.label }}</span>
            <span class="metric-value">{{ spec.value }}</span>
          </div>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle class="text-xs">ИСТОРИЯ ОБСЛУЖИВАНИЯ</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <div
            v-for="item in equipment.serviceHistory"
            :key="item.date"
            class="pb-3 border-b border-border last:border-0"
          >
            <div class="flex justify-between items-start">
              <div>
                <div class="text-sm">{{ item.type }}</div>
                <div class="metric-value text-xs opacity-50 mt-1">{{ item.date }}</div>
              </div>
              <Badge variant="outline">{{ item.status }}</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup>
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

defineProps({
  equipment: { type: Object, required: true },
})
</script>
