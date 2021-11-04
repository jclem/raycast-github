import {ColorLike, ImageLike} from '@raycast/api'

export default function icon(
  iconBase: string,
  tintColor?: ColorLike | null
): ImageLike {
  return {
    source: {
      light: `icons/${iconBase}.png`,
      dark: `icons/${iconBase}@dark.png`
    },
    tintColor: tintColor ?? undefined
  }
}
