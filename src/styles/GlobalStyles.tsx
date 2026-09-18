import { Global, css } from '@emotion/react'
import { theme as t } from './theme'

const styles = css`
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  html,
  body,
  #root {
    height: 100%;
  }

  /* 다크 전용 앱: 브라우저가 그리는 스크롤바·입력 요소도 어두운 쪽으로 */
  html {
    color-scheme: dark;
  }

  body {
    margin: 0;
    background: ${t.color.bg};
    color: ${t.color.text};
    font-family: ${t.font};
    font-size: 16px;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
    -webkit-tap-highlight-color: transparent;
  }

  h1,
  h2,
  h3,
  p {
    margin: 0;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  button,
  input {
    font: inherit;
    color: inherit;
  }

  a,
  button {
    /* 더블탭 확대 판정을 기다리지 않고 바로 반응 */
    touch-action: manipulation;
  }

  button {
    background: none;
    border: 0;
    padding: 0;
    cursor: pointer;
  }

  img,
  svg {
    display: block;
  }

  :focus-visible {
    outline: 2px solid ${t.color.accent};
    outline-offset: 2px;
  }
`

export default function GlobalStyles() {
  return <Global styles={styles} />
}
