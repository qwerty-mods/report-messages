const { Plugin } = require('powercord/entities');
const { React, getModule } = require('powercord/webpack');
const { inject, uninject } = require('powercord/injector');
const { findInReactTree } = require('powercord/util');
const { open } = require("powercord/modal");

const Reasons = require('./Reasons');

module.exports = class ReportMessage extends Plugin {
    async startPlugin() {
        const Menu = await getModule(['MenuItem']);
		const MessageContextMenu = await getModule(
			(m) => m?.default?.displayName === "MessageContextMenu"
		);
		inject("rm-contextmenu", MessageContextMenu, "default", (args, res) => {
			if (!args[0]?.message || !res?.props?.children) return res;

            const rmButton = React.createElement(Menu.MenuItem, {
                id: "report-message-btn",
                label: "Report Message",
                action: () => open(() => React.createElement(Reasons, {message: args[0].message}))
            });

            const devmodeItem = findInReactTree(res.props.children, child => child.props && child.props.id === 'devmode-copy-id');
            const developerGroup = res.props.children.find(child => child.props && child.props.children === devmodeItem);
            if (developerGroup) {
                if (!Array.isArray(developerGroup.props.children)) {
                    developerGroup.props.children = [developerGroup.props.children];
                }

                developerGroup.props.children.push(rmButton);
            } else {
                res.props.children.push([React.createElement(Menu.MenuSeparator), React.createElement(Menu.MenuGroup, {}, rmButton)]);
            }
            return res;
        });

        MessageContextMenu.default.displayName = 'MessageContextMenu';
    }

    pluginWillUnload() {
        uninject("rm-contextmenu");
    }
}