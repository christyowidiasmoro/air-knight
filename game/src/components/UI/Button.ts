/**
 * UIButton - Interactive button component with game-optimized styling
 * Extends UIComponent with button-specific functionality and event handling
 */

import { UIComponent } from './UIComponent';
import { UIComponentConfig, UIPosition, UISize } from '../../types/ui';

export type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'danger';
export type ButtonSize = 'small' | 'medium' | 'large';

export interface UIButtonConfig extends Omit<UIComponentConfig, 'tagName'> {
  text: string;
  variant?: ButtonVariant;
  buttonSize?: ButtonSize;
  disabled?: boolean;
  onClick?: (event: MouseEvent) => void;
  onHover?: (event: MouseEvent) => void;
  onFocus?: (event: FocusEvent) => void;
}

/**
 * Interactive button component optimized for game UI
 */
export class UIButton extends UIComponent {
  private _text: string;
  private _variant: ButtonVariant;
  private _buttonSize: ButtonSize;
  private _disabled: boolean;
  private _onClick?: (event: MouseEvent) => void;
  private _onHover?: (event: MouseEvent) => void;
  private _onFocus?: (event: FocusEvent) => void;

  constructor(config: UIButtonConfig) {
    // Convert to UIComponentConfig and ensure button element
    const componentConfig: UIComponentConfig = {
      ...config,
      tagName: 'button',
      className: UIButton.buildClassName(config.variant, config.buttonSize, config.className)
    };

    super(componentConfig);

    this._text = config.text;
    this._variant = config.variant || 'primary';
    this._buttonSize = config.buttonSize || 'medium';
    this._disabled = config.disabled || false;
    
    // Event handlers (using conditional assignment to avoid undefined issues)
    if (config.onClick) {
      this._onClick = config.onClick;
    }
    if (config.onHover) {
      this._onHover = config.onHover;
    }
    if (config.onFocus) {
      this._onFocus = config.onFocus;
    }

    this.initializeButton();
  }

  // Getters and setters
  get text(): string {
    return this._text;
  }

  set text(value: string) {
    this._text = value;
    this.updateButtonText();
  }

  get variant(): ButtonVariant {
    return this._variant;
  }

  set variant(value: ButtonVariant) {
    this._variant = value;
    this.updateButtonClasses();
  }

  get buttonSize(): ButtonSize {
    return this._buttonSize;
  }

  set buttonSize(value: ButtonSize) {
    this._buttonSize = value;
    this.updateButtonClasses();
  }

  get disabled(): boolean {
    return this._disabled;
  }

  set disabled(value: boolean) {
    this._disabled = value;
    this.updateDisabledState();
  }

  /**
   * Initialize button-specific properties and events
   */
  private initializeButton(): void {
    const button = this._element as HTMLButtonElement;
    
    // Set initial content and state
    this.updateButtonText();
    this.updateDisabledState();
    
    // Add ARIA attributes for accessibility
    button.setAttribute('role', 'button');
    button.setAttribute('type', 'button');
    
    // Setup event handlers
    this.setupButtonEvents();
  }

  /**
   * Setup button-specific event handlers
   */
  private setupButtonEvents(): void {
    // Click handler
    if (this._onClick) {
      this.addEventListener('click', this._onClick as EventListener);
    }

    // Hover handlers
    if (this._onHover) {
      this.addEventListener('mouseenter', this._onHover as EventListener);
      this.addEventListener('mouseleave', this._onHover as EventListener);
    }

    // Focus handlers
    if (this._onFocus) {
      this.addEventListener('focus', this._onFocus as EventListener);
      this.addEventListener('blur', this._onFocus as EventListener);
    }

    // Keyboard accessibility
    this.addEventListener('keydown', this.handleKeyDown.bind(this) as EventListener);

    // Touch optimization for mobile
    this.addEventListener('touchstart', this.handleTouchStart.bind(this) as EventListener);
    this.addEventListener('touchend', this.handleTouchEnd.bind(this) as EventListener);
  }

