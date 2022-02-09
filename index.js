const { Plugin } = require('powercord/entities');
const { React, getModule, i18n: { Messages } } = require('powercord/webpack');
const { inject, uninject } = require('powercord/injector');
const { findInReactTree } = require('powercord/util');
const { open } = require('powercord/modal');

const Reasons = require('./Reasons');
const Settings = require('./Settings');

module.exports = class ReportMessage extends Plugin {
    async startPlugin() {
        let { isFriend } = await getModule(['isFriend']);

        powercord.api.settings.registerSettings(this.entityID, {
            category: this.entityID,
            label: 'Report Messages',
            render: Settings
        });
        this.__injectContextMenu(isFriend);
    }

    async __injectContextMenu(isFriend) {
      this.lazyPatchContextMenu('MessageContextMenu', async (MessageContextMenu) => {
        const getCurrentUser = await getModule([ 'getCurrentUser' ]);
        const currentUser = getCurrentUser.getCurrentUser();
        const Menu = await getModule([ 'MenuItem' ]);
        const { MenuItemColor } = await getModule([ 'MenuItemColor' ]);
        inject('rm-contextmenu', MessageContextMenu, 'default', (args, res) => {
          if (!args[0]?.message || !res?.props?.children) return res;

          const { id: author_id } = args[0].message.author;

          if (['me', 'friends'].includes(this.settings.get('who-safe')) && author_id === currentUser.id) return res;
          if (this.settings.get('who-safe') === 'friends' && isFriend(author_id)) return res;

          const rmButton = React.createElement(Menu.MenuItem, {
              id: 'report',
              label: Messages.REPORT_MESSAGE_MENU_OPTION,
              color: MenuItemColor.DANGER,
              action: () => open(() => React.createElement(Reasons, { args }))
          });

          const groupPointer = findInReactTree(res.props.children, child => child?.props?.children && findInReactTree(child.props.children, c => c?.props?.id === 'copy-link'));
          const mainGroup = res.props.children.find(child => child?.props?.children && child === groupPointer);

          // console.log(res.props.children[2].props.children); // Used to figure out placement of button

          if (mainGroup) {
              if (!Array.isArray(mainGroup.props.children)) {
                  mainGroup.props.children = [ mainGroup.props.children ];
              }

              mainGroup.props.children.splice(14, 0, rmButton);
          }

          return res;
        })
        MessageContextMenu.default.displayName = 'MessageContextMenu';
      });
    }

    async lazyPatchContextMenu(displayName, patch) {
      const filter = m => m.default && m.default.displayName === displayName
      const m = getModule(filter, false)
      if (m) patch(m)
      else {
        const module = getModule([ 'openContextMenuLazy' ], false)
        inject('rm-lazy-contextmenu', module, 'openContextMenuLazy', args => {
          const lazyRender = args[1]
          args[1] = async () => {
            const render = await lazyRender(args[0])
  
            return (config) => {
              const menu = render(config)
              if (menu?.type?.displayName === displayName && patch) {
                uninject('rm-lazy-contextmenu')
                patch(getModule(filter, false))
                patch = false
              }
              return menu
            }
          }
          return args
        }, true)
      }
    }

    pluginWillUnload() {
        uninject('rm-contextmenu');
        uninject('rm-lazy-contextmenu');
        powercord.api.settings.unregisterSettings(this.entityID)
    }
}
