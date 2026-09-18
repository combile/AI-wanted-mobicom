// Material Icons. 배럴 import는 dev 서버가 수천 모듈을 읽게 하므로 경로로 하나씩 가져온다.
import type { SvgIconComponent } from '@mui/icons-material'
import CampaignRounded from '@mui/icons-material/CampaignRounded'
import SentimentVerySatisfiedRounded from '@mui/icons-material/SentimentVerySatisfiedRounded'
import MovieRounded from '@mui/icons-material/MovieRounded'
import MicRounded from '@mui/icons-material/MicRounded'
import CheckroomRounded from '@mui/icons-material/CheckroomRounded'
import AutoAwesomeRounded from '@mui/icons-material/AutoAwesomeRounded'
import RestaurantRounded from '@mui/icons-material/RestaurantRounded'
import PlaceRounded from '@mui/icons-material/PlaceRounded'
import BackpackRounded from '@mui/icons-material/BackpackRounded'
import LocalCafeRounded from '@mui/icons-material/LocalCafeRounded'
import PaletteRounded from '@mui/icons-material/PaletteRounded'
import SmartphoneRounded from '@mui/icons-material/SmartphoneRounded'
import SpaRounded from '@mui/icons-material/SpaRounded'
import TrendingUpRounded from '@mui/icons-material/TrendingUpRounded'
import BoltRounded from '@mui/icons-material/BoltRounded'
import WorkspacePremiumRounded from '@mui/icons-material/WorkspacePremiumRounded'
import PublicRounded from '@mui/icons-material/PublicRounded'
import TrendingDownRounded from '@mui/icons-material/TrendingDownRounded'
import RemoveCircleOutlineRounded from '@mui/icons-material/RemoveCircleOutlineRounded'
import HomeRounded from '@mui/icons-material/HomeRounded'
import HomeOutlined from '@mui/icons-material/HomeOutlined'
import ExploreRounded from '@mui/icons-material/ExploreRounded'
import ExploreOutlined from '@mui/icons-material/ExploreOutlined'
import RadarRounded from '@mui/icons-material/RadarRounded'
import BookmarkRounded from '@mui/icons-material/BookmarkRounded'
import BookmarkBorderRounded from '@mui/icons-material/BookmarkBorderRounded'
import GridViewRounded from '@mui/icons-material/GridViewRounded'
import GridViewOutlined from '@mui/icons-material/GridViewOutlined'
import SearchRounded from '@mui/icons-material/SearchRounded'
import ArrowBackIosNewRounded from '@mui/icons-material/ArrowBackIosNewRounded'
import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded'
import CheckRounded from '@mui/icons-material/CheckRounded'
import IosShareRounded from '@mui/icons-material/IosShareRounded'
import ChevronRightRounded from '@mui/icons-material/ChevronRightRounded'
import NorthEastRounded from '@mui/icons-material/NorthEastRounded'
import SouthEastRounded from '@mui/icons-material/SouthEastRounded'

export const ICONS = {
  // categories
  megaphone: CampaignRounded,
  laugh: SentimentVerySatisfiedRounded,
  clapperboard: MovieRounded,
  mic: MicRounded,
  shirt: CheckroomRounded,
  sparkles: AutoAwesomeRounded,
  utensils: RestaurantRounded,
  mapPin: PlaceRounded,
  backpack: BackpackRounded,
  coffee: LocalCafeRounded,
  palette: PaletteRounded,
  smartphone: SmartphoneRounded,
  // statuses
  sprout: SpaRounded,
  trendingUp: TrendingUpRounded,
  bolt: BoltRounded,
  peak: WorkspacePremiumRounded,
  globe: PublicRounded,
  trendingDown: TrendingDownRounded,
  over: RemoveCircleOutlineRounded,
  // nav (선택됨 = 채움, 아니면 외곽선)
  home: HomeRounded,
  homeOutline: HomeOutlined,
  compass: ExploreRounded,
  compassOutline: ExploreOutlined,
  radar: RadarRounded,
  bookmark: BookmarkRounded,
  bookmarkOutline: BookmarkBorderRounded,
  grid: GridViewRounded,
  gridOutline: GridViewOutlined,
  // ui
  search: SearchRounded,
  back: ArrowBackIosNewRounded,
  arrowRight: ArrowForwardRounded,
  check: CheckRounded,
  share: IosShareRounded,
  chevronRight: ChevronRightRounded,
  arrowUp: NorthEastRounded,
  arrowDown: SouthEastRounded,
} satisfies Record<string, SvgIconComponent>

export type IconName = keyof typeof ICONS
