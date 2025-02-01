// import { Trans } from 'uniswap/src/i18n'
import Card from 'components/Card'
import { LoadingRows } from 'components/Loader/styled'
import { RowBetween } from 'components/Row'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import styled, { css, useTheme } from 'lib/styled-components'
import { darken } from 'polished'
import React, { Dispatch, ReactNode, SetStateAction, useEffect } from 'react'
import { BarChart as BarChartIcon } from 'react-feather'
import { Bar, BarChart, Legend, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import { ThemedText } from 'theme/components'
import { unixToDate } from 'utils/time'

dayjs.extend(utc)

const DEFAULT_HEIGHT = 340

const Wrapper = styled(Card)`
  width: 100%;
  height: ${DEFAULT_HEIGHT}px;
  padding: 1rem;
  padding-right: 1rem;
  display: flex;
  background-color: ${({ theme }) => theme.surface1};
  flex-direction: column;
  > * {
    font-size: 1rem;
  }
`

const IconStyle = css`
  width: 48px;
  height: 48px;
  margin-bottom: 0.5rem;
`

const BarChartIconComponent = styled(BarChartIcon)`
  ${IconStyle}
`

type BarChartProps = {
  data: any[]
  color?: string
  color2?: string
  minHeight?: number
  setIndex: Dispatch<SetStateAction<number | undefined>>
  topLeft?: ReactNode
  topRight?: ReactNode
  bottomLeft?: ReactNode
  bottomRight?: ReactNode
} & React.HTMLAttributes<HTMLDivElement>

const Chart = ({ data, color = '#56B2A4', setIndex, topLeft, topRight }: BarChartProps) => {
  const theme = useTheme()
  const isEmptyData = !data || data.length === 0

  const CustomTooltip = (props: any) => {
    const payload = props.payload && props.payload.length > 0 ? props.payload[0] : undefined
    const index = payload ? payload.payload.index : undefined

    useEffect(() => {
      setIndex(index)
    }, [index])

    return null
  }

  return (
    <Wrapper backgroundColor={!isEmptyData ? theme.background : undefined}>
      <RowBetween>
        {isEmptyData ? null : (
          <>
            {topLeft ?? null}
            {topRight ?? null}
          </>
        )}
      </RowBetween>
      {data?.length === 0 ? (
        <LoadingRows>
          <div style={{ height: '250px' }} />
        </LoadingRows>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          {isEmptyData ? (
            <ThemedText.DeprecatedBody color={theme.accent1} textAlign="center" paddingTop="80px">
              <BarChartIconComponent strokeWidth={1} />
              <div>
                <>No volume data</>
              </div>
            </ThemedText.DeprecatedBody>
          ) : (
            <BarChart
              width={500}
              height={300}
              data={data}
              margin={{
                top: 5,
                right: 5,
                left: 5,
                bottom: 5,
              }}
            >
              <defs>
                <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={darken(0.36, color)} stopOpacity={0.5} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tickFormatter={(time) => dayjs(unixToDate(time)).format('DD')}
                minTickGap={10}
              />
              <Tooltip cursor={false} content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="current" type="monotone" stroke={color} fill={color} maxBarSize={80} />
            </BarChart>
          )}
        </ResponsiveContainer>
      )}
    </Wrapper>
  )
}

export default Chart
