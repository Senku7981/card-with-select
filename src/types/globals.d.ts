// Интерфейс для нативного кастомного select
interface NativeSelectOption {
    id: string;
    text: string;
    selected?: boolean;
}

interface NativeSelectConfig {
    placeholder?: string;
    searchEnabled?: boolean;
    loadingText?: string;
    noResultsText?: string;
    searchPlaceholder?: string;
}
