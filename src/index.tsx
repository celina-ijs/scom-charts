import {
    Module,
    customModule,
    ControlElement,
    customElements,
    Container,
    IDataSchema,
    HStack,
    Label,
    VStack,
    Styles,
    Panel,
    Button,
    IUISchema,
    Modal
} from '@ijstech/components';
import { Charts, ScomChartsDataForm } from './components/index';
import { chartStyle, containerStyle, textStyle } from './index.css';
import assets from './assets';
import ScomChartDataSourceSetup, { ModeType, fetchContentByCID, callAPI, DataSource } from '@scom/scom-chart-data-source-setup';
import { IChartConfig, ThemeType } from './interface';

const Theme = Styles.Theme.ThemeVars;

export * from './utils';
export { Charts };

interface ScomChartsElement<T> extends ControlElement {
    lazyLoad?: boolean;
    data: IChartConfig<T>;
    defautData?: IChartConfig<T>;
}

declare global {
    namespace JSX {
        interface IntrinsicElements {
            ['i-scom-charts']: ScomChartsElement<any>;
        }
    }
}

const DefaultData: IChartConfig<any> = {
    dataSource: DataSource.Dune,
    queryId: '',
    apiEndpoint: '',
    title: '',
    options: undefined,
    mode: ModeType.LIVE
};

@customModule
@customElements('i-scom-charts')
export class ScomCharts<T> extends Module {
    private chartContainer: VStack;
    private vStackInfo: HStack;
    private pnlChart: Panel;
    private loadingElm: Panel;
    private lbTitle: Label;
    private lbDescription: Label;
    private chartEl: Charts<T>;

    protected _data: IChartConfig<T> = DefaultData;
    private _theme: ThemeType = 'light';
    protected chartData: { [key: string]: string | number }[] = [];
    private _defautData: any = null;
    private columnNames: string[] = [];
    tag: any = {};

    static async create(options?: ScomChartsElement<any>, parent?: Container) {
        let self = new this(parent, options);
        await self.ready();
        return self;
    }