  /**
   * Handle keyboard navigation
   */
  private handleKeyDown(event: KeyboardEvent): void {
    if (this._disabled) return;

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (this._onClick) {
        this._onClick(event as any);
      }
    }
  }

  /**
   * Handle touch start for visual feedback
   */
  private handleTouchStart(event: TouchEvent): void {
    if (this._disabled) return;
    this._element.classList.add('active');
  }

  /**
   * Handle touch end
   */
  private handleTouchEnd(event: TouchEvent): void {
    this._element.classList.remove('active');
  }

  /**
   * Update button text content
   */
  private updateButtonText(): void {
    this._element.textContent = this._text;
  }

  /**
   * Update button CSS classes based on variant and size
   */
  private updateButtonClasses(): void {
    this._element.className = UIButton.buildClassName(this._variant, this._buttonSize, this._className);
  }

  /**
   * Update disabled state
   */
  private updateDisabledState(): void {
    const button = this._element as HTMLButtonElement;
    button.disabled = this._disabled;
    button.setAttribute('aria-disabled', this._disabled.toString());
    
    if (this._disabled) {
      this.setInteractive(false);
    } else {
      this.setInteractive(this._isInteractive);
    }
  }

  /**
   * Set click handler
   */
  setOnClick(handler: (event: MouseEvent) => void): void {
    if (this._onClick) {
      this.removeEventListener('click', this._onClick as EventListener);
    }
    this._onClick = handler;
    this.addEventListener('click', handler as EventListener);
  }

  /**
   * Set hover handler
   */
  setOnHover(handler: (event: MouseEvent) => void): void {
    if (this._onHover) {
      this.removeEventListener('mouseenter', this._onHover as EventListener);
      this.removeEventListener('mouseleave', this._onHover as EventListener);
    }
    this._onHover = handler;
    this.addEventListener('mouseenter', handler as EventListener);
    this.addEventListener('mouseleave', handler as EventListener);
  }

  /**
   * Set focus handler
   */
  setOnFocus(handler: (event: FocusEvent) => void): void {
    if (this._onFocus) {
      this.removeEventListener('focus', this._onFocus as EventListener);
      this.removeEventListener('blur', this._onFocus as EventListener);
    }
    this._onFocus = handler;
    this.addEventListener('focus', handler as EventListener);
    this.addEventListener('blur', handler as EventListener);
  }

  /**
   * Build CSS class string based on configuration
   */
  private static buildClassName(
    variant: ButtonVariant = 'primary',
    size: ButtonSize = 'medium',
    customClassName?: string
  ): string {
    const classes = ['game-button'];

    // Add variant class
    switch (variant) {
      case 'secondary':
        classes.push('game-button-secondary');
        break;
      case 'accent':
        classes.push('game-button-accent');
        break;
      case 'danger':
        classes.push('game-button-danger');
        break;
      case 'primary':
      default:
        // Primary styling is already in base game-button class
        break;
    }

    // Add size class
    switch (size) {
      case 'small':
        classes.push('text-sm', 'px-3', 'py-1', 'min-w-[36px]', 'min-h-[36px]');
        break;
      case 'large':
        classes.push('text-lg', 'px-6', 'py-3', 'min-w-[52px]', 'min-h-[52px]');
        break;
      case 'medium':
      default:
        // Medium styling is already in base game-button class
        break;
    }

    // Add custom classes if provided
    if (customClassName) {
      classes.push(customClassName);
    }

    return classes.join(' ');
  }

  /**
   * Create a button with preset configurations
   */
  static createPreset(
    preset: 'menu' | 'action' | 'confirm' | 'cancel' | 'close',
    config: Omit<UIButtonConfig, 'text' | 'variant' | 'buttonSize'>
  ): UIButton {
    const presets: Record<typeof preset, Pick<UIButtonConfig, 'text' | 'variant' | 'buttonSize'>> = {
      menu: {
        text: 'Menu',
        variant: 'primary',
        buttonSize: 'medium'
      },
      action: {
        text: 'Action',
        variant: 'accent',
        buttonSize: 'medium'
      },
      confirm: {
        text: 'Confirm',
        variant: 'primary',
        buttonSize: 'medium'
      },
      cancel: {
        text: 'Cancel',
        variant: 'secondary',
        buttonSize: 'medium'
      },
      close: {
        text: '×',
        variant: 'danger',
        buttonSize: 'small'
      }
    };

    return new UIButton({
      ...config,
      ...presets[preset]
    });
  }

  /**
   * Override destroy to clean up button-specific resources
   */
  destroy(): void {
    // Clean up button-specific event handlers
    if (this._onClick) {
      this.removeEventListener('click', this._onClick as EventListener);
    }
    if (this._onHover) {
      this.removeEventListener('mouseenter', this._onHover as EventListener);
      this.removeEventListener('mouseleave', this._onHover as EventListener);
    }
    if (this._onFocus) {
      this.removeEventListener('focus', this._onFocus as EventListener);
      this.removeEventListener('blur', this._onFocus as EventListener);
    }

    super.destroy();
  }
}