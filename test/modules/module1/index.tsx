import { Module, customModule, Container, application } from '@ijstech/components';
import { ModeType } from '@scom/scom-chart-data-source-setup';
import { ScomCharts } from '@scom/scom-charts';

@customModule
export default class Module1 extends Module {
    private chartEl: ScomCharts<any>;

    constructor(parent?: Container, options?: any) {
        super(parent, options);
    }

    async getOptions() {
        const source = await fetch('data/demo.json').then(res => res.json());
        return {
            dataset: [
                {
                    id: 'dataset_raw',
                    source: source
                },
                {
                    id: 'dataset_since_1950_of_germany',
                    fromDatasetId: 'dataset_raw',
                    transform: {
                        type: 'filter',
                        config: {
                            and: [
                                { dimension: 'Year', gte: 1950 },
                                { dimension: 'Country', '=': 'Germany' }
                            ]
                        }
                    }
                },
                {
                    id: 'dataset_since_1950_of_france',
                    fromDatasetId: 'dataset_raw',
                    transform: {
                        type: 'filter',
                        config: {
                            and: [
                                { dimension: 'Year', gte: 1950 },
                                { dimension: 'Country', '=': 'France' }
                            ]
                        }
                    }
                }
            ],
            title: {
                text: 'Income of Germany and France since 1950'
            },
            tooltip: {
                trigger: 'axis'
            },
            xAxis: {
                type: 'category',
                nameLocation: 'middle'
            },
            yAxis: {
                name: 'Income'
            },
            series: [
                {
                    type: 'line',
                    datasetId: 'dataset_since_1950_of_germany',
                    showSymbol: false,
                    encode: {
                        x: 'Year',
                        y: 'Income',
                        itemName: 'Year',
                        tooltip: ['Income']
                    }
                },
                {
                    type: 'line',
                    datasetId: 'dataset_since_1950_of_france',
                    showSymbol: false,
                    encode: {
                        x: 'Year',
                        y: 'Income',
                        itemName: 'Year',
                        tooltip: ['Income']
                    }
                }
            ]
        };
    }

    async init() {
        super.init();
        this.chartEl.getChartData = async () => ({ chartData: await this.getOptions() });
    }

    render() {
        return (
            <i-vstack width="100%" height="100%">
                <i-scom-charts
                    id="chartEl"
                    width={1000}
                    height={500}
                    data={{
                        dataSource: 'Custom',
                        mode: ModeType.LIVE,
                        apiEndpoint: `data/demo.json`,
                        title: 'Income of Germany and France since 1950',
                        options: null
                    }}
                ></i-scom-charts>
            </i-vstack>
        )
    }
}