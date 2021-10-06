const { React } = require('powercord/webpack')
const { RadioGroup } = require('powercord/components/settings')

module.exports = ({ getSetting, updateSetting }) => <>
    <RadioGroup
        onChange={(e) => updateSetting('who-safe', e.value)}
        value={getSetting('who-safe', 'No One')}
        options={[
          {
            name: 'No one is Safe',
            desc: 'Everyone is reportable',
            value: 'No One',
            color: "hsl(139, calc(var(--saturation-factor, 1) * 47.3%), 43.9%)"
          },
          {
            name: 'Keep me safe',
            desc: 'Everyone but me is reportable',
            value: 'Myself',
            color: "hsl(37, calc(var(--saturation-factor, 1) * 81.2%), 43.9%)"
          },
          {
            name: 'My Friends are nice',
            desc: 'Everyone but my friends and me are reportable.',
            value: 'Friends',
            color: "hsl(37, calc(var(--saturation-factor, 1) * 81.2%), 43.9%)"
          }
        ]}
    >Safe Reporting</RadioGroup>
</>
