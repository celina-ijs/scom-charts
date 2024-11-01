var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define("@scom/scom-charts", ["require", "exports", "@ijstech/components"], function (require, exports, components_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ScomCharts = void 0;
    ;
    let ScomCharts = class ScomCharts extends components_1.Module {
        constructor(parent, options) {
            super(parent, options);
            this._theme = 'light';
        }
        get data() {
            return this._data;
        }
        set data(value) {
            this._data = value;
            this.drawChart();
        }
        get theme() {
            return this._theme;
        }
        set theme(value) {
            this._theme = value;
            this._chartIns = null;
            if (this.hasChildNodes()) {
                this.removeChild(this.chartDom);
            }
            this.initChartDom();
            this.drawChart();
        }
        async registerTool() {
            if (!this._tool)
                this._tool = await this.addLib();
            this._echart?.registerTransform(this._tool);
        }
        async addLib() {
            return new Promise((resolve, reject) => {
                components_1.RequireJS.require([`${components_1.LibPath}lib/echarts/ecStat.min.js`], (ecStat) => {
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
            components_1.RequireJS.require([`${components_1.LibPath}lib/echarts/echarts.min.js`], (echart) => {
                this._echart = echart;
                this._drawChart();
            });
        }
        _drawChart() {
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
        initChartDom() {
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
            return;
        }
    };
    ScomCharts = __decorate([
        (0, components_1.customElements)('i-scom-charts')
    ], ScomCharts);
    exports.ScomCharts = ScomCharts;
});
