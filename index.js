const { Plugin } = require('powercord/entities');
const { React, getModule, i18n: {Messages} } = require('powercord/webpack');
const { inject, uninject } = require('powercord/injector');
const { findInReactTree } = require('powercord/util');
const { open } = require("powercord/modal");

const Reasons = require('./Reasons');
const Settings = require('./Settings')

module.exports = class ReportMessage extends Plugin {
    async startPlugin() {
        const getCurrentUser = await getModule([ 'getCurrentUser' ]);
        const currentUser = getCurrentUser.getCurrentUser();
        
        const { isFriend } = await getModule(['isFriend']);

        powercord.api.settings.registerSettings(this.entityID, {
            category: this.entityID,
            label: 'Report Messages',
            render: Settings
        });

        const Menu = await getModule(['MenuItem']);
        const MessageContextMenu = await getModule(
          (m) => m?.default?.displayName === "MessageContextMenu"
        );
        const { MenuItemColor } = await getModule([ "MenuItemColor" ]);
        inject("rm-contextmenu", MessageContextMenu, "default", (args, res) => {
            if (!args[0]?.message || !res?.props?.children) return res;

            if (this.settings.get("who-safe") == "Myself" &&
                args[0].message.author.id == currentUser.id
            ) return res;

            if (this.settings.get("who-safe") == "Friends" && (
                isFriend(args[0].message.author.id) ||
                args[0].message.author.id == currentUser.id )
            ) return res;

            const rmButton = React.createElement(Menu.MenuItem, {
                id: "report-message-btn",
                label: Messages.REPORT_MESSAGE_MENU_OPTION,
                color: MenuItemColor.DANGER,
                action: () => open(() => React.createElement(Reasons, {message: args[0].message}))
            });

            const groupPointer = findInReactTree(res.props.children[2].props.children, child => child.props && child.props.id === 'copy-link');
            const mainGroup = res.props.children.find(child => child.props.children && child.props.children.includes(groupPointer));
            if (mainGroup) {
                if (!Array.isArray(mainGroup.props.children)) {
                    mainGroup.props.children = [mainGroup.props.children];
                }

                mainGroup.props.children.splice(12, 0, rmButton);
            }

            return res;
        });

        MessageContextMenu.default.displayName = 'MessageContextMenu';
    }

    pluginWillUnload() {
        uninject("rm-contextmenu");
        powercord.api.settings.unregisterSettings(this.entityID)
    }
}
