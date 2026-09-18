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

  body {
    margin: 0;
    background: ${t.color.bg};
    color: ${t.color.text};
    font-family: ${t.font};
    font-size: 14px;
    line-height: 1.45;
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

  ::-webkit-scrollbar {
    display: none;
  }
`

export default function GlobalStyles() {
  return <Global styles={styles} />
}
