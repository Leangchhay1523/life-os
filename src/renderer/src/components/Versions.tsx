import { useState } from 'react'

function Versions(): React.JSX.Element {
  const [versions] = useState(window.electron.process.versions)

  return (
    <ul className="flex items-center space-x-2 bg-surface/80 backdrop-blur-md border border-border rounded-full px-4 py-1.5 text-xs text-muted shadow-sm">
      <li className="pr-2 border-r border-border">Electron v{versions.electron}</li>
      <li className="pr-2 border-r border-border">Chromium v{versions.chrome}</li>
      <li>Node v{versions.node}</li>
    </ul>
  )
}

export default Versions
