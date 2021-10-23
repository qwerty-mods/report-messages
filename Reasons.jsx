const { React, getModule, getModuleByDisplayName, i18n: { Messages } } = require('powercord/webpack');
const { AsyncComponent, FormTitle, Button } = require('powercord/components');
const { RadioGroup } = require('powercord/components/settings');
const { Modal } = require('powercord/components/modal');
const { close: closeModal } = require('powercord/modal');

const { report } = getModule([ 'report', 'submitReport' ], false);
const { getChannel } = getModule([ 'getDMFromUserId' ], false);

const FormText = AsyncComponent.from(getModuleByDisplayName('FormText'));

module.exports = class ReportModal extends React.PureComponent {
    constructor(props) {
        super(props);

        this.classes = Object.values(getModule([ 'anchorUnderlineOnHover' ], false));
        this.state = {
            reason: 'nsfw'
        }
    }

    render() {
        const { message } = this.props.args[0];
        
        const channel = getChannel(message.channel_id);
        message.guild_id = channel.guild_id;

        const reasons = [
            { name: 'Illegal Content', desc: 'Child Pornography, solicitation of minors, terrorism, threats of school shootings or criminal activity.', value: 0 },
            { name: 'Harassment', desc: 'Threats, stalking, bullying, sharing of personal information, impersonation or raiding.', value: 1 },
            { name: 'Spam or Phishing links', desc: 'Fake links, invites to servers via bot, malicious links or attachments.', value: 2 },
            { name: 'Self Harm', desc: 'Person is at risk at claiming intent of self-harm.', value: 3 },
            { name: 'NSFW Content', desc: 'Pornography or other adult content in a non-NSFW channel or unwanted DM.', value: 4 }
        ];

        return (
            <Modal className='rm-modal'>
                <Modal.Header>
                    <FormTitle tag='h4'>
                        {Messages.REPORT_MESSAGE.format({ name: message.author.username })}
                    </FormTitle>
                </Modal.Header>

                <Modal.Content>
                    <RadioGroup
                        onChange={(e) => this.setState({reason: e.value})}
                        value={this.state.reason}
                        options={reasons}
                    >
                        What is it you're reporting?
                    </RadioGroup>
                    <FormText>
                        Reports are sent to the Discord Trust & Safety team
                        {getChannel(message.channel_id).guild_id && <strong> - not the server owner</strong>}.
                        Creating false reports and/or spamming the report button may result in a suspension of reporting abilities.
                        Learn more from the <a href='https://discord.com/guidelines' className={this.classes.join(' ')} rel='noreferrer noopener' target='_blank'>Discord Community Guidelines</a>.
                        Thanks for keeping things safe and sound.
                    </FormText>
                </Modal.Content>

                <Modal.Footer>
                    <Button
                        color={Button.Colors.BLUE}
                        disabled={typeof this.state.reason !== 'number'}
                        onClick={async () => {
                                let data = await report({
                                    channel_id: message.channel_id,
                                    message_id: message.id,
                                    guild_id: message.guild_id,
                                    reason: this.state.reason
                                });

                                powercord.api.notices.sendToast('rmToast', {
                                    header: 'report',
                                    content: data.ok ? `Reported ${message.author.username}` : `Failed to report ${message.author.username}`,
                                    buttons: [{
                                        text: 'Dismiss',
                                        color: 'green',
                                        look: 'outlined',
                                        onClick: () => powercord.api.notices.closeToast('rmToast')
                                    }],
                                    timeout: 3e4
                                });

                                closeModal();
                            }
                        }
                    >
                        Report
                    </Button>
                    <Button
                        color={Button.Colors.TRANSPARENT}
                        look={Button.Looks.LINK}
                        onClick={closeModal}
                    >
                        Cancel
                    </Button>
                </Modal.Footer>
            </Modal>
        )
    }
}
