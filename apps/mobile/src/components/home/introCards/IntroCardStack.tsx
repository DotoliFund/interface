import { IntroCard, IntroCardProps } from 'src/components/home/introCards/IntroCard'
import { SwipeableCardStack } from 'ui/src/components/swipeablecards/SwipeableCardStack'

export type IntroCardWrapper = IntroCardProps & { onPress?: () => void }

type IntroCardStackProps = {
  cards: IntroCardWrapper[]

  keyExtractor: (card: IntroCardProps) => string
  onSwiped?: (card: IntroCardProps, index: number) => void
}

export const INTRO_CARD_MIN_HEIGHT = 110

export function IntroCardStack({ cards, keyExtractor, onSwiped }: IntroCardStackProps): JSX.Element {
  return (
    <SwipeableCardStack
      cards={cards}
      keyExtractor={keyExtractor}
      minCardHeight={INTRO_CARD_MIN_HEIGHT}
      renderCard={(card) => <IntroCard {...card} />}
      onSwiped={onSwiped}
    />
  )
}
