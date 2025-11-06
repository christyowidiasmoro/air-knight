/**
 * UIMenu - Interactive menu component for game navigation
 * Extends UIPanel with menu-specific functionality and keyboard navigation
 */

import { UIPanel, UIPanelConfig } from './Panel';
import { UIButton, UIButtonConfig } from './Button';
import { IUIComponent } from '../../types/ui';

export type MenuOrientation = 'vertical' | 'horizontal';
export type MenuItemType = 'button' | 'separator' | 'submenu';

export interface UIMenuItemConfig {
  id: string;
  type: MenuItemType;
  text?: string;
  icon?: string;
  shortcut?: string;
  disabled?: boolean;
  onClick?: () => void;
  submenu?: UIMenuItemConfig[];
}

export interface UIMenuConfig extends Omit<UIPanelConfig, 'title' | 'closable'> {
  orientation?: MenuOrientation;
  items: UIMenuItemConfig[];
  autoClose?: boolean;
  showShortcuts?: boolean;
  onItemSelect?: (itemId: string) => void;
}

/**
 * Interactive menu component for game navigation and actions
 * Supports keyboard navigation, submenus, and various item types
 */
export class UIMenu extends UIPanel {
  private _orientation: MenuOrientation;
  private _items: UIMenuItemConfig[];
  private _autoClose: boolean;
  private _showShortcuts: boolean;
  private _onItemSelect?: (itemId: string) => void;
  
  private _menuItems: Map<string, HTMLElement> = new Map();
  private _menuButtons: Map<string, UIButton> = new Map();
  private _submenus: Map<string, UIMenu> = new Map();
  private _selectedIndex: number = -1;
  private _isKeyboardNavigation: boolean = false;

  constructor(config: UIMenuConfig) {
    // Convert to UIPanelConfig
    const panelConfig: UIPanelConfig = {
      ...config,
      theme: config.theme || 'light',
      panelSize: config.panelSize || 'compact',
      className: UIMenu.buildMenuClassName(config.orientation, config.className)
    };

    super(panelConfig);

    this._orientation = config.orientation || 'vertical';
    this._items = config.items || [];
    this._autoClose = config.autoClose !== false; // default true
    this._showShortcuts = config.showShortcuts !== false; // default true
    
    // Event handler (using conditional assignment to avoid undefined issues)
    if (config.onItemSelect) {
      this._onItemSelect = config.onItemSelect;
    }

    this.initializeMenu();
  }

  // Getters and setters
  get orientation(): MenuOrientation {
    return this._orientation;
  }

  set orientation(value: MenuOrientation) {
    this._orientation = value;
    this.updateMenuClasses();
    this.rebuildMenu();
  }

  get items(): readonly UIMenuItemConfig[] {
    return this._items;
  }

  get autoClose(): boolean {
    return this._autoClose;
  }

  set autoClose(value: boolean) {
    this._autoClose = value;
  }

  get showShortcuts(): boolean {
    return this._showShortcuts;
  }

  set showShortcuts(value: boolean) {
    this._showShortcuts = value;
    this.rebuildMenu();
  }

  get selectedIndex(): number {
    return this._selectedIndex;
  }

  /**
   * Initialize menu structure and behavior
   */
  private initializeMenu(): void {
    // Setup keyboard navigation
    this.setupKeyboardNavigation();
    
    // Build menu items
    this.buildMenuItems();

    // Setup ARIA attributes for menu
    this._element.setAttribute('role', 'menu');
    this._element.setAttribute('aria-orientation', this._orientation);
  }

  /**
   * Setup keyboard navigation for the menu
   */
  private setupKeyboardNavigation(): void {
    this._element.setAttribute('tabindex', '0');
    
    this.addEventListener('keydown', this.handleKeyDown.bind(this) as EventListener);
    this.addEventListener('focus', this.handleFocus.bind(this) as EventListener);
    this.addEventListener('blur', this.handleBlur.bind(this) as EventListener);
  }

  /**
   * Build all menu items from configuration
   */
  private buildMenuItems(): void {
    this.clearMenuItems();
    
    this._items.forEach((itemConfig, index) => {
      const menuItem = this.createMenuItem(itemConfig, index);
      if (menuItem) {
        this.contentElement.appendChild(menuItem);
        this._menuItems.set(itemConfig.id, menuItem);
      }
    });
  }

  /**
   * Create a single menu item element
   */
  private createMenuItem(config: UIMenuItemConfig, index: number): HTMLElement | null {
    switch (config.type) {
      case 'button':
        return this.createButtonItem(config, index);
      case 'separator':
        return this.createSeparatorItem(config);
      case 'submenu':
        return this.createSubmenuItem(config, index);
      default:
        console.warn(`Unknown menu item type: ${config.type}`);
        return null;
    }
  }

