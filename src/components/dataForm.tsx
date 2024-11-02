import {
    Module,
    customModule,
    ControlElement,
    customElements,
    Container,
    Form,
    Input
} from '@ijstech/components'

interface IData {
    options: any
}

interface ScomChartsDataFormElement extends ControlElement {
    dataSchema?: string;
    uiSchema?: string;
    options: any;
}

declare global {
    namespace JSX {
        interface IntrinsicElements {
            ["i-scom-charts--data-form"]: ScomChartsDataFormElement;
        }
    }
}

@customModule
@customElements('i-scom-charts--data-form')
export class ScomChartsDataForm extends Module {
    private formEl: Form;
    private _dataSchema: string;
    private _uiSchema: string;
    private _data: IData;

    constructor(parent?: Container, options?: any) {
        super(parent, options)
    }

    get data() {
        return this._data
    }
    set data(value: IData) {
        this._data = value
        this.renderUI()
    }

    async refreshFormData() {
        this._data = await this.formEl.getFormData();
        return this._data;
    }

    private renderUI() {
        this.formEl.clearInnerHTML()
        this.formEl.jsonSchema = JSON.parse(this._dataSchema);
        this.formEl.uiSchema = JSON.parse(this._uiSchema);
        this.formEl.formOptions = {
            columnWidth: '100%',
            columnsPerRow: 1,
            confirmButtonOptions: {
                hide: true
            }
        }
        this.formEl.renderForm()
        this.formEl.clearFormData()
        this.formEl.setFormData(this._data)

        const inputs = this.formEl.querySelectorAll('[scope]')
        for (let input of inputs) {
            const inputEl = input as Input
            inputEl.onChanged = this.onInputChanged
        }
    }

    private async onInputChanged() {
        const data = await this.formEl.getFormData()
        await this.onCustomInputChanged(data);
    }

    async onCustomInputChanged(data: IData) {
    }

    async init() {
        super.init()
        this.onInputChanged = this.onInputChanged.bind(this);
        const dataSchema = this.getAttribute('dataSchema', true);
        this._dataSchema = dataSchema;
        const uiSchema = this.getAttribute('uiSchema', true);
        this._uiSchema = uiSchema;
        const options = this.getAttribute('options', true, {})
        this.data = {
            options
        }
    }

    render() {
        return (
            <i-panel id='pnlForm'>
                <i-form id='formEl'></i-form>
            </i-panel>
        )
    }
}
