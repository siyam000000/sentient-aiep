export interface MermaidRendererProps {
  code: string
  className?: string
}

export interface MermaidRendererRef {
  downloadDiagram: () => Promise<boolean>
}