  /**
   * Create a button menu item
   */
  private createButtonItem(config: UIMenuItemConfig, index: number): HTMLElement {
    const itemElement = document.createElement('div');
    itemElement.className = 'menu-item menu-item-button';
    itemElement.setAttribute('role', 'menuitem');
    itemElement.setAttribute('tabindex', '-1');
    
    if (config.disabled) {
      itemElement.classList.add('menu-item-disabled');
      itemElement.setAttribute('aria-disabled', 'true');
    }

    // Create button content
    const content = this.createItemContent(config);
    itemElement.appendChild(content);

    // Setup click handler
    if (!config.disabled && config.onClick) {
      itemElement.addEventListener('click', () => {
        config.onClick!();
        this.handleItemSelect(config.id);
      });
    }

    // Setup hover handlers
    itemElement.addEventListener('mouseenter', () => {
      this.selectItem(index);
    });

    return itemElement;
  }

  /**
   * Create a separator menu item
   */
  private createSeparatorItem(config: UIMenuItemConfig): HTMLElement {
    const itemElement = document.createElement('div');
    itemElement.className = 'menu-item menu-separator';
    itemElement.setAttribute('role', 'separator');
    itemElement.setAttribute('aria-hidden', 'true');
    
    return itemElement;
  }

  /**
   * Create a submenu menu item
   */
  private createSubmenuItem(config: UIMenuItemConfig, index: number): HTMLElement {
    const itemElement = document.createElement('div');
    itemElement.className = 'menu-item menu-item-submenu';
    itemElement.setAttribute('role', 'menuitem');
    itemElement.setAttribute('tabindex', '-1');
    itemElement.setAttribute('aria-haspopup', 'true');
    itemElement.setAttribute('aria-expanded', 'false');

    // Create item content with submenu indicator
    const content = this.createItemContent(config);
    const indicator = document.createElement('span');
    indicator.className = 'submenu-indicator';
    indicator.textContent = this._orientation === 'horizontal' ? '▼' : '▶';
    content.appendChild(indicator);
    itemElement.appendChild(content);

    // Create submenu
    if (config.submenu && config.submenu.length > 0) {
      const submenuConfig: UIMenuConfig = {
        id: `${config.id}-submenu`,
        position: { x: 0, y: 0, anchor: 'px', origin: 'top-left' },
        size: { width: 200, height: 'auto' as any }, // Will be calculated
        orientation: 'vertical',
        items: config.submenu,
        theme: this.theme,
        panelSize: this.panelSize,
        autoClose: this._autoClose,
        showShortcuts: this._showShortcuts,
        isVisible: false
      };

      const submenu = new UIMenu(submenuConfig);
      this._submenus.set(config.id, submenu);
      
      // Mount submenu but keep it hidden
      submenu.mount(document.body);
      submenu.hide();
    }

    // Setup submenu interaction
    itemElement.addEventListener('mouseenter', () => {
      this.selectItem(index);
      this.showSubmenu(config.id);
    });

    itemElement.addEventListener('mouseleave', () => {
      // Delay hiding submenu to allow mouse to move to submenu
      setTimeout(() => {
        if (!this.isMouseOverSubmenu(config.id)) {
          this.hideSubmenu(config.id);
        }
      }, 100);
    });

    return itemElement;
  }

  /**
   * Create content for a menu item (text, icon, shortcut)
   */
  private createItemContent(config: UIMenuItemConfig): HTMLElement {
    const content = document.createElement('div');
    content.className = 'menu-item-content';

    // Icon
    if (config.icon) {
      const icon = document.createElement('span');
      icon.className = 'menu-item-icon';
      icon.textContent = config.icon;
      content.appendChild(icon);
    }

    // Text
    if (config.text) {
      const text = document.createElement('span');
      text.className = 'menu-item-text';
      text.textContent = config.text;
      content.appendChild(text);
    }

    // Shortcut
    if (config.shortcut && this._showShortcuts) {
      const shortcut = document.createElement('span');
      shortcut.className = 'menu-item-shortcut';
      shortcut.textContent = config.shortcut;
      content.appendChild(shortcut);
    }

    return content;
  }

  /**
   * Handle keyboard navigation
   */
  private handleKeyDown(event: KeyboardEvent): void {
    this._isKeyboardNavigation = true;
    
    switch (event.key) {
      case 'ArrowDown':
        if (this._orientation === 'vertical') {
          this.selectNext();
          event.preventDefault();
        }
        break;
        
      case 'ArrowUp':
        if (this._orientation === 'vertical') {
          this.selectPrevious();
          event.preventDefault();
        }
        break;
        
      case 'ArrowRight':
        if (this._orientation === 'horizontal') {
          this.selectNext();
          event.preventDefault();
        } else {
          this.openSubmenu();
          event.preventDefault();
        }
        break;
        
      case 'ArrowLeft':
        if (this._orientation === 'horizontal') {
          this.selectPrevious();
          event.preventDefault();
        } else {
          this.closeSubmenu();
          event.preventDefault();
        }
        break;
        
      case 'Enter':
      case ' ':
        this.activateSelectedItem();
        event.preventDefault();
        break;
        
      case 'Escape':
        this.close();
        event.preventDefault();
        break;
        
      case 'Home':
        this.selectFirst();
        event.preventDefault();
        break;
        
      case 'End':
        this.selectLast();
        event.preventDefault();
        break;
    }
  }

