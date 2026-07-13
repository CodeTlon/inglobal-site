'use client'

import { Component } from 'react'
import ContentEditor from './ContentEditor'

interface Props {
  value: string
  onChange: (v: string) => void
}

interface State {
  hasError: boolean
}

// ponytail: si el editor visual (TipTap) explota con contenido legacy que no
// esperaba, cae acá en vez de tirar abajo todo el form de edición — el HTML
// crudo sigue siendo editable a mano.
export default class ContentEditorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: unknown) {
    console.error('ContentEditor no pudo renderizar, cayendo a textarea plano:', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div>
          <p className="text-xs text-amber-600 mb-1.5">
            El editor visual no pudo cargar este contenido. Podés seguir editando el HTML directamente acá abajo.
          </p>
          <textarea
            className="w-full border border-zinc-200 rounded-md px-3 py-2.5 min-h-[240px] text-sm font-mono text-zinc-900"
            defaultValue={this.props.value}
            onChange={(e) => this.props.onChange(e.target.value)}
          />
        </div>
      )
    }
    return <ContentEditor value={this.props.value} onChange={this.props.onChange} />
  }
}
