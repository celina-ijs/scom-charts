import { Module, customModule, Container } from '@ijstech/components';
import { ModeType } from '@scom/scom-chart-data-source-setup';
import { ScomCharts } from '@scom/scom-charts';

@customModule
export default class Module1 extends Module {
    private chart: ScomCharts<any>;

    constructor(parent?: Container, options?: any) {
        super(parent, options);
    }

    async init() {
        await super.init();
    }


    render() {
        return (
            <i-vstack width="100%" height="100%">
                <i-scom-charts
                    id="chart"
                    width={1000}
                    height={500}
                    data={{
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
                    }}
                ></i-scom-charts>
            </i-vstack>
        )
    }
}