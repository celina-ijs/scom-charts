import { BigNumber } from '@ijstech/eth-wallet';
import { FormatUtils } from "@ijstech/components";
import { ModeType } from '@scom/scom-chart-data-source-setup';

export const isNumeric = (value: string | number | BigNumber): boolean => {
  if (value instanceof BigNumber) {
    return !value.isNaN() && value.isFinite();
  }
  if (typeof value === 'string') {
    const parsed = new BigNumber(value);
    return !parsed.isNaN() && parsed.isFinite();
  }
  return !isNaN(value) && isFinite(value);
}

export const formatNumber = (num: number, options?: { format?: string, decimals?: number, percentValues?: boolean }) => {
  if (num === null) return '-';
  const { decimals, format, percentValues } = options || {};
  if (percentValues) {
    return `${FormatUtils.formatNumber(num, { decimalFigures: 2 })}%`;
  }
  if (format) {
    return formatNumberByFormat(num, format);
  }
  const absNum = Math.abs(num);
  if (absNum >= 1000) {
    return FormatUtils.formatNumber(num, { decimalFigures: decimals, shortScale: true });
  }
  if (absNum < 0.0000001) {
    return FormatUtils.formatNumber(num, { decimalFigures: 0 });
  }
  if (absNum < 0.00001) {
    return FormatUtils.formatNumber(num, { decimalFigures: 6 });
  }
  if (absNum < 1) {
    return FormatUtils.formatNumber(num, { decimalFigures: 4 });
  }
  return FormatUtils.formatNumber(num, { decimalFigures: 2 });
}

export const formatNumberByFormat = (num: number, format: string, separators?: boolean) => {
  if (!format) return FormatUtils.formatNumber(num, { decimalFigures: 0 });
  const decimalFigures = format.split('.')[1] ? format.split('.')[1].length : 0;
  if (format.includes('%')) {
    return FormatUtils.formatNumber((num * 100), { decimalFigures }) + '%';
  }
  const currencySymbol = format.indexOf('$') !== -1 ? '$' : '';
  const roundedNum = FormatUtils.formatNumber(num, { decimalFigures });
  if (separators || !(format.includes('m') || format.includes('a'))) {
    return format.indexOf('$') === 0 ? `${currencySymbol}${roundedNum}` : `${roundedNum}${currencySymbol}`;
  }
  const parts = roundedNum.split('.');
  const decimalPart = parts.length > 1 ? parts[1] : '';
  const integerPart = formatNumber(parseInt(parts[0].replace(/,/g, '')), { decimals: decimalPart.length });
  return `${currencySymbol}${integerPart}`;
}

export const groupArrayByKey = (arr: [Date | string, string | number][], isMerged?: boolean) => {
  if (!isMerged) return arr;
  const groups = new Map<string, number | string>();
  for (const [key, value] of arr) {
    const strKey = key instanceof Date ? key.getTime().toString() : key.toString();
    const existingValue = groups.get(strKey);
    if (existingValue !== undefined) {
      if (typeof existingValue === 'number' && typeof value === 'number') {
        groups.set(strKey, existingValue + value);
      } else {
        groups.set(strKey, value);
      }
    } else {
      groups.set(strKey, value);
    }
  }
  return Array.from(groups.entries()).map(([key, value]) => {
    const parsedKey = isNaN(Number(key)) ? key : new Date(Number(key));
    return [parsedKey, value];
  });
}

export const groupByCategory = (data: { [key: string]: any }[], category: string, xAxis: string, yAxis: string) => {
  return data.reduce((result, item) => {
    const _category = item[category];
    if (!result[_category]) {
      result[_category] = {};
    }
    result[_category][item[xAxis]] = item[yAxis];
    return result;
  }, {});
}

export const extractUniqueTimes = (data: { [key: string]: any }[], keyValue: string) => {
  return data.reduce((acc, cur) => {
    if (!acc.hasOwnProperty(cur[keyValue])) {
      acc[cur[keyValue]] = null;
    }
    return acc;
  }, {});
}

export const concatUnique = (obj1: { [key: string]: any }, obj2: { [key: string]: any }) => {
  const merged = { ...obj1, ...obj2 };
  return Object.keys(merged).reduce((acc, key) => {
    if (!acc.hasOwnProperty(key)) {
      acc[key] = merged[key];
    }
    return acc;
  }, {});
}

export const ChartTypes = ['scom-pie-chart', 'scom-line-chart', 'scom-bar-chart', 'scom-area-chart', 'scom-mixed-chart', 'scom-scatter-chart', 'scom-counter'];

export const DEFAULT_CHART_TYPE = 'scom-line-chart';

export const DefaultData = {
  name: DEFAULT_CHART_TYPE,
  dataSource: 'Dune',
  queryId: '',
  apiEndpoint: '',
  title: '',
  options: undefined,
  mode: ModeType.LIVE
}

export const getInitLineChartData = () => {
  return {
    dataSource: 'Custom',
    mode: ModeType.LIVE,
    apiEndpoint: 'https://api.dune.com/api/v1/query/3865244/results?api_key=',
    title: 'MEV Blocks Trend by Builders',
    options: {
      xColumn: {
        key: 'block_date',
        type: 'time'
      },
      yColumns: [
        'mev_block_count',
      ],
      seriesOptions: [
        {
          key: 'mev_block_count',
          title: 'Blocks',
          color: '#000'
        }
      ],
      xAxis: {
        title: 'Date',
        tickFormat: 'MMM DD'
      },
      yAxis: {
        labelFormat: '0,000.00',
        position: 'left'
      }
    }
  }
}

