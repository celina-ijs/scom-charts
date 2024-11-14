export default {
  "defaultBuilderData": {
    "name": "scom-line-chart",
    "dataSource": "Dune",
    "mode": "Live",
    "queryId": "3865244",
    "title": "MEV Blocks Trend by Builders",
    "options": {
      "xColumn": {
        "key": "block_date",
        "type": "time"
      },
      "yColumns": [
        "mev_block_count"
      ],
      "seriesOptions": [
        {
          "key": "mev_block_count",
          "title": "Blocks",
          "color": "#000"
        }
      ],
      "xAxis": {
        "title": "Date",
        "tickFormat": "MMM DD"
      },
      "yAxis": {
        "labelFormat": "0,000.00",
        "position": "left"
      }
    }
  }
}