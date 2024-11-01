import { Module, customModule, Container, Button } from '@ijstech/components';
import { ScomCharts } from '@scom/scom-charts';

@customModule
export default class Module1 extends Module {
    private chart: ScomCharts;
    private btnAction: Button;

    constructor(parent?: Container, options?: any) {
        super(parent, options);
    }

    private changeTheme() {
        this.chart.theme = this.chart.theme === 'light' ? 'dark' : 'light';
    }

    async init() {
        await super.init();
        this.chart.data = {
            xAxis: {
                type: 'category',
                data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
            },
            yAxis: {
                type: 'value'
            },
            series: [
                {
                    data: [22, 150, 175, 67, 52, 56, 220],
                    type: 'line'
                }
            ]
        }
    }


    render() {
        return (
            <i-vstack width="100%" height="100%">
                <i-button
                    caption='Change Theme'
                    width={80}
                    height={30}
                    onClick={this.changeTheme}
                ></i-button>
                <i-scom-charts
                    id="chart"
                    theme="dark"
                    width={1000}
                    height={500}
                ></i-scom-charts>
            </i-vstack>
        )
    }
}