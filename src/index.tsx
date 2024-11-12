import {
    Module,
    customModule,
    ControlElement,
    customElements,
    Container,
    HStack,
    Label,
    VStack,
    Panel,
    Modal
} from '@ijstech/components';
import { Charts, ScomChartBlock } from './components/index';
import { chartStyle, containerStyle, textStyle } from './index.css';
import assets from './assets';
import { IChartConfig, ThemeType } from './interface';
import { ChartTypes, DEFAULT_CHART_TYPE, getInitLineChartData } from './utils';
import { Model } from './model';
import { BlockNoteSpecs, callbackFnType, executeFnType, getWidgetEmbedUrl, parseUrl } from '@scom/scom-blocknote-sdk';

export * from './utils';
export { Charts };

interface ScomChartsElement<T> extends ControlElement {
    lazyLoad?: boolean;
    data: IChartConfig<T>;
    defaultData?: IChartConfig<T>;
}

declare global {
    namespace JSX {
        interface IntrinsicElements {
            ['i-scom-charts']: ScomChartsElement<any>;
        }
    }
}

@customModule
@customElements('i-scom-charts')
export class ScomCharts<T> extends Module implements BlockNoteSpecs {
    private chartContainer: VStack;
    private vStackInfo: HStack;
    private pnlChart: Panel;
    private loadingElm: Panel;
    private lbTitle: Label;
    private lbDescription: Label;
    private chartEl: Charts<T>;

    protected model: Model<T>;
    private _theme: ThemeType = 'light';

    protected get chartData() {
        return this.model.chartData;
    }

    tag: any = {};

    static async create(options?: ScomChartsElement<any>, parent?: Container) {
        let self = new this(parent, options);
        await self.ready();
        return self;
    }

    constructor(parent?: Container, options?: ScomChartsElement<T>) {
        super(parent, options);
    }

