// Глобальные типы для jQuery
declare const $: any;
declare const jQuery: any;

// Интерфейс для Select2
interface Select2Options {
    placeholder?: string;
    ajax?: {
        delay?: number;
        url?: string;
        data?: (params: any) => any;
    };
}

interface JQueryStatic {
    ajax(options: any): Promise<any>;
    (selector: any): {
        select2(options?: Select2Options): any;
        append(option: any): any;
        trigger(event: string): any;
        val(): any;
    };
}
