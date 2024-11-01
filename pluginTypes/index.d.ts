/// <amd-module name="@scom/scom-charts" />
declare module "@scom/scom-charts" {
    import { Module, ControlElement, Container } from '@ijstech/components';
    type ThemeType = 'light' | 'dark';
    export interface ScomChartsElement extends ControlElement {
        theme?: ThemeType;
        data?: any;
    }
    global {
        namespace JSX {
            interface IntrinsicElements {
                ['i-scom-charts']: ScomChartsElement;
            }
        }
    }
    export class ScomCharts extends Module {
        private _data;
        private _theme;
        private _echart;
        private _chartIns;
        private _tool;
        private chartDom;
        constructor(parent?: Container, options?: any);
        get data(): any;
        set data(value: any);
        get theme(): ThemeType;
        set theme(value: ThemeType);
        registerTool(): Promise<void>;
        private addLib;
        showLoading(): void;
        drawChart(): void;
        private _drawChart;
        updateChartOptions(): void;
        resize(): void;
        private initChartDom;
        init(): Promise<void>;
        render(): void;
    }
}
