import { Button, HStack, IDataSchema, IUISchema, Module, VStack, Styles } from "@ijstech/components";
import { IChartConfig } from "./interface";
import ScomChartDataSourceSetup, { callAPI, DataSource, fetchContentByCID, ModeType } from "@scom/scom-chart-data-source-setup";
import { ScomChartsDataForm } from "./components/index";
import { DefaultData } from "./utils";

const Theme = Styles.Theme.ThemeVars;

export class Model<T> {
  private module: Module;
  private _data: IChartConfig<T> = DefaultData;
  private _chartData: { [key: string]: string | number }[] = [];
  private _defaultData: IChartConfig<T> | null = null;
  private columnNames: string[] = [];

  updateWidget: () => void;
  updateChartData: () => void;
  getFormSchema: (columns: string[]) => any;

  constructor(module: Module) {
    this.module = module;
  }

  set defaultData(value: IChartConfig<T>) {
    this._defaultData = value;
  }

  get defaultData() {
    return this._defaultData;
  }

  get chartData() {
    return this._chartData;
  }

  async setData(value: IChartConfig<T>) {
    this._data = value;
    this.updateChartData();
  }

  getData() {
    return this._data;
  }

  getTag() {
    return this.module.tag;
  }

  async setTag(value: any, fromParent?: boolean) {
    if (fromParent) {
      this.module.tag.parentFontColor = value.fontColor;
      this.module.tag.parentCustomFontColor = value.customFontColor;
      this.module.tag.parentBackgroundColor = value.backgroundColor;
      this.module.tag.parentCustomBackgroundColor = value.customBackgoundColor;
      this.module.tag.customWidgetsBackground = value.customWidgetsBackground;
      this.module.tag.widgetsBackground = value.widgetsBackground;
      this.module.tag.customWidgetsColor = value.customWidgetsColor;
      this.module.tag.widgetsColor = value.widgetsColor;
      this.updateWidget();
      return;
    }
    const newValue = value || {};
    for (let prop in newValue) {
      if (newValue.hasOwnProperty(prop)) {
        this.module.tag[prop] = newValue[prop];
      }
    }
    this.module.width = this.module.tag.width || 700;
    this.module.height = this.module.tag.height || 500;
    this.updateWidget();
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

              oldTag = JSON.parse(JSON.stringify(this.module.tag));
              if (builder?.setTag) builder.setTag(themeSettings);
              else this.setTag(themeSettings);
            },
            undo: () => {
              if (advancedSchema) oldData = { ...oldData, options: this._data.options };
              if (builder?.setData) builder.setData(oldData);
              this.setData(oldData);

              this.module.tag = JSON.parse(JSON.stringify(oldTag));
              if (builder?.setTag) builder.setTag(this.module.tag);
              else this.setTag(this.module.tag);
            },
            redo: () => { }
          }
        },
        userInputDataSchema: dataSchema,
        userInputUISchema: uiSchema
      },
      this._getDataAction(builderSchema, advancedSchema)
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

  private _getDataAction(builderSchema: IDataSchema, advancedSchema?: IDataSchema) {
    return {
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
            chartData: JSON.stringify(this._chartData),
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
                ...this._data,
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
                ...this._data,
                ...optionsFormData,
                ...dataSourceSetup.data
              });
            }
          }
          return vstack;
        }
      }
    }
  }

  getConfigurators() {
    const self = this;
    return [
      {
        name: 'Builder Configurator',
        target: 'Builders',
        getActions: () => {
          if (!this.getFormSchema) return [];
          const builderSchema = this.getFormSchema(this.columnNames)?.builderSchema;
          const dataSchema = builderSchema.dataSchema as IDataSchema;
          const uiSchema = builderSchema.uiSchema as IUISchema;
          const advancedSchema = builderSchema.advanced.dataSchema as any;
          return this._getActions(dataSchema, uiSchema, advancedSchema);
        },
        getData: this.getData.bind(this),
        setData: async (data: IChartConfig<T>) => {
          const defaultData = this._defaultData || {};
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
      },
      {
        name: 'Editor',
        target: 'Editor',
        getActions: () => {
          const builderSchema = this.getFormSchema(this.columnNames)?.builderSchema;
          const advancedSchema = builderSchema.advanced.dataSchema as any;
          return [
            this._getDataAction(builderSchema, advancedSchema)
          ]
        },
        getData: this.getData.bind(this),
        setData: this.setData.bind(this)
      }
    ]
  }

  async fetchData() {
    if (this._data?.mode === ModeType.SNAPSHOT)
      await this.renderSnapshotData();
    else
      await this.renderLiveData();
  }

  private async renderSnapshotData() {
    if (this._data.file?.cid) {
      try {
        const data = await fetchContentByCID(this._data.file.cid);
        if (data) {
          const { metadata, rows } = data;
          this._chartData = rows;
          this.columnNames = metadata?.column_names || [];
          this.updateWidget();
          return;
        }
      } catch { }
    }
    this._chartData = [];
    this.columnNames = [];
    this.updateWidget();
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
          this._chartData = rows;
          this.columnNames = metadata?.column_names || [];
          this.updateWidget();
          return;
        }
      } catch { }
    }
    this._chartData = [];
    this.columnNames = [];
    this.updateWidget();
  }
}
