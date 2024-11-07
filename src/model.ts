import { Module } from "@ijstech/components";
import { IChartConfig } from "./interface";
import { ModeType } from "@scom/scom-chart-data-source-setup";

const DefaultData = {
  name: 'scom-line-chart',
  dataSource: 'Dune',
  queryId: '',
  apiEndpoint: '',
  title: '',
  options: undefined,
  mode: ModeType.LIVE
}

export class Model<T> {
  private module: Module;
  private _data: IChartConfig<T> = DefaultData;

  constructor(module: Module) {
    this.module = module;
  }

  get data() {
    return this._data;
  }
  set data(value: IChartConfig<T>) {
    this._data = value;
  }
}