  /**
   * Handle focus
   */
  private handleFocus(): void {
    if (this._selectedIndex === -1) {
      this.selectFirst();
    }
  }

  /**
   * Handle blur
   */
  private handleBlur(): void {
    this._isKeyboardNavigation = false;
  }

  /**
   * Select next menu item
   */
  private selectNext(): void {
    const selectableItems = this.getSelectableItems();
    if (selectableItems.length === 0) return;

    const currentIndex = this._selectedIndex;
    const nextIndex = currentIndex < selectableItems.length - 1 ? currentIndex + 1 : 0;
    const nextItemIndex = selectableItems[nextIndex];
    if (nextItemIndex !== undefined) {
      this.selectItem(nextItemIndex);
    }
  }

  /**
   * Select previous menu item
   */
  private selectPrevious(): void {
    const selectableItems = this.getSelectableItems();
    if (selectableItems.length === 0) return;

    const currentIndex = this._selectedIndex;
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : selectableItems.length - 1;
    const prevItemIndex = selectableItems[prevIndex];
    if (prevItemIndex !== undefined) {
      this.selectItem(prevItemIndex);
    }
  }

  /**
   * Select first menu item
   */
  private selectFirst(): void {
    const selectableItems = this.getSelectableItems();
    if (selectableItems.length > 0) {
      const firstItemIndex = selectableItems[0];
      if (firstItemIndex !== undefined) {
        this.selectItem(firstItemIndex);
      }
    }
  }

  /**
   * Select last menu item
   */
  private selectLast(): void {
    const selectableItems = this.getSelectableItems();
    if (selectableItems.length > 0) {
      const lastItemIndex = selectableItems[selectableItems.length - 1];
      if (lastItemIndex !== undefined) {
        this.selectItem(lastItemIndex);
      }
    }
  }

