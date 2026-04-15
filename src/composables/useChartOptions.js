import { computed } from 'vue'
import { useChartColors } from './useChartColors'

const MONO_FONT = 'JetBrains Mono, Courier New, monospace'

export function useChartOptions() {
  const { colors } = useChartColors()

  const base = computed(() => {
    const c = colors.value
    return {
      grid: { left: 48, right: 16, top: 16, bottom: 32, containLabel: false },
      textStyle: { fontFamily: MONO_FONT, color: c.foreground },
      axisPointer: {
        lineStyle: { color: c.foreground, opacity: 0.25, type: 'dashed' },
      },
      xAxisBase: {
        type: 'category',
        axisLine: { lineStyle: { color: c.foreground, opacity: 0.2 } },
        axisLabel: {
          fontFamily: MONO_FONT,
          fontSize: 11,
          color: c.foreground,
          opacity: 0.55,
        },
        axisTick: { show: false },
        splitLine: { show: false },
      },
      yAxisBase: {
        type: 'value',
        axisLine: { show: false },
        axisLabel: {
          fontFamily: MONO_FONT,
          fontSize: 11,
          color: c.foreground,
          opacity: 0.55,
        },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: c.foreground, opacity: 0.08 } },
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: c.surface1,
        borderColor: c.border,
        borderWidth: 1,
        borderRadius: 6,
        padding: [8, 12],
        textStyle: {
          fontFamily: MONO_FONT,
          fontSize: 12,
          color: c.foreground,
        },
        extraCssText: 'box-shadow: 0 4px 12px rgba(0,0,0,0.08);',
      },
      tooltipItem: {
        trigger: 'item',
        backgroundColor: c.surface1,
        borderColor: c.border,
        borderWidth: 1,
        borderRadius: 6,
        padding: [8, 12],
        textStyle: {
          fontFamily: MONO_FONT,
          fontSize: 12,
          color: c.foreground,
        },
        extraCssText: 'box-shadow: 0 4px 12px rgba(0,0,0,0.08);',
      },
      lineSeriesDefaults: {
        smooth: true,
        showSymbol: false,
        symbol: 'circle',
        symbolSize: 5,
        lineStyle: { width: 2 },
      },
      barSeriesDefaults: {
        barMaxWidth: 32,
        itemStyle: { borderRadius: [4, 4, 0, 0] },
      },
      pieSeriesDefaults: {
        radius: ['55%', '75%'],
        label: { show: false },
        labelLine: { show: false },
        itemStyle: { borderColor: c.background, borderWidth: 2 },
      },
      gaugeSeriesDefaults: {
        axisLine: { lineStyle: { width: 12 } },
        pointer: { show: false },
        anchor: { show: false },
        title: { show: false },
      },
      palette: [c.chart1, c.chart2, c.chart3, c.chart4, c.chart5],
      areaGradient(color) {
        return {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: color + '55' },
            { offset: 1, color: color + '08' },
          ],
        }
      },
    }
  })

  function lineOption({
    categories = [],
    values = [],
    color,
    sparkline = false,
    areaFill = true,
    yMin,
    yMax,
  } = {}) {
    const b = base.value
    const c = colors.value
    const lineColor = color || c.chart1
    if (sparkline) {
      return {
        grid: { left: 0, right: 0, top: 4, bottom: 0 },
        xAxis: { type: 'category', show: false, data: categories },
        yAxis: { type: 'value', show: false, min: yMin, max: yMax },
        tooltip: b.tooltip,
        series: [
          {
            ...b.lineSeriesDefaults,
            type: 'line',
            data: values,
            lineStyle: { ...b.lineSeriesDefaults.lineStyle, color: lineColor },
            itemStyle: { color: lineColor },
            areaStyle: areaFill ? { color: b.areaGradient(lineColor) } : undefined,
          },
        ],
      }
    }
    return {
      grid: b.grid,
      xAxis: { ...b.xAxisBase, data: categories },
      yAxis: { ...b.yAxisBase, min: yMin, max: yMax },
      tooltip: b.tooltip,
      series: [
        {
          ...b.lineSeriesDefaults,
          type: 'line',
          data: values,
          lineStyle: { ...b.lineSeriesDefaults.lineStyle, color: lineColor },
          itemStyle: { color: lineColor },
          areaStyle: areaFill ? { color: b.areaGradient(lineColor) } : undefined,
        },
      ],
    }
  }

  function barOption({ categories = [], values = [], color } = {}) {
    const b = base.value
    const c = colors.value
    const barColor = color || c.chart1
    return {
      grid: b.grid,
      xAxis: { ...b.xAxisBase, data: categories },
      yAxis: b.yAxisBase,
      tooltip: b.tooltip,
      series: [
        {
          ...b.barSeriesDefaults,
          type: 'bar',
          data: values,
          itemStyle: { ...b.barSeriesDefaults.itemStyle, color: barColor },
        },
      ],
    }
  }

  function pieOption({ data = [] } = {}) {
    const b = base.value
    return {
      tooltip: b.tooltipItem,
      series: [
        {
          ...b.pieSeriesDefaults,
          type: 'pie',
          data,
        },
      ],
    }
  }

  function gaugeOption({ value = 0, min = 0, max = 100, unit = '', thresholds = {} } = {}) {
    const b = base.value
    const c = colors.value
    const warnPct = (thresholds.warning ?? max * 0.7) / max
    const critPct = (thresholds.critical ?? max * 0.9) / max
    return {
      series: [
        {
          ...b.gaugeSeriesDefaults,
          type: 'gauge',
          min,
          max,
          progress: { show: true, width: 12 },
          axisLine: {
            lineStyle: {
              width: 12,
              color: [
                [warnPct, c.chart1],
                [critPct, c.chart4],
                [1, '#ef4444'],
              ],
            },
          },
          axisTick: { show: false },
          splitLine: { show: false },
          axisLabel: { show: false },
          detail: {
            valueAnimation: true,
            fontSize: 22,
            fontFamily: MONO_FONT,
            color: c.foreground,
            offsetCenter: [0, '10%'],
            formatter: `{value} ${unit}`,
          },
          data: [{ value }],
        },
      ],
    }
  }

  return { base, lineOption, barOption, pieOption, gaugeOption }
}
