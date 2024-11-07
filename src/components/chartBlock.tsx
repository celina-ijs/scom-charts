import {
  customElements,
  ControlElement,
  Module,
  Container,
  Panel,
  application
} from '@ijstech/components';
import { ModeType } from '@scom/scom-chart-data-source-setup';

interface IChartConfig {
  name?: string;
  dataSource: string;
  queryId?: string;
  apiEndpoint?: string;
  title: string;
  description?: string;
  options: any,
  file?: {
    cid: string,
    name: string
  },
  mode: ModeType
}

interface ScomChartBlockElement extends ControlElement {
  data: IChartConfig;
}

const DefaultData = {
  name: 'scom-line-chart',
  dataSource: 'Dune',
  queryId: '',
  apiEndpoint: '',
  title: '',
  options: undefined,
  mode: ModeType.LIVE
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      ['i-scom-charts--block']: ScomChartBlockElement;
    }
  }
}

@customElements('i-scom-charts--block')
export class ScomChartBlock extends Module {
  private chartWrapper: Panel;
  private chartEl: any;
  private tempChart: any;

  private _data: IChartConfig = DefaultData;
  private currentType: string = '';

  static async create(options?: ScomChartBlockElement, parent?: Container) {
    let self = new this(parent, options);
    await self.ready();
    return self;
  }

  constructor(parent?: Container, options?: any) {
    super(parent, options);
  }

  getData() {
    return this._data;
  }

  async setData(data: IChartConfig) {
    this._data = data;
    await this.renderChart(this._data);
  }

  getChartElm() {
    return this.chartEl;
  }

  private async renderChart(data: IChartConfig) {
    const { name } = data;
    if (!this.chartEl || (this.chartEl && name !== this.currentType)) {
      this.chartEl = await application.createElement(name);
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
    ]
  }

  async updateType(type: string) {
    if (this.currentType === type) {
      return this.getActions(this.chartEl);
    } else {
      const newData = {...this._data, name: type};
      this.tempChart = await application.createElement(newData.name);
      try {
        await this.tempChart.setData(JSON.parse(JSON.stringify(newData)));
      } catch {}
      return this.getActions(this.tempChart);
    }
  }

  private getActions(chartEl: any) {
    if (chartEl?.getConfigurators) {
      const configs = chartEl.getConfigurators() || [];
      const configurator = configs.find((conf: any) => conf.target === 'Editor');
      if (configurator?.getActions) return configurator.getActions();
    }
    return [];
  }

  async init() {
    super.init();
    const data = this.getAttribute('data', true);
    if (data) await this.setData(data);
  }

  render(): void {
    return (
      <i-panel id="chartWrapper"></i-panel>
    )
  }
}
