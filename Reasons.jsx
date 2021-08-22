const { React, getModuleByDisplayName, getModule } = require("powercord/webpack");
const { SelectInput, RadioGroup } = require("powercord/components/settings");
const { Modal } = require("powercord/components/modal");
const { close: closeModal } = require("powercord/modal");
const { settings: {FormItem}, FormTitle, Button } = require("powercord/components");

const { report } = getModule([ 'report', 'submitReport' ], false);

const { getChannel } = getModule(["getChannel"], false);

module.exports = class ReportModal extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            reason: 'nsfw'
        }
    }
    
    render() {
        const { message } = this.props;

        const reasons = [
            {name: "Illegal Content", desc: "Child Pornography, solicitation of minors, terrorism, threats of school shootings or criminal activity.", value: 0},
            {name: "Harassment", desc: "Threats, stalking, bullying, sharing of personal information, impersonation or raiding.", value: 1},
            {name: "Spam or Phishing links", desc: "Fake links, invites to servers via bot, malicious links or attachments.", value: 2},
            {name: "Self Harm", desc: "Person is at risk at claiming intent of self-harm.", value: 3},
            {name: "NSFW Content", desc: "Pornography or other adult content in a non-NSFW channel or unwanted DM.", value: 4}
        ];
        return (
            <Modal className="rm-modal">
                <Modal.Header>
                    <FormTitle tag="h4">Report Message Posted By {message.author.username}</FormTitle>
                </Modal.Header>

                <Modal.Content>
                    <RadioGroup
                        onChange={(e) => this.setState({reason: e.value})}
                        value={this.state.reason}
                        options={reasons}
                        required={true}
                        note={`Reports are sent to the Discord Trust & Safety team${getChannel(message.channel_id).guild_id != null ? ' - not the Server Owner' : ''}. Creating false reports and/or spamming the report button may result in a suspension or reporting abilities. Learn more from the Discord Community Guide. Thanks for keeping things safe and sound.`}
                    >Choose a Reason</RadioGroup>
                </Modal.Content>

                <Modal.Footer>
                    <Button
                        color={Button.Colors.BLUE}
                        disabled={typeof(this.state.reason) != "number"}
                        onClick={async () => {                        
                                let data = await report({
                                    channel_id: message.channel_id,
                                    message_id: message.id,
                                    guild_id: message.guild_id,
                                    reason: this.state.reason
                                });

                                console.log(data); // Debug info if something weird happens

                                if (data.ok) {
                                    powercord.api.notices.sendToast('rmToast', {
                                        header: 'report',
                                        content: `Successfully Reported "${message.author.username}"`,
                                        buttons: [
                                        {
                                            text: 'Dismiss',
                                            color: 'green',
                                            look: 'outlined',
                                            onClick: () => powercord.api.notices.closeToast('remountNotif'),
                                        },
                                        ],
                                        timeout: 3e4,
                                    });
                                } else {
                                    powercord.api.notices.sendToast('rmToast', {
                                        header: 'report',
                                        content: `Unsuccessfully Reported "${message.author.username}"`,
                                        buttons: [
                                        {
                                            text: 'Dismiss',
                                            color: 'red',
                                            look: 'outlined',
                                            onClick: () => powercord.api.notices.closeToast('remountNotif'),
                                        },
                                        ],
                                        timeout: 3e4,
                                    });
                                }

                                closeModal()
                            }
                        }
                    >Report</Button>
                    <Button
                        color={Button.Colors.TRANSPARENT}
                        look={Button.Looks.LINK}
                        onClick={closeModal}
                    >Cancel</Button>
                </Modal.Footer>
            </Modal>
        )
    }
}