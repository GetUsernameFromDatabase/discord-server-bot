export type RedditSortType = 'hot' | 'new' | 'top' | 'rising';

export interface RedditFetchOptions {
  subreddit: string;
  sort?: RedditSortType;
  allowNSFW?: boolean;
  allowModeratorPost?: boolean;
  allowVideo?: boolean;
}

// https://jvilk.com/MakeTypes/
export interface RedditFetchResponse {
  kind: string;
  data: Data;
}
export interface Data {
  after: string;
  dist: number;
  modhash: string;
  geo_filter?: null;
  children?: ChildrenEntity[] | null;
  before?: null;
}
export interface ChildrenEntity {
  kind: string;
  data: Data1;
}
export interface Data1 {
  approved_at_utc?: null;
  subreddit: string;
  selftext: string;
  author_fullname: string;
  saved: boolean;
  mod_reason_title?: null;
  gilded: number;
  clicked: boolean;
  title: string;
  link_flair_richtext?:
    | LinkFlairRichtextEntityOrAuthorFlairRichtextEntity[]
    | null;
  subreddit_name_prefixed: string;
  hidden: boolean;
  pwls: number;
  link_flair_css_class: string;
  downs: number;
  thumbnail_height?: number | null;
  top_awarded_type?: null;
  hide_score: boolean;
  name: string;
  quarantine: boolean;
  link_flair_text_color: string;
  upvote_ratio: number;
  author_flair_background_color?: string | null;
  subreddit_type: string;
  ups: number;
  total_awards_received: number;
  media_embed: MediaEmbedOrSecureMediaEmbedOrGildingsOrVariants;
  thumbnail_width?: number | null;
  author_flair_template_id?: string | null;
  is_original_content: boolean;
  user_reports?: null[] | null;
  secure_media?: null;
  is_reddit_media_domain: boolean;
  is_meta: boolean;
  category?: null;
  secure_media_embed: MediaEmbedOrSecureMediaEmbedOrGildingsOrVariants;
  link_flair_text: string;
  can_mod_post: boolean;
  score: number;
  approved_by?: null;
  is_created_from_ads_ui: boolean;
  author_premium: boolean;
  thumbnail: string;
  edited: boolean;
  author_flair_css_class?: null;
  author_flair_richtext?:
    | (LinkFlairRichtextEntityOrAuthorFlairRichtextEntity1 | null)[]
    | null;
  gildings: Gildings;
  content_categories?: null;
  is_self: boolean;
  mod_note?: null;
  created: number;
  link_flair_type: string;
  wls: number;
  removed_by_category?: null;
  banned_by?: null;
  author_flair_type: string;
  domain: string;
  allow_live_comments: boolean;
  selftext_html?: null;
  likes?: null;
  suggested_sort: string;
  banned_at_utc?: null;
  view_count?: null;
  archived: boolean;
  no_follow: boolean;
  is_crosspostable: boolean;
  pinned: boolean;
  over_18: boolean;
  all_awardings?: (AllAwardingsEntity | null)[] | null;
  awarders?: null[] | null;
  media_only: boolean;
  link_flair_template_id: string;
  can_gild: boolean;
  spoiler: boolean;
  locked: boolean;
  author_flair_text?: string | null;
  treatment_tags?: null[] | null;
  visited: boolean;
  removed_by?: null;
  num_reports?: null;
  distinguished?: string | null;
  subreddit_id: string;
  author_is_blocked: boolean;
  mod_reason_by?: null;
  removal_reason?: null;
  link_flair_background_color: string;
  id: string;
  is_robot_indexable: boolean;
  report_reasons?: null;
  author: string;
  discussion_type?: null;
  num_comments: number;
  send_replies: boolean;
  whitelist_status: string;
  contest_mode: boolean;
  mod_reports?: null[] | null;
  author_patreon_flair: boolean;
  author_flair_text_color?: string | null;
  permalink: string;
  parent_whitelist_status: string;
  stickied: boolean;
  url: string;
  subreddit_subscribers: number;
  created_utc: number;
  num_crossposts: number;
  media?: null;
  is_video: boolean;
  post_hint?: string | null;
  url_overridden_by_dest?: string | null;
  preview?: Preview | null;
}
export interface LinkFlairRichtextEntityOrAuthorFlairRichtextEntity {
  e: string;
  t: string;
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface MediaEmbedOrSecureMediaEmbedOrGildingsOrVariants {}
export interface LinkFlairRichtextEntityOrAuthorFlairRichtextEntity1 {
  e: string;
  t: string;
}
export interface Gildings {
  gid_1?: number | null;
}
export interface AllAwardingsEntity {
  giver_coin_reward?: null;
  subreddit_id?: null;
  is_new: boolean;
  days_of_drip_extension?: null;
  coin_price: number;
  id: string;
  penny_donate?: null;
  award_sub_type: string;
  coin_reward: number;
  icon_url: string;
  days_of_premium?: null;
  tiers_by_required_awardings?: null;
  resized_icons?:
    | ResizedIconsEntityOrResizedStaticIconsEntityOrResolutionsEntityOrSource[]
    | null;
  icon_width: number;
  static_icon_width: number;
  start_date?: null;
  is_enabled: boolean;
  awardings_required_to_grant_benefits?: null;
  description: string;
  end_date?: null;
  sticky_duration_seconds?: null;
  subreddit_coin_reward: number;
  count: number;
  static_icon_height: number;
  name: string;
  resized_static_icons?:
    | ResizedIconsEntityOrResizedStaticIconsEntityOrResolutionsEntityOrSource[]
    | null;
  icon_format?: null;
  icon_height: number;
  penny_price?: null;
  award_type: string;
  static_icon_url: string;
}
export interface ResizedIconsEntityOrResizedStaticIconsEntityOrResolutionsEntityOrSource {
  url: string;
  width: number;
  height: number;
}
export interface Preview {
  images?: ImagesEntity[] | null;
  enabled: boolean;
}
export interface ImagesEntity {
  source: ResizedIconsEntityOrResizedStaticIconsEntityOrResolutionsEntityOrSource;
  resolutions?:
    | ResizedIconsEntityOrResizedStaticIconsEntityOrResolutionsEntityOrSource[]
    | null;
  variants: MediaEmbedOrSecureMediaEmbedOrGildingsOrVariants;
  id: string;
}