  /**
   * Get indices of selectable items (excluding separators and disabled items)
   */
  private getSelectableItems(): number[] {
    return this._items
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => item.type !== 'separator' && !item.disabled)
      .map(({ index }) => index);
  }

  /**
   * Select menu item by index
   */
  private selectItem(index: number): void {
    // Clear previous selection
    if (this._selectedIndex >= 0) {
      const prevItem = this.getMenuItemElement(this._selectedIndex);
      if (prevItem) {
        prevItem.classList.remove('selected');
        prevItem.setAttribute('aria-selected', 'false');
      }
    }

    this._selectedIndex = index;

    // Set new selection
    if (index >= 0) {
      const newItem = this.getMenuItemElement(index);
      if (newItem) {
        newItem.classList.add('selected');
        newItem.setAttribute('aria-selected', 'true');
        newItem.focus();
      }
    }
  }

  /**
   * Get menu item element by index
   */
  private getMenuItemElement(index: number): HTMLElement | null {
    const item = this._items[index];
    return item ? this._menuItems.get(item.id) || null : null;
  }

  /**
   * Activate the currently selected menu item
   */
  private activateSelectedItem(): void {
    if (this._selectedIndex >= 0) {
      const item = this._items[this._selectedIndex];
      if (item && !item.disabled) {
        switch (item.type) {
          case 'button':
            if (item.onClick) {
              item.onClick();
              this.handleItemSelect(item.id);
            }
            break;
          case 'submenu':
            this.toggleSubmenu(item.id);
            break;
        }
      }
    }
  }

  /**
   * Handle item selection
   */
  private handleItemSelect(itemId: string): void {
    if (this._onItemSelect) {
      this._onItemSelect(itemId);
    }

    if (this._autoClose) {
      this.close();
    }
  }

  /**
   * Show submenu
   */
  private showSubmenu(itemId: string): void {
    const submenu = this._submenus.get(itemId);
    const itemElement = this._menuItems.get(itemId);
    
    if (submenu && itemElement) {
      // Position submenu relative to item
      const rect = itemElement.getBoundingClientRect();
      const submenuPosition = this._orientation === 'horizontal'
        ? { x: rect.left, y: rect.bottom }
        : { x: rect.right, y: rect.top };

      submenu.updatePosition(submenuPosition);
      submenu.show();
      
      itemElement.setAttribute('aria-expanded', 'true');
    }
  }

  /**
   * Hide submenu
   */
  private hideSubmenu(itemId: string): void {
    const submenu = this._submenus.get(itemId);
    const itemElement = this._menuItems.get(itemId);
    
    if (submenu && itemElement) {
      submenu.hide();
      itemElement.setAttribute('aria-expanded', 'false');
    }
  }

  /**
   * Toggle submenu visibility
   */
  private toggleSubmenu(itemId: string): void {
    const submenu = this._submenus.get(itemId);
    if (submenu) {
      if (submenu.isVisible) {
        this.hideSubmenu(itemId);
      } else {
        this.showSubmenu(itemId);
      }
    }
  }

  /**
   * Open submenu (for keyboard navigation)
   */
  private openSubmenu(): void {
    if (this._selectedIndex >= 0) {
      const item = this._items[this._selectedIndex];
      if (item && item.type === 'submenu') {
        this.showSubmenu(item.id);
      }
    }
  }

  /**
   * Close submenu (for keyboard navigation)
   */
  private closeSubmenu(): void {
    // Close all submenus
    for (const [itemId] of this._submenus) {
      this.hideSubmenu(itemId);
    }
  }

  /**
   * Check if mouse is over submenu
   */
  private isMouseOverSubmenu(itemId: string): boolean {
    const submenu = this._submenus.get(itemId);
    return submenu ? submenu.element.matches(':hover') : false;
  }

  /**
   * Close menu
   */
  close(): void {
    this.closeSubmenu();
    this.hide();
  }

  /**
   * Update menu items
   */
  updateItems(items: UIMenuItemConfig[]): void {
    this._items = items;
    this.rebuildMenu();
  }

  /**
   * Add menu item
   */
  addItem(item: UIMenuItemConfig, index?: number): void {
    if (index !== undefined) {
      this._items.splice(index, 0, item);
    } else {
      this._items.push(item);
    }
    this.rebuildMenu();
  }

  /**
   * Remove menu item
   */
  removeItem(itemId: string): void {
    const index = this._items.findIndex(item => item.id === itemId);
    if (index >= 0) {
      this._items.splice(index, 1);
      this.rebuildMenu();
    }
  }

  /**
   * Clear all menu items
   */
  private clearMenuItems(): void {
    // Clean up submenus
    for (const submenu of this._submenus.values()) {
      submenu.destroy();
    }
    this._submenus.clear();
    this._menuItems.clear();
    this._menuButtons.clear();

    // Clear content
    while (this.contentElement.firstChild) {
      this.contentElement.removeChild(this.contentElement.firstChild);
    }

    this._selectedIndex = -1;
  }

  /**
   * Rebuild entire menu
   */
  private rebuildMenu(): void {
    this.buildMenuItems();
  }

  /**
   * Update menu CSS classes
   */
  private updateMenuClasses(): void {
    this._element.className = UIMenu.buildMenuClassName(this._orientation, this._className);
    this._element.setAttribute('aria-orientation', this._orientation);
  }

  /**
   * Build CSS class string for menu
   */
  private static buildMenuClassName(
    orientation: MenuOrientation = 'vertical',
    customClassName?: string
  ): string {
    const classes = ['game-menu'];

    // Add orientation class
    if (orientation === 'horizontal') {
      classes.push('game-menu-horizontal');
    } else {
      classes.push('game-menu-vertical');
    }

    // Add custom classes if provided
    if (customClassName) {
      classes.push(customClassName);
    }

    return classes.join(' ');
  }

  /**
   * Create a menu with preset configurations
   */
  static createMenuPreset(
    preset: 'context' | 'dropdown' | 'navbar' | 'sidebar' | 'toolbar',
    config: Omit<UIMenuConfig, 'orientation' | 'theme' | 'panelSize'>
  ): UIMenu {
    const presets: Record<typeof preset, Pick<UIMenuConfig, 'orientation' | 'theme' | 'panelSize' | 'autoClose'>> = {
      context: {
        orientation: 'vertical',
        theme: 'light',
        panelSize: 'compact',
        autoClose: true
      },
      dropdown: {
        orientation: 'vertical',
        theme: 'light',
        panelSize: 'compact',
        autoClose: true
      },
      navbar: {
        orientation: 'horizontal',
        theme: 'dark',
        panelSize: 'normal',
        autoClose: false
      },
      sidebar: {
        orientation: 'vertical',
        theme: 'dark',
        panelSize: 'normal',
        autoClose: false
      },
      toolbar: {
        orientation: 'horizontal',
        theme: 'glass',
        panelSize: 'compact',
        autoClose: false
      }
    };

    return new UIMenu({
      ...config,
      ...presets[preset]
    });
  }

  /**
   * Override destroy to clean up menu-specific resources
   */
  destroy(): void {
    this.clearMenuItems();
    super.destroy();
  }
}