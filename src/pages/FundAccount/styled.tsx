import { AutoColumn } from 'components/Column'
import CurrencyInputPanel from 'components/CurrencyInputPanel'
import { LoadingRows as BaseLoadingRows } from 'components/Loader/styled'
import Input from 'components/NumericalInput'
import { BodyWrapper } from 'pages/AppBody'
import styled from 'styled-components/macro'

export const PageWrapper = styled(BodyWrapper)<{ wide: boolean }>`
  max-width: ${({ wide }) => (wide ? '1024px' : '480px')};
  width: 100%;

  padding: ${({ wide }) => (wide ? '10px' : '0')};

  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToMedium`
    max-width: 480px;
  `};
`

export const Wrapper = styled.div`
  position: relative;
  padding: 26px 16px;
  min-width: 480px;

  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToMedium`
    min-width: 400px;
  `};

  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToExtraSmall`
  min-width: 340px;
  `};
`

export const ScrollablePage = styled.div<{ navBarFlag: boolean }>`
  padding: ${({ navBarFlag }) => (navBarFlag ? '68px 8px 0px' : '0px')};
  position: relative;
  display: flex;
  flex-direction: column;

  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToMedium`
    max-width: 480px;
    margin: 0 auto;
  `};

  @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.md}px`}) {
    padding: ${({ navBarFlag }) => (navBarFlag ? '48px 8px 0px' : '0px 8px 0px')};
  }

  @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.sm}px`}) {
    padding-top: ${({ navBarFlag }) => (navBarFlag ? '20px' : '0px')};
  }
`

export const FundChart1Wrapper = styled(Wrapper)
export const FundChart2Wrapper = styled(Wrapper)
export const FundChart3Wrapper = styled(Wrapper)
export const MyChart1Wrapper = styled(Wrapper)
export const MyChart2Wrapper = styled(Wrapper)
export const MyChart3Wrapper = styled(Wrapper)
export const DepositWrapper = styled(Wrapper)
export const WithdrawWrapper = styled(Wrapper)
export const SwapWrapper = styled(Wrapper)

export const DynamicSection = styled(AutoColumn)<{ disabled?: boolean }>`
  opacity: ${({ disabled }) => (disabled ? '0.2' : '1')};
  pointer-events: ${({ disabled }) => (disabled ? 'none' : 'initial')};
`

export const CurrencyDropdown = styled(CurrencyInputPanel)`
  width: 48.5%;
`

export const StyledInput = styled(Input)`
  background-color: ${({ theme }) => theme.deprecated_bg0};
  text-align: left;
  font-size: 18px;
  width: 100%;
`

/* two-column layout where DepositAmount is moved at the very end on mobile. */
export const ResponsiveTwoColumns = styled.div<{ wide: boolean }>`
  display: grid;
  grid-column-gap: 50px;
  grid-row-gap: 15px;
  grid-template-columns: ${({ wide }) => (wide ? '1fr 1fr' : '1fr')};
  grid-template-rows: max-content;
  grid-auto-flow: row;

  padding-top: 20px;

  border-top: 1px solid ${({ theme }) => theme.deprecated_bg2};

  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToMedium`
    grid-template-columns: 1fr;

    margin-top: 0;
  `};
`

export const RightContainer = styled(AutoColumn)`
  grid-row: 1 / 3;
  grid-column: 2;
  height: fit-content;

  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToMedium`
  grid-row: 3 / 4;
  grid-column: 1;
  `};
`

export const StackedContainer = styled.div`
  display: grid;
`

export const StackedItem = styled.div<{ zIndex?: number }>`
  grid-column: 1;
  grid-row: 1;
  height: 100%;
  z-index: ${({ zIndex }) => zIndex};
`

export const MediumOnly = styled.div`
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToMedium`
    display: none;
  `};
`

export const HideMedium = styled.div`
  display: none;

  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToMedium`
    display: block;
  `};
`

export const LoadingRows = styled(BaseLoadingRows)`
  padding-top: 48px;
  min-width: 75%;
  max-width: 960px;
  grid-column-gap: 0.5em;
  grid-row-gap: 0.8em;
  grid-template-columns: repeat(3, 1fr);

  & > div:nth-child(4n + 1) {
    grid-column: 1 / 3;
  }
  & > div:nth-child(4n) {
    grid-column: 3 / 4;
    margin-bottom: 2em;
  }
`
