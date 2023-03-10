import { Trans } from '@lingui/macro'
import Card from 'components/Card'
import { LoadingRows } from 'components/Loader/styled'
import { RowBetween } from 'components/Row'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { darken } from 'polished'
import React, { Dispatch, ReactNode, SetStateAction, useEffect } from 'react'
import { Bar, BarChart, Legend, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import styled, { useTheme } from 'styled-components/macro'
import { ThemedText } from 'theme'
import { unixToDate } from 'utils/date'

dayjs.extend(utc)

const DEFAULT_HEIGHT = 340

const Wrapper = styled(Card)`
  width: 100%;
  height: ${DEFAULT_HEIGHT}px;
  padding: 1rem;
  padding-right: 1rem;
  display: flex;
  background-color: ${({ theme }) => theme.deprecated_bg0};
  flex-direction: column;
  > * {
    font-size: 1rem;
  }
`

export type BarChartProps = {
  data: any[]
  color?: string | undefined
  color2?: string | undefined
  minHeight?: number
  setIndex: Dispatch<SetStateAction<number | undefined>>
  topLeft?: ReactNode | undefined
  topRight?: ReactNode | undefined
  bottomLeft?: ReactNode | undefined
  bottomRight?: ReactNode | undefined
} & React.HTMLAttributes<HTMLDivElement>

const Chart = ({
  data,
  color = '#56B2A4',
  setIndex,
  topLeft,
  topRight,
  bottomLeft,
  bottomRight,
  minHeight = DEFAULT_HEIGHT,
  ...rest
}: BarChartProps) => {
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
    <Wrapper>
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
            <ThemedText.DeprecatedBody color={theme.deprecated_text3} textAlign="center" paddingTop={'80px'}>
              <div>
                <Trans>No token data</Trans>
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
