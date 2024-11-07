var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
define("@scom/scom-charts/components/dataForm.tsx", ["require", "exports", "@ijstech/components"], function (require, exports, components_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ScomChartsDataForm = void 0;
    let ScomChartsDataForm = class ScomChartsDataForm extends components_1.Module {
        constructor(parent, options) {
            super(parent, options);
        }
        get data() {
            return this._data;
        }
        set data(value) {
            this._data = value;
            this.renderUI();
        }
        async refreshFormData() {
            this._data = await this.formEl.getFormData();
            return this._data;
        }
        renderUI() {
            this.formEl.clearInnerHTML();
            this.formEl.jsonSchema = JSON.parse(this._dataSchema);
            this.formEl.uiSchema = JSON.parse(this._uiSchema);
            this.formEl.formOptions = {
                columnWidth: '100%',
                columnsPerRow: 1,
                confirmButtonOptions: {
                    hide: true
                }
            };
            this.formEl.renderForm();
            this.formEl.clearFormData();
            this.formEl.setFormData(this._data);
            const inputs = this.formEl.querySelectorAll('[scope]');
            for (let input of inputs) {
                const inputEl = input;
                inputEl.onChanged = this.onInputChanged;
            }
        }
        async onInputChanged() {
            const data = await this.formEl.getFormData();
            await this.onCustomInputChanged(data);
        }
        async onCustomInputChanged(data) {
        }
        async init() {
            super.init();
            this.onInputChanged = this.onInputChanged.bind(this);
            const dataSchema = this.getAttribute('dataSchema', true);
            this._dataSchema = dataSchema;
            const uiSchema = this.getAttribute('uiSchema', true);
            this._uiSchema = uiSchema;
            const options = this.getAttribute('options', true, {});
            this.data = {
                options
            };
        }
        render() {
            return (this.$render("i-panel", { id: 'pnlForm' },
                this.$render("i-form", { id: 'formEl' })));
        }
    };
    ScomChartsDataForm = __decorate([
        components_1.customModule,
        (0, components_1.customElements)('i-scom-charts--data-form')
    ], ScomChartsDataForm);
    exports.ScomChartsDataForm = ScomChartsDataForm;
});
define("@scom/scom-charts/components/chartBlock.tsx", ["require", "exports", "@ijstech/components", "@scom/scom-chart-data-source-setup"], function (require, exports, components_2, scom_chart_data_source_setup_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ScomChartBlock = void 0;
    const DefaultData = {
        name: 'scom-line-chart',
        dataSource: 'Dune',
        queryId: '',
        apiEndpoint: '',
        title: '',
        options: undefined,
        mode: scom_chart_data_source_setup_1.ModeType.LIVE
    };
    let ScomChartBlock = class ScomChartBlock extends components_2.Module {
        static async create(options, parent) {
            let self = new this(parent, options);
            await self.ready();
            return self;
        }
        constructor(parent, options) {
            super(parent, options);
            this._data = DefaultData;
            this.currentType = '';
        }
        getData() {
            return this._data;
        }
        async setData(data) {
            this._data = data;
            await this.renderChart(this._data);
        }
        getChartElm() {
            return this.chartEl;
        }
        async renderChart(data) {
            const { name } = data;
            if (!this.chartEl || (this.chartEl && name !== this.currentType)) {
                this.chartEl = await components_2.application.createElement(name);
                this.chartEl.parent = this.chartWrapper;
                this.currentType = name;
                this.chartWrapper.clearInnerHTML();
                this.chartWrapper.appendChild(this.chartEl);
            }
            await this.chartEl.setData(JSON.parse(JSON.stringify(data)));
        }
        getConfigurators() {
            return [
                {
                    name: 'Editor',
                    target: 'Editor',
                    getActions: () => {
                        return this.getActions(this.chartEl);
                    },
                    getData: this.getData.bind(this),
                    setData: this.setData.bind(this)
                }
            ];
        }
        async updateType(type) {
            if (this.currentType === type) {
                return this.getActions(this.chartEl);
            }
            else {
                const newData = { ...this._data, name: type };
                this.tempChart = await components_2.application.createElement(newData.name);
                try {
                    await this.tempChart.setData(JSON.parse(JSON.stringify(newData)));
                }
                catch { }
                return this.getActions(this.tempChart);
            }
        }
        getActions(chartEl) {
            if (chartEl?.getConfigurators) {
                const configs = chartEl.getConfigurators() || [];
                const configurator = configs.find((conf) => conf.target === 'Editor');
                if (configurator?.getActions)
                    return configurator.getActions();
            }
            return [];
        }
        async init() {
            super.init();
            const data = this.getAttribute('data', true);
            if (data)
                await this.setData(data);
        }
        render() {
            return (this.$render("i-panel", { id: "chartWrapper" }));
        }
    };
    ScomChartBlock = __decorate([
        (0, components_2.customElements)('i-scom-charts--block')
    ], ScomChartBlock);
    exports.ScomChartBlock = ScomChartBlock;
});
define("@scom/scom-charts/interface.ts", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("@scom/scom-charts/components/chart.tsx", ["require", "exports", "@ijstech/components"], function (require, exports, components_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Charts = void 0;
    ;
    const path = components_3.application.currentModuleDir;
    let Charts = class Charts extends components_3.Module {
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
                components_3.RequireJS.require([`${components_3.LibPath}lib/echarts/ecStat.min.js`], (ecStat) => {
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
            components_3.RequireJS.require([`${path}/lib/echarts/echarts.min.js`], (echart) => {
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
    Charts = __decorate([
        (0, components_3.customElements)('i-charts')
    ], Charts);
    exports.Charts = Charts;
});
define("@scom/scom-charts/components/index.ts", ["require", "exports", "@scom/scom-charts/components/dataForm.tsx", "@scom/scom-charts/components/chartBlock.tsx", "@scom/scom-charts/components/chart.tsx"], function (require, exports, dataForm_1, chartBlock_1, chart_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Charts = exports.ScomChartBlock = exports.ScomChartsDataForm = void 0;
    Object.defineProperty(exports, "ScomChartsDataForm", { enumerable: true, get: function () { return dataForm_1.ScomChartsDataForm; } });
    Object.defineProperty(exports, "ScomChartBlock", { enumerable: true, get: function () { return chartBlock_1.ScomChartBlock; } });
    Object.defineProperty(exports, "Charts", { enumerable: true, get: function () { return chart_1.Charts; } });
});
define("@scom/scom-charts/index.css.ts", ["require", "exports", "@ijstech/components"], function (require, exports, components_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.chartStyle = exports.textStyle = exports.containerStyle = void 0;
    exports.containerStyle = components_4.Styles.style({
        width: 'var(--layout-container-width)',
        maxWidth: 'var(--layout-container-max_width)',
        textAlign: 'var(--layout-container-text_align)',
        margin: '0 auto',
        padding: 10,
        background: 'var(--custom-background-color, var(--background-main))'
    });
    exports.textStyle = components_4.Styles.style({
        color: 'var(--custom-text-color, var(--text-primary))'
    });
    exports.chartStyle = components_4.Styles.style({
        display: 'block',
    });
});
define("@scom/scom-charts/assets.ts", ["require", "exports", "@ijstech/components"], function (require, exports, components_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let moduleDir = components_5.application.currentModuleDir;
    function fullPath(path) {
        if (path.indexOf('://') > 0)
            return path;
        return `${moduleDir}/${path}`;
    }
    exports.default = {
        fullPath
    };
});
define("@scom/scom-charts/utils.ts", ["require", "exports", "@ijstech/eth-wallet", "@ijstech/components"], function (require, exports, eth_wallet_1, components_6) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getWidgetEmbedUrl = exports.parseUrl = exports.parseStringToObject = exports.getChartTypeOptions = exports.ChartTypes = exports.concatUnique = exports.extractUniqueTimes = exports.groupByCategory = exports.groupArrayByKey = exports.formatNumberByFormat = exports.formatNumber = exports.isNumeric = void 0;
    const isNumeric = (value) => {
        if (value instanceof eth_wallet_1.BigNumber) {
            return !value.isNaN() && value.isFinite();
        }
        if (typeof value === 'string') {
            const parsed = new eth_wallet_1.BigNumber(value);
            return !parsed.isNaN() && parsed.isFinite();
        }
        return !isNaN(value) && isFinite(value);
    };
    exports.isNumeric = isNumeric;
    const formatNumber = (num, options) => {
        if (num === null)
            return '-';
        const { decimals, format, percentValues } = options || {};
        if (percentValues) {
            return `${components_6.FormatUtils.formatNumber(num, { decimalFigures: 2 })}%`;
        }
        if (format) {
            return (0, exports.formatNumberByFormat)(num, format);
        }
        const absNum = Math.abs(num);
        if (absNum >= 1000) {
            return components_6.FormatUtils.formatNumber(num, { decimalFigures: decimals, shortScale: true });
        }
        if (absNum < 0.0000001) {
            return components_6.FormatUtils.formatNumber(num, { decimalFigures: 0 });
        }
        if (absNum < 0.00001) {
            return components_6.FormatUtils.formatNumber(num, { decimalFigures: 6 });
        }
        if (absNum < 1) {
            return components_6.FormatUtils.formatNumber(num, { decimalFigures: 4 });
        }
        return components_6.FormatUtils.formatNumber(num, { decimalFigures: 2 });
    };
    exports.formatNumber = formatNumber;
    const formatNumberByFormat = (num, format, separators) => {
        if (!format)
            return components_6.FormatUtils.formatNumber(num, { decimalFigures: 0 });
        const decimalFigures = format.split('.')[1] ? format.split('.')[1].length : 0;
        if (format.includes('%')) {
            return components_6.FormatUtils.formatNumber((num * 100), { decimalFigures }) + '%';
        }
        const currencySymbol = format.indexOf('$') !== -1 ? '$' : '';
        const roundedNum = components_6.FormatUtils.formatNumber(num, { decimalFigures });
        if (separators || !(format.includes('m') || format.includes('a'))) {
            return format.indexOf('$') === 0 ? `${currencySymbol}${roundedNum}` : `${roundedNum}${currencySymbol}`;
        }
        const parts = roundedNum.split('.');
        const decimalPart = parts.length > 1 ? parts[1] : '';
        const integerPart = (0, exports.formatNumber)(parseInt(parts[0].replace(/,/g, '')), { decimals: decimalPart.length });
        return `${currencySymbol}${integerPart}`;
    };
    exports.formatNumberByFormat = formatNumberByFormat;
    const groupArrayByKey = (arr, isMerged) => {
        if (!isMerged)
            return arr;
        const groups = new Map();
        for (const [key, value] of arr) {
            const strKey = key instanceof Date ? key.getTime().toString() : key.toString();
            const existingValue = groups.get(strKey);
            if (existingValue !== undefined) {
                if (typeof existingValue === 'number' && typeof value === 'number') {
                    groups.set(strKey, existingValue + value);
                }
                else {
                    groups.set(strKey, value);
                }
            }
            else {
                groups.set(strKey, value);
            }
        }
        return Array.from(groups.entries()).map(([key, value]) => {
            const parsedKey = isNaN(Number(key)) ? key : new Date(Number(key));
            return [parsedKey, value];
        });
    };
    exports.groupArrayByKey = groupArrayByKey;
    const groupByCategory = (data, category, xAxis, yAxis) => {
        return data.reduce((result, item) => {
            const _category = item[category];
            if (!result[_category]) {
                result[_category] = {};
            }
            result[_category][item[xAxis]] = item[yAxis];
            return result;
        }, {});
    };
    exports.groupByCategory = groupByCategory;
    const extractUniqueTimes = (data, keyValue) => {
        return data.reduce((acc, cur) => {
            if (!acc.hasOwnProperty(cur[keyValue])) {
                acc[cur[keyValue]] = null;
            }
            return acc;
        }, {});
    };
    exports.extractUniqueTimes = extractUniqueTimes;
    const concatUnique = (obj1, obj2) => {
        const merged = { ...obj1, ...obj2 };
        return Object.keys(merged).reduce((acc, key) => {
            if (!acc.hasOwnProperty(key)) {
                acc[key] = merged[key];
            }
            return acc;
        }, {});
    };
    exports.concatUnique = concatUnique;
    exports.ChartTypes = ['scom-pie-chart', 'scom-line-chart', 'scom-bar-chart', 'scom-area-chart', 'scom-mixed-chart', 'scom-scatter-chart', 'scom-counter'];
    const getChartTypeOptions = () => {
        return [...exports.ChartTypes].map(type => ({ value: type, label: type.split('-')[1] }));
    };
    exports.getChartTypeOptions = getChartTypeOptions;
    const parseStringToObject = (value) => {
        try {
            const utf8String = decodeURIComponent(value);
            const decodedString = window.atob(utf8String);
            const newData = JSON.parse(decodedString);
            return { ...newData };
        }
        catch { }
        return null;
    };
    exports.parseStringToObject = parseStringToObject;
    function parseUrl(href) {
        const WIDGET_URL = "https://widget.noto.fan";
        if (href.startsWith(WIDGET_URL)) {
            let arr = href.split('/scom/');
            let paths = arr[1].split('/');
            const dataStr = paths.slice(1).join('/');
            return dataStr ? (0, exports.parseStringToObject)(dataStr) : null;
        }
        return null;
    }
    exports.parseUrl = parseUrl;
    const WIDGET_URL = 'https://widget.noto.fan';
    const getWidgetEmbedUrl = (block) => {
        const type = block.type;
        let module = null;
        module = {
            name: `@scom/${block.props?.name || 'scom-line-chart'}`,
            localPath: `${block.props?.name || 'scom-line-chart'}`
        };
        if (module) {
            const widgetData = {
                module,
                properties: { ...block.props },
            };
            const encodedWidgetDataString = encodeURIComponent(window.btoa(JSON.stringify(widgetData)));
            const moduleName = module.name.slice(1);
            return `${WIDGET_URL}/#!/${moduleName}/${encodedWidgetDataString}`;
        }
        return '';
    };
    exports.getWidgetEmbedUrl = getWidgetEmbedUrl;
});
define("@scom/scom-charts", ["require", "exports", "@ijstech/components", "@scom/scom-charts/components/index.ts", "@scom/scom-charts/index.css.ts", "@scom/scom-charts/assets.ts", "@scom/scom-chart-data-source-setup", "@scom/scom-charts/utils.ts", "@scom/scom-charts/utils.ts"], function (require, exports, components_7, index_1, index_css_1, assets_1, scom_chart_data_source_setup_2, utils_1, utils_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ScomCharts = exports.Charts = void 0;
    Object.defineProperty(exports, "Charts", { enumerable: true, get: function () { return index_1.Charts; } });
    const Theme = components_7.Styles.Theme.ThemeVars;
    __exportStar(utils_2, exports);
    const DefaultData = {
        dataSource: scom_chart_data_source_setup_2.DataSource.Dune,
        queryId: '',
        apiEndpoint: '',
        title: '',
        options: undefined,
        mode: scom_chart_data_source_setup_2.ModeType.LIVE
    };
    let ScomCharts = class ScomCharts extends components_7.Module {
        static async create(options, parent) {
            let self = new this(parent, options);
            await self.ready();
            return self;
        }
        constructor(parent, options) {
            super(parent, options);
            this._data = DefaultData;
            this._theme = 'light';
            this.chartData = [];
            this._defautData = null;
            this.columnNames = [];
            this.tag = {};
        }
        addBlock(blocknote, executeFn, callbackFn) {
            function getData(href) {
                const widgetData = (0, utils_1.parseUrl)(href);
                if (widgetData) {
                    const { module, properties } = widgetData;
                    if (utils_1.ChartTypes.includes(module.localPath))
                        return { ...properties };
                }
                return false;
            }
            const ChartBlock = blocknote.createBlockSpec({
                type: "chart",
                propSchema: {
                    ...blocknote.defaultProps,
                    name: { default: 'scom-line-chart', values: [...utils_1.ChartTypes] },
                    apiEndpoint: { default: '' },
                    dataSource: { default: 'Dune', values: ['Dune', 'Custom'] },
                    queryId: { default: '' },
                    title: { default: '' },
                    options: { default: undefined },
                    mode: { default: 'Live', values: ['Live', 'Snapshot'] },
                    width: { default: '100%' },
                    height: { default: 'auto' }
                },
                content: "none"
            }, {
                render: (block) => {
                    const wrapper = new components_7.Panel();
                    const data = JSON.parse(JSON.stringify(block.props));
                    const chart = new index_1.ScomChartBlock(wrapper, { data });
                    wrapper.appendChild(chart);
                    return {
                        dom: wrapper
                    };
                },
                parseFn: () => {
                    return [
                        {
                            tag: "div[data-content-type=chart]",
                            contentElement: "[data-editable]"
                        },
                        {
                            tag: "a",
                            getAttrs: (element) => {
                                if (typeof element === "string") {
                                    return false;
                                }
                                const href = element.getAttribute('href');
                                if (href)
                                    return getData(href);
                                return false;
                            },
                            priority: 404,
                            node: 'chart'
                        },
                        {
                            tag: "p",
                            getAttrs: (element) => {
                                if (typeof element === "string") {
                                    return false;
                                }
                                const child = element.firstChild;
                                if (child?.nodeName === 'A' && child.getAttribute('href')) {
                                    const href = child.getAttribute('href');
                                    return getData(href);
                                }
                                return false;
                            },
                            priority: 405,
                            node: 'chart'
                        },
                    ];
                },
                toExternalHTML: (block, editor) => {
                    const link = document.createElement("a");
                    const url = (0, utils_1.getWidgetEmbedUrl)({
                        type: 'chart',
                        props: { ...(block.props || {}) }
                    });
                    link.setAttribute("href", url);
                    link.textContent = 'chart';
                    const wrapper = document.createElement("p");
                    wrapper.appendChild(link);
                    return {
                        dom: wrapper
                    };
                }
            });
            const ChartSlashItem = {
                name: "Chart",
                execute: (editor) => {
                    const block = {
                        type: "chart",
                        props: {
                            name: 'scom-area-chart',
                            "dataSource": "Dune",
                            "queryId": "2030745",
                            title: 'ETH Staked - Cumulative',
                            options: {
                                xColumn: {
                                    key: 'date',
                                    type: 'time'
                                },
                                yColumns: [
                                    'total_eth',
                                ],
                                stacking: true,
                                groupBy: 'depositor_entity_category',
                                seriesOptions: [
                                    {
                                        key: 'CEX',
                                        color: '#d52828'
                                    },
                                    {
                                        key: 'Liquid Staking',
                                        color: '#d2da25'
                                    },
                                    {
                                        key: 'Others',
                                        color: '#000000'
                                    },
                                    {
                                        key: 'Staking Pools',
                                        color: '#49a34f'
                                    },
                                    {
                                        key: 'Unidentified',
                                        color: '#bcb8b8'
                                    }
                                ],
                                xAxis: {
                                    title: 'Date',
                                    tickFormat: 'MMM YYYY'
                                },
                                yAxis: {
                                    title: 'ETH deposited',
                                    labelFormat: '0,000.00ma',
                                    position: 'left'
                                }
                            }
                        }
                    };
                    if (typeof executeFn === 'function')
                        executeFn(editor, block);
                },
                aliases: ["chart", "widget"]
            };
            return { block: ChartBlock, slashItem: ChartSlashItem };
        }
        get theme() {
            return this._theme;
        }
        set theme(value) {
            this._theme = value;
            if (this.chartEl)
                this.chartEl.theme = value;
        }
        getFormSchema(columns) {
            return {
                builderSchema: {
                    dataSchema: {},
                    uiSchema: {},
                    advanced: {
                        dataSchema: {},
                        uiSchema: {}
                    }
                },
                embededSchema: {
                    dataSchema: {},
                    uiSchema: {}
                }
            };
        }
        getChartData() {
            return null;
        }
        showConfigurator(parent, prop) {
            const props = this._getDesignPropValue('data');
            const builderTarget = this.getConfigurators().find((conf) => conf.target === 'Builders');
            const dataAction = builderTarget?.getActions().find((action) => action.name === prop);
            const self = this;
            if (dataAction) {
                const control = dataAction.customUI.render(props, (result, data) => {
                    parent.visible = false;
                    self.onConfigSave(data);
                });
                parent.item = control;
                parent.visible = true;
            }
        }
        onConfigSave(data) {
            this._setDesignPropValue('data', data);
            this.setData({ ...data });
        }
        getData() {
            return this._data;
        }
        async setData(data) {
            this._data = data;
            this.updateChartData();
        }
        getTag() {
            return this.tag;
        }
        async setTag(value, fromParent) {
            if (fromParent) {
                this.tag.parentFontColor = value.fontColor;
                this.tag.parentCustomFontColor = value.customFontColor;
                this.tag.parentBackgroundColor = value.backgroundColor;
                this.tag.parentCustomBackgroundColor = value.customBackgoundColor;
                this.tag.customWidgetsBackground = value.customWidgetsBackground;
                this.tag.widgetsBackground = value.widgetsBackground;
                this.tag.customWidgetsColor = value.customWidgetsColor;
                this.tag.widgetsColor = value.widgetsColor;
                this.onUpdateBlock();
                return;
            }
            const newValue = value || {};
            for (let prop in newValue) {
                if (newValue.hasOwnProperty(prop)) {
                    this.tag[prop] = newValue[prop];
                }
            }
            this.width = this.tag.width || 700;
            this.height = this.tag.height || 500;
            this.onUpdateBlock();
        }
        _getActions(dataSchema, uiSchema, advancedSchema) {
            const builderSchema = this.getFormSchema(this.columnNames)?.builderSchema;
            const actions = [
                {
                    name: 'Edit',
                    icon: 'edit',
                    command: (builder, userInputData) => {
                        let oldData = DefaultData;
                        let oldTag = {};
                        return {
                            execute: async () => {
                                oldData = JSON.parse(JSON.stringify(this._data));
                                const { title, description, options, ...themeSettings } = userInputData;
                                const generalSettings = {
                                    title,
                                    description,
                                };
                                if (advancedSchema) {
                                    this._data = { ...this._data, ...generalSettings };
                                }
                                else {
                                    this._data = { ...generalSettings, options };
                                }
                                if (builder?.setData)
                                    builder.setData(this._data);
                                this.setData(this._data);
                                oldTag = JSON.parse(JSON.stringify(this.tag));
                                if (builder?.setTag)
                                    builder.setTag(themeSettings);
                                else
                                    this.setTag(themeSettings);
                            },
                            undo: () => {
                                if (advancedSchema)
                                    oldData = { ...oldData, options: this._data.options };
                                if (builder?.setData)
                                    builder.setData(oldData);
                                this.setData(oldData);
                                this.tag = JSON.parse(JSON.stringify(oldTag));
                                if (builder?.setTag)
                                    builder.setTag(this.tag);
                                else
                                    this.setTag(this.tag);
                            },
                            redo: () => { }
                        };
                    },
                    userInputDataSchema: dataSchema,
                    userInputUISchema: uiSchema
                },
                this._getDataAction(builderSchema, advancedSchema)
            ];
            // if (advancedSchema) {
            //   const advanced = {
            //     name: 'Advanced',
            //     icon: 'sliders-h',
            //     command: (builder: any, userInputData: any) => {
            //       let _oldData: ILineChartOptions = {};
            //       return {
            //         execute: async () => {
            //           _oldData = { ...this._data?.options };
            //           if (userInputData?.options !== undefined) this._data.options = userInputData.options;
            //           if (builder?.setData) builder.setData(this._data);
            //           this.setData(this._data);
            //         },
            //         undo: () => {
            //           this._data.options = { ..._oldData };
            //           if (builder?.setData) builder.setData(this._data);
            //           this.setData(this._data);
            //         },
            //         redo: () => { }
            //       }
            //     },
            //     userInputDataSchema: advancedSchema,
            //     userInputUISchema: builderSchema.advanced.uiSchema as any
            //   }
            //   actions.push(advanced);
            // }
            return actions;
        }
        _getDataAction(builderSchema, advancedSchema) {
            return {
                name: 'Data',
                icon: 'database',
                command: (builder, userInputData) => {
                    let _oldData = DefaultData;
                    return {
                        execute: async () => {
                            _oldData = { ...this._data };
                            if (userInputData?.mode)
                                this._data.mode = userInputData?.mode;
                            if (userInputData?.file)
                                this._data.file = userInputData?.file;
                            if (userInputData?.dataSource)
                                this._data.dataSource = userInputData?.dataSource;
                            if (userInputData?.queryId)
                                this._data.queryId = userInputData?.queryId;
                            if (userInputData?.apiEndpoint)
                                this._data.apiEndpoint = userInputData?.apiEndpoint;
                            if (userInputData?.options !== undefined)
                                this._data.options = userInputData.options;
                            if (builder?.setData)
                                builder.setData(this._data);
                            this.setData(this._data);
                        },
                        undo: () => {
                            if (builder?.setData)
                                builder.setData(_oldData);
                            this.setData(_oldData);
                        },
                        redo: () => { }
                    };
                },
                customUI: {
                    render: (data, onConfirm, onChange) => {
                        const vstack = new components_7.VStack(null, { gap: '1rem' });
                        const dataSourceSetup = new scom_chart_data_source_setup_2.default(null, {
                            ...(data || this._data),
                            chartData: JSON.stringify(this.chartData),
                            onCustomDataChanged: async (dataSourceSetupData) => {
                                if (onChange) {
                                    onChange(true, {
                                        ...this._data,
                                        ...dataSourceSetupData
                                    });
                                }
                            }
                        });
                        const hstackBtnConfirm = new components_7.HStack(null, {
                            verticalAlignment: 'center',
                            horizontalAlignment: 'end'
                        });
                        const button = new components_7.Button(null, {
                            caption: 'Confirm',
                            width: 'auto',
                            padding: { top: '0.5rem', bottom: '0.5rem', left: '1rem', right: '1rem' },
                            height: 40,
                            font: { color: Theme.colors.primary.contrastText }
                        });
                        hstackBtnConfirm.append(button);
                        vstack.append(dataSourceSetup);
                        const dataOptionsForm = new index_1.ScomChartsDataForm(null, {
                            options: data?.options || this._data.options,
                            dataSchema: JSON.stringify(advancedSchema),
                            uiSchema: JSON.stringify(builderSchema.advanced.uiSchema)
                        });
                        vstack.append(dataOptionsForm);
                        vstack.append(hstackBtnConfirm);
                        if (onChange) {
                            dataOptionsForm.onCustomInputChanged = async (optionsFormData) => {
                                onChange(true, {
                                    ...(data || this._data),
                                    ...optionsFormData,
                                    ...dataSourceSetup.data
                                });
                            };
                        }
                        button.onClick = async () => {
                            const { dataSource, file, mode } = dataSourceSetup.data;
                            if (mode === scom_chart_data_source_setup_2.ModeType.LIVE && !dataSource)
                                return;
                            if (mode === scom_chart_data_source_setup_2.ModeType.SNAPSHOT && !file?.cid)
                                return;
                            if (onConfirm) {
                                const optionsFormData = await dataOptionsForm.refreshFormData();
                                onConfirm(true, {
                                    ...(data || this._data),
                                    ...optionsFormData,
                                    ...dataSourceSetup.data
                                });
                            }
                        };
                        return vstack;
                    }
                }
            };
        }
        getConfigurators() {
            const self = this;
            return [
                {
                    name: 'Builder Configurator',
                    target: 'Builders',
                    getActions: () => {
                        const builderSchema = this.getFormSchema(this.columnNames)?.builderSchema;
                        const dataSchema = builderSchema.dataSchema;
                        const uiSchema = builderSchema.uiSchema;
                        const advancedSchema = builderSchema.advanced.dataSchema;
                        return this._getActions(dataSchema, uiSchema, advancedSchema);
                    },
                    getData: this.getData.bind(this),
                    setData: async (data) => {
                        const defaultData = this._defautData || {};
                        await this.setData({ ...defaultData, ...data });
                    },
                    getTag: this.getTag.bind(this),
                    setTag: this.setTag.bind(this)
                },
                {
                    name: 'Emdedder Configurator',
                    target: 'Embedders',
                    getActions: () => {
                        const embedderSchema = this.getFormSchema(this.columnNames)?.embededSchema;
                        const dataSchema = embedderSchema.dataSchema;
                        const uiSchema = embedderSchema.uiSchema;
                        return this._getActions(dataSchema, uiSchema);
                    },
                    getLinkParams: () => {
                        const data = this._data || {};
                        return {
                            data: window.btoa(JSON.stringify(data))
                        };
                    },
                    setLinkParams: async (params) => {
                        if (params.data) {
                            const utf8String = decodeURIComponent(params.data);
                            const decodedString = window.atob(utf8String);
                            const newData = JSON.parse(decodedString);
                            let resultingData = {
                                ...self._data,
                                ...newData
                            };
                            await this.setData(resultingData);
                        }
                    },
                    getData: this.getData.bind(this),
                    setData: this.setData.bind(this),
                    getTag: this.getTag.bind(this),
                    setTag: this.setTag.bind(this)
                },
                {
                    name: 'Editor',
                    target: 'Editor',
                    getActions: () => {
                        const builderSchema = this.getFormSchema(this.columnNames)?.builderSchema;
                        const advancedSchema = builderSchema.advanced.dataSchema;
                        return [
                            this._getDataAction(builderSchema, advancedSchema)
                        ];
                    },
                    getData: this.getData.bind(this),
                    setData: this.setData.bind(this)
                }
            ];
        }
        updateStyle(name, value) {
            value ? this.style.setProperty(name, value) : this.style.removeProperty(name);
        }
        updateTheme() {
            if (this.chartContainer) {
                this.chartContainer.style.boxShadow = this.tag?.darkShadow ? '0 -2px 10px rgba(0, 0, 0, 1)' : 'rgba(0, 0, 0, 0.16) 0px 1px 4px';
            }
            const tags = this.tag || {};
            this.updateStyle('--custom-text-color', tags.customFontColor ? tags.fontColor : tags.customWidgetsColor ? tags.widgetsColor : tags.parentCustomFontColor ? tags.parentFontColor : '');
            this.updateStyle('--custom-background-color', tags.customBackgroundColor ? tags.backgroundColor : tags.customWidgetsBackground ? tags.widgetsBackground : tags.parentCustomBackgroundColor ? tags.parentBackgroundColor : '');
        }
        onUpdateBlock() {
            this.renderChart();
            this.updateTheme();
        }
        async updateChartData() {
            if (this.loadingElm)
                this.loadingElm.visible = true;
            if (this._data?.mode === scom_chart_data_source_setup_2.ModeType.SNAPSHOT)
                await this.renderSnapshotData();
            else
                await this.renderLiveData();
            if (this.loadingElm)
                this.loadingElm.visible = false;
        }
        async renderSnapshotData() {
            if (this._data.file?.cid) {
                try {
                    const data = await (0, scom_chart_data_source_setup_2.fetchContentByCID)(this._data.file.cid);
                    if (data) {
                        const { metadata, rows } = data;
                        this.chartData = rows;
                        this.columnNames = metadata?.column_names || [];
                        this.onUpdateBlock();
                        return;
                    }
                }
                catch { }
            }
            this.chartData = [];
            this.columnNames = [];
            this.onUpdateBlock();
        }
        async renderLiveData() {
            const dataSource = this._data.dataSource;
            if (dataSource) {
                try {
                    const data = await (0, scom_chart_data_source_setup_2.callAPI)({
                        dataSource,
                        queryId: this._data.queryId,
                        apiEndpoint: this._data.apiEndpoint
                    });
                    if (data) {
                        const { metadata, rows } = data;
                        this.chartData = rows;
                        this.columnNames = metadata?.column_names || [];
                        this.onUpdateBlock();
                        return;
                    }
                }
                catch { }
            }
            this.chartData = [];
            this.columnNames = [];
            this.onUpdateBlock();
        }
        renderChart() {
            if ((!this.pnlChart && this._data.options) || !this._data.options)
                return;
            const { title, description } = this._data;
            this.lbTitle.caption = title;
            this.lbDescription.caption = description;
            this.lbDescription.visible = !!description;
            this.pnlChart.height = `calc(100% - ${this.vStackInfo.offsetHeight + 10}px)`;
            this.pnlChart.clearInnerHTML();
            const data = this.getChartData();
            this._defautData = data?.defaultBuilderData;
            this.chartEl = new index_1.Charts(this.pnlChart, {
                data: data?.chartData,
                width: '100%',
                height: '100%'
            });
            this.chartEl.drawChart();
        }
        resize() {
            this.chartEl?.resize();
        }
        async init() {
            super.init();
            this.updateTheme();
            this.setTag({
                darkShadow: false,
                height: 500
            });
            this.maxWidth = '100%';
            this.chartContainer.style.boxShadow = 'rgba(0, 0, 0, 0.16) 0px 1px 4px';
            this.classList.add(index_css_1.chartStyle);
            const lazyLoad = this.getAttribute('lazyLoad', true, false);
            if (!lazyLoad) {
                const data = this.getAttribute('data', true);
                this._defautData = this.getAttribute('defautData', true);
                if (data) {
                    this.setData(data);
                }
            }
            this.executeReadyCallback();
            window.addEventListener('resize', () => {
                setTimeout(() => {
                    this.resize();
                }, 300);
            });
        }
        render() {
            return (this.$render("i-vstack", { id: "chartContainer", position: "relative", height: "100%", padding: { top: 10, bottom: 10, left: 10, right: 10 }, class: index_css_1.containerStyle },
                this.$render("i-vstack", { id: "loadingElm", class: "i-loading-overlay" },
                    this.$render("i-vstack", { class: "i-loading-spinner", horizontalAlignment: "center", verticalAlignment: "center" },
                        this.$render("i-icon", { class: "i-loading-spinner_icon", image: { url: assets_1.default.fullPath('img/loading.svg'), width: 36, height: 36 } }))),
                this.$render("i-vstack", { id: "vStackInfo", width: "100%", maxWidth: "100%", margin: { left: 'auto', right: 'auto', bottom: 10 }, verticalAlignment: "center" },
                    this.$render("i-label", { id: "lbTitle", font: { bold: true }, class: index_css_1.textStyle }),
                    this.$render("i-label", { id: "lbDescription", margin: { top: 5 }, class: index_css_1.textStyle })),
                this.$render("i-panel", { id: "pnlChart", width: "100%", height: "inherit" })));
        }
    };
    ScomCharts = __decorate([
        components_7.customModule,
        (0, components_7.customElements)('i-scom-charts')
    ], ScomCharts);
    exports.ScomCharts = ScomCharts;
});
