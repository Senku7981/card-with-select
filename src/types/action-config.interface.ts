interface ActionConfig {
    name: string;
    icon: string;
    title: string;
    toggle?: boolean;
    action?: (data: unknown) => void;
}

export type { ActionConfig };
