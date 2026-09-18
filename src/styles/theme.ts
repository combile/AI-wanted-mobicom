export const theme = {
  color: {
    bg: '#0a0a0b',
    surface: '#161618',
    surface2: '#1e1f22',
    border: '#232427',
    /** 메인 컬러. 1위 타일·선택된 칩/탭·워드마크·차트 선·주요 버튼에만 쓴다. */
    accent: '#c6ff3d',
    accentInk: '#0a0a0b',
    blue: '#2f6bff',
    text: '#f4f4f2',
    dim: '#8e8e93',
    down: '#ff6b81',
    /** 썸네일 타일 바탕 (목업의 그레이지/블루/라임). 라임 계열이 화면을 덮지 않도록 중립 톤을 둘 둔다. */
    thumb: ['#e6e1d8', '#c3cdfb', '#dde0e6', '#d8f5a2'],
  },
  radius: { sm: '12px', md: '16px', lg: '24px', pill: '999px' },
  font: `'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Segoe UI', sans-serif`,
  shell: '480px',
} as const
