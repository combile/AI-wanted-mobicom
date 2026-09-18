import styled from '@emotion/styled'
import { formatViews } from '../lib/format'
import type { VideoItem } from '../lib/types'
import { theme as t } from '../styles/theme'

const Wrap = styled.a`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
`

const Thumb = styled.img`
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border-radius: ${t.radius.sm};
  background: ${t.color.surface};
`

const Title = styled.p`
  margin-top: 8px;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

const Meta = styled.p`
  font-size: 12px;
  color: ${t.color.dim};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

// 썸네일·영상 주소는 서버가 준 문자열을 쓰지 않고 id로 직접 만든다.
export default function VideoTile({ video }: { video: VideoItem }) {
  const id = encodeURIComponent(video.id)
  return (
    <Wrap href={`https://www.youtube.com/watch?v=${id}`} target="_blank" rel="noopener noreferrer">
      <Thumb src={`https://i.ytimg.com/vi/${id}/mqdefault.jpg`} alt="" loading="lazy" />
      <Title>{video.title}</Title>
      <Meta>
        {video.channelTitle}, 조회수 {formatViews(video.viewCount)}
      </Meta>
    </Wrap>
  )
}
