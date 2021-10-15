const { React } = require('powercord/webpack')
const { RadioGroup } = require('powercord/components/settings')

module.exports = ({ getSetting, updateSetting }) => <>
    <RadioGroup
        onChange={(e) => updateSetting('who-safe', e.value)}
        value={getSetting('who-safe', 'none')}
        options={[
          {
            name: 'No one can escape',
            desc: 'You can report anyone.',
            value: 'none',
            color: 'hsl(139, calc(var(--saturation-factor, 1) * 47.3%), 43.9%)'
          },
          {
            name: 'Keep me safe',
            desc: 'You can report anyone, but yourself.',
            value: 'me',
            color: 'hsl(37, calc(var(--saturation-factor, 1) * 81.2%), 43.9%)'
          },
          {
            name: 'My friends are nice',
            desc: 'You can report anyone but yourself and your friends.',
            value: 'friends',
            color: 'hsl(359, calc(var(--saturation-factor, 1) * 82.6%), 59.4%)'
          }
        ]}
        note='People that you can report.'
    >Safe Reporting</RadioGroup>
</>
