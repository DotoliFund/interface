import { G, Path, Svg } from 'react-native-svg'

// eslint-disable-next-line no-relative-import-paths/no-relative-import-paths
import { createIcon } from '../factories/createIcon'

export const [Check, AnimatedCheck] = createIcon({
  name: 'Check',
  getIcon: (props) => (
    <Svg viewBox="0 0 16 16" {...props}>
      <G stroke="currentColor" fill="none" strokeWidth="1" fillRule="evenodd">
        <G transform="translate(2.5, 4)" fill={'currentColor' ?? '#9B9B9B'} fillRule="nonzero">
          <Path d="M3.55465821,8 L3.55845321,8 C3.81525468,8 4.06231429,7.90333333 4.24468713,7.73073333 L10.7152208,1.57625328 C11.0949264,1.21600661 11.0949264,0.630565273 10.7152208,0.270319937 C10.3358589,-0.0901993995 9.72233481,-0.0901067328 9.34311041,0.270598603 L3.5641182,5.76674665 L1.66220743,3.9297133 C1.28548552,3.56584663 0.671967663,3.5625933 0.290128011,3.9193333 C-0.0925957655,4.27689997 -0.097102321,4.86150664 0.27920159,5.22497331 L2.86726929,7.7248 C3.04881026,7.9002 3.29572549,7.99906667 3.55465821,8 Z" />
        </G>
      </G>
    </Svg>
  ),
  defaultFill: '#9B9B9B',
})