    addBlock(blocknote: any, executeFn: executeFnType, callbackFn?: callbackFnType) {
        const blockType = 'chart';
        function getData(href: string) {
            const widgetData = parseUrl(href);
            if (widgetData) {
                const { module, properties } = widgetData;
                if (ChartTypes.includes(module.localPath)) return { ...properties };
            }
            return false;
        }
        const ChartBlock = blocknote.createBlockSpec({
            type: blockType,
            propSchema: {
                ...blocknote.defaultProps,
                name: { default: DEFAULT_CHART_TYPE, values: [...ChartTypes] },
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
        },
            {
                render: (block: any) => {
                    const wrapper = new Panel();
                    const data = JSON.parse(JSON.stringify(block.props));
                    const chart = new ScomChartBlock(wrapper, { data });
                    wrapper.appendChild(chart);
                    return {
                        dom: wrapper
                    };
                },
                parseFn: () => {
                    return [
                        {
                            tag: `div[data-content-type=${blockType}]`,
                            contentElement: "[data-editable]"
                        },
                        {
                            tag: "a",
                            getAttrs: (element: string | HTMLElement) => {
                                if (typeof element === "string") {
                                    return false;
                                }
                                const href = element.getAttribute('href');
                                if (href) return getData(href);
                                return false;
                            },
                            priority: 404,
                            node: blockType
                        },
                        {
                            tag: "p",
                            getAttrs: (element: string | HTMLElement) => {
                                if (typeof element === "string") {
                                    return false;
                                }
                                const child = element.firstChild as HTMLElement;
                                if (child?.nodeName === 'A' && child.getAttribute('href')) {
                                    const href = child.getAttribute('href');
                                    return getData(href);
                                }
                                return false;
                            },
                            priority: 405,
                            node: blockType
                        },
                    ]
                },
                toExternalHTML: (block: any, editor: any) => {
                    const link = document.createElement("a");
                    const module = {
                        name: `@scom/${block.props?.name || DEFAULT_CHART_TYPE}`,
                        localPath: `${block.props?.name || DEFAULT_CHART_TYPE}`
                    };
                    const url = getWidgetEmbedUrl(
                        {
                            type: blockType,
                            props: { ...(block.props || {}) }
                        },
                        module
                    );
                    link.setAttribute("href", url);
                    link.textContent = 'chart';
                    const wrapper = document.createElement("p");
                    wrapper.appendChild(link);
                    return {
                        dom: wrapper
                    }
                }
            });

        const ChartSlashItem = {
            name: "Chart",
            execute: (editor: any) => {
                const block: any = {
                    type: blockType,
                    props: {
                        name: DEFAULT_CHART_TYPE,
                        "dataSource": "Dune",
                        ...getInitLineChartData()
                    }
                }
                if (typeof executeFn === 'function') executeFn(editor, block);
            },
            aliases: ["chart", "widget"],
            group: "Widget",
            icon: { name: 'chart-line' },
            hint: "Insert a chart widget",
        }

        const moduleData = {
            name: 'scom-charts',
            localPath: '@scom/scom-charts'
        }

        return { block: ChartBlock, slashItem: ChartSlashItem, moduleData };
    }

    get theme() {
        return this._theme;
    }
    set theme(value: ThemeType) {
        this._theme = value;
        if (this.chartEl) this.chartEl.theme = value;
    }

    getFormSchema(columns: string[]) {
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

    showConfigurator(parent: Modal, prop: string) {
        const props = this._getDesignPropValue('data');
        const builderTarget = this.getConfigurators().find((conf: any) => conf.target === 'Builders');
        const dataAction = builderTarget?.getActions().find((action: any) => action.name === prop) as any;
        const self = this;
        if (dataAction) {
            const control = dataAction.customUI.render(props, (result: boolean, data: any) => {
                parent.visible = false;
                self.onConfigSave(data);
            })
            parent.item = control;
            parent.visible = true;
        }
    }

    private onConfigSave(data: IChartConfig<T>) {
        this._setDesignPropValue('data', data);
        this.setData({ ...data });
    }

    private async setData(value: IChartConfig<T>) {
        await this.model.setData(value);
    }

    private async setTag(value: any, fromParent?: boolean) {
        this.model.setTag(value);
    }

    getConfigurators() {
        this.initModel();
        return this.model.getConfigurators();
    }

    resize() {
        this.chartEl?.resize();
    }

    private updateStyle(name: string, value: any) {
        value ? this.style.setProperty(name, value) : this.style.removeProperty(name);
    }

    private updateTheme() {
        if (this.chartContainer) {
            this.chartContainer.style.boxShadow = this.tag?.darkShadow ? '0 -2px 10px rgba(0, 0, 0, 1)' : 'rgba(0, 0, 0, 0.16) 0px 1px 4px';
        }
        const tags = this.tag || {};
        this.updateStyle('--custom-text-color', tags.customFontColor ? tags.fontColor : tags.customWidgetsColor ? tags.widgetsColor : tags.parentCustomFontColor ? tags.parentFontColor : '');
        this.updateStyle('--custom-background-color', tags.customBackgroundColor ? tags.backgroundColor : tags.customWidgetsBackground ? tags.widgetsBackground : tags.parentCustomBackgroundColor ? tags.parentBackgroundColor : '');
    }

    private onUpdateBlock() {
        this.renderChart();
        this.updateTheme();
    }

    private async updateChartData() {
        if (this.loadingElm) this.loadingElm.visible = true;
        await this.model.fetchData();
        if (this.loadingElm) this.loadingElm.visible = false;
    }

    private renderChart() {
        if ((!this.pnlChart && this.model?.getData()?.options) || !this.model?.getData()?.options) return;
        const { title, description } = this.model.getData();
        this.lbTitle.caption = title;
        this.lbDescription.caption = description;
        this.lbDescription.visible = !!description;
        this.pnlChart.height = `calc(100% - ${this.vStackInfo.offsetHeight + 10}px)`;
        this.pnlChart.clearInnerHTML();
        const data = this.getChartData();
        this.model.defaultData = data?.defaultBuilderData;
        this.chartEl = new Charts<T>(this.pnlChart, {
            data: data?.chartData,
            width: '100%',
            height: '100%'
        });
        this.chartEl.drawChart();
    }

    private initModel() {
        if (!this.model) {
            this.model = new Model<T>(this);
            this.model.updateWidget = this.onUpdateBlock.bind(this);
            this.model.updateChartData = this.updateChartData.bind(this);
            this.model.getFormSchema = this.getFormSchema.bind(this);
        }
    }

    async init() {
        this.initModel();
        super.init();
        this.updateTheme();
        this.setTag({
            darkShadow: false,
            height: 500
        })
        this.maxWidth = '100%';
        this.chartContainer.style.boxShadow = 'rgba(0, 0, 0, 0.16) 0px 1px 4px';
        this.classList.add(chartStyle);
        const lazyLoad = this.getAttribute('lazyLoad', true, false);
        if (!lazyLoad) {
            const data = this.getAttribute('data', true);
            this.model.defaultData = this.getAttribute('defaultData', true);
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
        return (
            <i-vstack
                id="chartContainer"
                position="relative"
                height="100%"
                padding={{ top: 10, bottom: 10, left: 10, right: 10 }}
                class={containerStyle}
            >
                <i-vstack id="loadingElm" class="i-loading-overlay">
                    <i-vstack class="i-loading-spinner" horizontalAlignment="center" verticalAlignment="center">
                        <i-icon
                            class="i-loading-spinner_icon"
                            image={{ url: assets.fullPath('img/loading.svg'), width: 36, height: 36 }}
                        />
                    </i-vstack>
                </i-vstack>
                <i-vstack
                    id="vStackInfo"
                    width="100%"
                    maxWidth="100%"
                    margin={{ left: 'auto', right: 'auto', bottom: 10 }}
                    verticalAlignment="center"
                >
                    <i-label id="lbTitle" font={{ bold: true }} class={textStyle} />
                    <i-label id="lbDescription" margin={{ top: 5 }} class={textStyle} />
                </i-vstack>
                <i-panel id="pnlChart" width="100%" height="inherit" />
            </i-vstack>
        )
    }
}