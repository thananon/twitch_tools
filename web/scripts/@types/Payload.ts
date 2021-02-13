interface Size {
  width: number
  height: number
}

interface Position {
  x: number
  y: number
}

export interface Payload {
  type: 'image' | 'video'
  src: string
  size: Partial<Size>
  position: Position
}
