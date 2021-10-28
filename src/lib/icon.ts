import {ImageLike} from '@raycast/api'

export default function icon(iconBase: string): ImageLike {
  return {
    source: {
      light: `icons/${iconBase}.png`,
      dark: `icons/${iconBase}@dark.png`
    }
  }
}
