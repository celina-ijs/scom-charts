import { Module, ControlElement, RequireJS, LibPath, customElements, Container } from '@ijstech/components';

type ThemeType = 'light' | 'dark';

export interface ScomChartsElement extends ControlElement {
    theme?: ThemeType;
    data?: any;
}

declare global {
    namespace JSX {
        interface IntrinsicElements {
            ['i-scom-charts']: ScomChartsElement;
        }
    }
};

@customElements('i-scom-charts')
export class ScomCharts extends Module {
    private _data: any;
    private _theme: ThemeType = 'light';
    private _echart: any;
    private _chartIns: any;
    private _tool: any;

    private chartDom: HTMLElement;

    constructor(parent?: Container, options?: any) {
        super(parent, options);
    }

    get data() {
        return this._data;
    }
    set data(value: any) {
        this._data = value;
        this.drawChart();
    }

    get theme() {
        return this._theme;
    }
    set theme(value: ThemeType) {
        this._theme = value;
        this._chartIns = null;
        if (this.hasChildNodes()) {
            this.removeChild(this.chartDom);
        }
        this.initChartDom();
        this.drawChart();
    }

    async registerTool() {
        if (!this._tool) this._tool = await this.addLib();
        this._echart?.registerTransform(this._tool);
    }

    private async addLib() {
        return new Promise((resolve, reject) => {
            RequireJS.require([`${LibPath}lib/echarts/ecStat.min.js`], (ecStat: any) => {
                resolve(ecStat);
            });
        });
    }

    showLoading() {
        this._chartIns?.showLoading();
    }

    drawChart() {
        if (this._chartIns) {
            this.updateChartOptions();
            return;
        }
        if (this._echart) {
            this._drawChart();
            return;
        }
        RequireJS.require([`${LibPath}lib/echarts/echarts.min.js`], (echart: any) => {
            this._echart = echart;
            this._drawChart();
        });
    }

    private _drawChart() {
        if (this.chartDom) {
            this._chartIns = this._echart.init(this.chartDom, this.theme);
            this.updateChartOptions();
        }
    }

    updateChartOptions() {
        this._chartIns.hideLoading();
        this.data && this._chartIns.setOption(this.data);
    }

    resize() {
        if (this.data && this._chartIns) {
            this._chartIns.resize();
        }
    }

    private initChartDom() {
        const captionDiv = this.createElement('div', this);
        captionDiv.id = `main-${Date.now()}`;
        captionDiv.style.display = 'inline-block';
        captionDiv.style.height = '100%';
        captionDiv.style.width = '100%';
        this.chartDom = captionDiv;
    }

    async init() {
        super.init();
        this.style.display = 'inline-block';
        this.initChartDom();
        this._theme = this.getAttribute('theme', true, 'light');
        this.data = this.getAttribute('data', true);
    }

    render() {
        return
    }
}