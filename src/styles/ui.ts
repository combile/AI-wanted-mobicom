import { css } from '@emotion/react'
import styled from '@emotion/styled'
import { Link } from 'react-router-dom'
import { theme as t } from './theme'

export const Page = styled.div`
  padding: 4px 20px 32px;
`

export const Lead = styled.p`
  font-size: 14px;
  color: ${t.color.dim};
  margin-bottom: 16px;
`

/**
 * 카드. 기본은 풀어 두고, 목록의 한 항목이 아니라 독립된 한 덩어리인 곳에만 쓴다
 * (상세의 스코어 패널, 검색의 AI 요약, 레이더에서 고른 트렌드, 카테고리 셀).
 */
export const Card = styled.div`
  padding: 20px;
  border-radius: ${t.radius.md};
  background: ${t.color.surface};
`

/** 박스 없이 가는 구분선으로만 나뉘는 목록 */
export const Rows = styled.div`
  display: flex;
  flex-direction: column;

  > * + * {
    border-top: 1px solid ${t.color.border};
  }
`

/** 화면 좌우 패딩을 뚫고 나가는 가로 스크롤 줄 */
export const ScrollRow = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  /* 스크롤바는 이 가로 줄에서만 숨긴다. 페이지 전체의 스크롤바까지 숨기면 데스크톱에서 위치를 알 수 없다. */
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  margin: 0 -20px;
  padding: 0 20px;
`

/** 가로로 넘기는 타일 줄 */
export const TileScroll = styled(ScrollRow)`
  gap: 12px;

  > * {
    flex: 0 0 128px;
  }
`

/** 썸네일 타일 그리드. 기본 2열, data-cols="3"이면 3열 */
export const TileGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 28px 14px;

  &[data-cols='3'] {
    grid-template-columns: repeat(3, 1fr);
    gap: 20px 12px;
  }
`

export const Chip = styled.button`
  flex-shrink: 0;
  font-size: 13px;
  line-height: 1;
  padding: 9px 14px;
  border-radius: ${t.radius.pill};
  background: ${t.color.surface};
  color: ${t.color.dim};
  transition:
    background 0.15s,
    color 0.15s;

  &[aria-pressed='true'] {
    background: ${t.color.accent};
    color: ${t.color.accentInk};
    font-weight: 700;
  }

  /* 같은 화면의 두 번째 필터 줄: 라임을 또 쓰지 않는다 */
  &[data-quiet='true'] {
    background: none;
    padding: 9px 6px;
  }

  &[data-quiet='true'][aria-pressed='true'] {
    color: ${t.color.text};
  }
`

export const Section = styled.section`
  margin-top: 36px;
`

export const SectionHead = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 12px;
`

export const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.02em;
`

export const MoreLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  font-size: 13px;
  color: ${t.color.dim};
`

const buttonBase = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border-radius: ${t.radius.pill};
  font-size: 15px;
  font-weight: 700;
  padding: 13px 20px;
  white-space: nowrap;

  &:disabled {
    opacity: 0.4;
    cursor: default;
  }
`

const primary = css`
  ${buttonBase};
  background: ${t.color.accent};
  color: ${t.color.accentInk};
`

export const PrimaryButton = styled.button(primary)
export const PrimaryLink = styled(Link)(primary)

export const GhostButton = styled.button`
  ${buttonBase};
  background: ${t.color.surface2};
`

const iconButton = css`
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  color: ${t.color.text};

  &[aria-pressed='true'] {
    color: ${t.color.accent};
  }
`

export const IconButton = styled.button(iconButton)
export const IconLink = styled(Link)(iconButton)

export const Empty = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 72px 0;
  text-align: center;
  line-height: 1.6;
  color: ${t.color.dim};

  > svg {
    color: ${t.color.border};
  }
`

/** 다음 행동으로 이끄는 배너. 화면에 하나만 둔다. */
export const Banner = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 36px;
  padding: 18px 20px;
  border-radius: ${t.radius.md};
  background:
    radial-gradient(120% 140% at 100% 100%, ${t.color.accent}2e, transparent 60%),
    ${t.color.surface};
  font-size: 13px;
  line-height: 1.5;
  color: ${t.color.dim};

  strong {
    display: block;
    font-size: 16px;
    color: ${t.color.text};
  }

  &[data-tone='blue'] {
    background: ${t.color.blue};
    color: ${t.color.text};
  }
`

export const BannerArrow = styled.span`
  flex-shrink: 0;
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${t.color.bg};
  color: ${t.color.text};
`
