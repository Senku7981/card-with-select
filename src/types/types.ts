/**
 * User configuration of Image block tunes. Allows to add custom tunes through the config
 */
export interface ActionConfig {
  /**
   * The name of the tune.
   */
  name: string;

  /**
   * The icon for the tune. Should be an SVG string.
   */
  icon: string;

  /**
   * The title of the tune. This will be displayed in the UI.
   */
  title: string;

  /**
   * An optional flag indicating whether the tune is a toggle (true) or not (false).
   */
  toggle?: boolean;

  /**
   * An optional action function to be executed when the tune is activated.
   */
  action?: (data: unknown) => void;
}

/**
 * CardWithSelectToolData type representing the input and output data format for the card with select tool, including optional custome actions.
 */
export interface CardWithSelectToolData {
  /**
   * Term
   */
  items: EntityType[];
}

/**
 *
 * @description Config supported by Tool
 */
export interface CardWithSelectConfig {
  endpointOne?: string;
  maxEntityQuantity?: number;
  endpoint?: string;
  types?: string;
  titlePlaceholder?: string;
  descriptionPlaceholder?: string;
  additionalRequestData?: object;
  additionalRequestHeaders?: object;
  actions?: ActionConfig[];
}

export interface EntityType {
  title: string;
  description: string;
  entityId: number | string;
  customLink?: string;
  file?: {
    url: string;
    name: string;
    size?: number;
  };
  linkType?: 'article' | 'custom' | 'file';
}