    constructor(parent?: Container, options?: ScomChartsElement<T>) {
        super(parent, options);
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
        const dataAction = builderTarget?.getActions().find((action: any) => action.name === prop);
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

    private getData() {
        return this._data;
    }

    private async setData(data: IChartConfig<T>) {
        this._data = data;
        this.updateChartData();
    }

    private getTag() {
        return this.tag;
    }

    private async setTag(value: any, fromParent?: boolean) {
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

    private _getActions(dataSchema: IDataSchema, uiSchema: IUISchema, advancedSchema?: IDataSchema) {
        const builderSchema = this.getFormSchema(this.columnNames)?.builderSchema;
        const actions = [
            {
                name: 'Edit',
                icon: 'edit',
                command: (builder: any, userInputData: any) => {
                    let oldData: IChartConfig<T> = DefaultData;
                    let oldTag = {};
                    return {
                        execute: async () => {
                            oldData = JSON.parse(JSON.stringify(this._data));
                            const {
                                title,
                                description,
                                options,
                                ...themeSettings
                            } = userInputData;

                            const generalSettings = {
                                title,
                                description,
                            };

                            if (advancedSchema) {
                                this._data = { ...this._data, ...generalSettings };
                            } else {
                                this._data = { ...generalSettings as IChartConfig<T>, options };
                            }
                            if (builder?.setData) builder.setData(this._data);
                            this.setData(this._data);

                            oldTag = JSON.parse(JSON.stringify(this.tag));
                            if (builder?.setTag) builder.setTag(themeSettings);
                            else this.setTag(themeSettings);
                        },
                        undo: () => {
                            if (advancedSchema) oldData = { ...oldData, options: this._data.options };
                            if (builder?.setData) builder.setData(oldData);
                            this.setData(oldData);

                            this.tag = JSON.parse(JSON.stringify(oldTag));
                            if (builder?.setTag) builder.setTag(this.tag);
                            else this.setTag(this.tag);
                        },
                        redo: () => { }
                    }
                },
                userInputDataSchema: dataSchema,
                userInputUISchema: uiSchema
            },
            {
                name: 'Data',
                icon: 'database',
                command: (builder: any, userInputData: any) => {
                    let _oldData: IChartConfig<T> = DefaultData;
                    return {
                        execute: async () => {
                            _oldData = { ...this._data };
                            if (userInputData?.mode) this._data.mode = userInputData?.mode;
                            if (userInputData?.file) this._data.file = userInputData?.file;
                            if (userInputData?.dataSource) this._data.dataSource = userInputData?.dataSource;
                            if (userInputData?.queryId) this._data.queryId = userInputData?.queryId;
                            if (userInputData?.apiEndpoint) this._data.apiEndpoint = userInputData?.apiEndpoint;
                            if (userInputData?.options !== undefined) this._data.options = userInputData.options;
                            if (builder?.setData) builder.setData(this._data);
                            this.setData(this._data);
                        },
                        undo: () => {
                            if (builder?.setData) builder.setData(_oldData);
                            this.setData(_oldData);
                        },
                        redo: () => { }
                    }
                },
                customUI: {
                    render: (data?: any, onConfirm?: (result: boolean, data: any) => void, onChange?: (result: boolean, data: any) => void) => {
                        const vstack = new VStack(null, { gap: '1rem' });
                        const dataSourceSetup = new ScomChartDataSourceSetup(null, {
                            ...(data || this._data),
                            chartData: JSON.stringify(this.chartData),
                            onCustomDataChanged: async (dataSourceSetupData: any) => {
                                if (onChange) {
                                    onChange(true, {
                                        ...this._data,
                                        ...dataSourceSetupData
                                    });
                                }
                            }
                        });
                        const hstackBtnConfirm = new HStack(null, {
                            verticalAlignment: 'center',
                            horizontalAlignment: 'end'
                        });
                        const button = new Button(null, {
                            caption: 'Confirm',
                            width: 'auto',
                            padding: { top: '0.5rem', bottom: '0.5rem', left: '1rem', right: '1rem' },
                            height: 40,
                            font: { color: Theme.colors.primary.contrastText }
                        });
                        hstackBtnConfirm.append(button);
                        vstack.append(dataSourceSetup);
                        const dataOptionsForm = new ScomChartsDataForm(null, {
                            options: data?.options || this._data.options,
                            dataSchema: JSON.stringify(advancedSchema),
                            uiSchema: JSON.stringify(builderSchema.advanced.uiSchema)
                        });
                        vstack.append(dataOptionsForm);
                        vstack.append(hstackBtnConfirm);
                        if (onChange) {
                            dataOptionsForm.onCustomInputChanged = async (optionsFormData: any) => {
                                onChange(true, {
                                    ...(data || this._data),
                                    ...optionsFormData,
                                    ...dataSourceSetup.data
                                });
                            }
                        }
                        button.onClick = async () => {
                            const { dataSource, file, mode } = dataSourceSetup.data;
                            if (mode === ModeType.LIVE && !dataSource) return;
                            if (mode === ModeType.SNAPSHOT && !file?.cid) return;
                            if (onConfirm) {
                                const optionsFormData = await dataOptionsForm.refreshFormData();
                                onConfirm(true, {
                                    ...(data || this._data),
                                    ...optionsFormData,
                                    ...dataSourceSetup.data
                                });
                            }
                        }
                        return vstack;
                    }
                }
            }
        ]
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
        return actions
    }

    getConfigurators() {
        const self = this;
        return [
            {
                name: 'Builder Configurator',
                target: 'Builders',
                getActions: () => {
                    const builderSchema = this.getFormSchema(this.columnNames)?.builderSchema;
                    const dataSchema = builderSchema.dataSchema as IDataSchema;
                    const uiSchema = builderSchema.uiSchema as IUISchema;
                    const advancedSchema = builderSchema.advanced.dataSchema as any;
                    return this._getActions(dataSchema, uiSchema, advancedSchema);
                },
                getData: this.getData.bind(this),
                setData: async (data: IChartConfig<T>) => {
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
                    const dataSchema = embedderSchema.dataSchema as any;
                    const uiSchema = embedderSchema.uiSchema as IUISchema;
                    return this._getActions(dataSchema, uiSchema);
                },
                getLinkParams: () => {
                    const data = this._data || {};
                    return {
                        data: window.btoa(JSON.stringify(data))
                    }
                },
                setLinkParams: async (params: any) => {
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
            }
        ]
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
        this.loadingElm.visible = true;
        if (this._data?.mode === ModeType.SNAPSHOT)
            await this.renderSnapshotData();
        else
            await this.renderLiveData();
        this.loadingElm.visible = false;
    }

    private async renderSnapshotData() {
        if (this._data.file?.cid) {
            try {
                const data = await fetchContentByCID(this._data.file.cid);
                if (data) {
                    const { metadata, rows } = data;
                    this.chartData = rows;
                    this.columnNames = metadata?.column_names || [];
                    this.onUpdateBlock();
                    return;
                }
            } catch { }
        }
        this.chartData = [];
        this.columnNames = [];
        this.onUpdateBlock();
    }

    private async renderLiveData() {
        const dataSource = this._data.dataSource as DataSource;
        if (dataSource) {
            try {
                const data = await callAPI({
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
            } catch { }
        }
        this.chartData = [];
        this.columnNames = [];
        this.onUpdateBlock();
    }

    private renderChart() {
        if ((!this.pnlChart && this._data.options) || !this._data.options) return;
        const { title, description } = this._data;
        this.lbTitle.caption = title;
        this.lbDescription.caption = description;
        this.lbDescription.visible = !!description;
        this.pnlChart.height = `calc(100% - ${this.vStackInfo.offsetHeight + 10}px)`;
        this.pnlChart.clearInnerHTML();
        const data = this.getChartData();
        this._defautData = data?.defaultBuilderData;
        this.chartEl = new Charts<T>(this.pnlChart, {
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
        })
        this.maxWidth = '100%';
        this.chartContainer.style.boxShadow = 'rgba(0, 0, 0, 0.16) 0px 1px 4px';
        this.classList.add(chartStyle);
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