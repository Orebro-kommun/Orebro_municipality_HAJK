import React from "react";

const menuViewHoc = MenuComponent =>
  class WithMenuFunctionality extends React.Component {
    state = {
      activeMenuSection: this.props.options.menuConfig.menu,
      isOverlayMenuOpen: false
    };

    constructor(props) {
      super(props);

      this.props.options.menuConfig.menu.forEach(menuItem => {
        this.setParentAndContainingMenu(
          menuItem,
          this.props.options.menuConfig.menu,
          undefined
        );
      });
      this.bindSubscriptions();
    }

    closeOverlayMenu = () => {
      this.setState({ isOverlayMenuOpen: false });
    };

    openOverlayMenu = () => {
      this.setState({ isOverlayMenuOpen: true });
    };

    setParentAndContainingMenu(menuItem, containingMenu, parent) {
      menuItem.parent = parent;
      menuItem.containingMenu = containingMenu;

      if (menuItem.menu && menuItem.menu.length > 0) {
        menuItem.menu.forEach(subMenuItem => {
          this.setParentAndContainingMenu(subMenuItem, menuItem.menu, menuItem);
        });
      }
    }

    getSubMenu = title => {
      var menuItem = this.state.activeMenuSection.find(menuItem => {
        return menuItem.title === title;
      });
      return menuItem.menu;
    };

    bindSubscriptions = () => {
      const { localObserver } = this.props;
      localObserver.subscribe("show-containing-menu", containingMenu => {
        this.setState({ activeMenuSection: containingMenu });
      });

      localObserver.subscribe("cascade-clicked", item => {
        var activeMenuSection = this.getSubMenu(item.title);
        this.setState({ activeMenuSection: activeMenuSection });
      });

      localObserver.subscribe("document-clicked", item => {
        this.closeOverlayMenu();
        localObserver.publish("show-document-window", item);
      });

      localObserver.subscribe("link-clicked", item => {
        window.open(item.link, "_blank");
      });

      localObserver.subscribe("maplink-clicked", item => {
        localObserver.publish("fly-to", item.maplink);
      });
    };

    render() {
      const { localObserver, options } = this.props;
      const { activeMenuSection, isOverlayMenuOpen } = this.state;
      return (
        <MenuComponent
          removeMapBlur={this.removeMapBlur}
          addMapBlur={this.addMapBlur}
          getMenuItem={this.getMenuItem}
          closeOverlayMenu={this.closeOverlayMenu}
          openOverlayMenu={this.openOverlayMenu}
          options={options}
          activeMenuSection={activeMenuSection}
          localObserver={localObserver}
          isOverlayMenuOpen={isOverlayMenuOpen}
        ></MenuComponent>
      );
    }
  };

export default menuViewHoc;